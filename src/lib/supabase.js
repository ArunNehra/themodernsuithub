import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- 1. Catalog Actions ---
export const getCatalog = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback: local catalog
    const localSuits = JSON.parse(localStorage.getItem('msh_local_catalog') || '[]');
    const { suits } = require('@/data/suits');
    return [...suits, ...localSuits];
  }

  try {
    const { data, error } = await supabase
      .from('catalog')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map lowercase PostgreSQL columns back to camelCase React properties
    const mappedCatalog = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      priceRange: row.pricerange || row.priceRange,
      priceCategory: row.pricecategory || row.priceCategory,
      occasion: row.occasion,
      color: row.color,
      fabric: row.fabric,
      work: row.work,
      image: row.image,
      coinsReward: row.coinsreward !== undefined ? row.coinsreward : row.coinsReward,
      colorHex: row.colorhex || row.colorHex,
      active: row.active
    }));
    
    return mappedCatalog;
  } catch (err) {
    console.error('Error fetching catalog from Supabase:', err);
    return [];
  }
};

export const addCatalogItem = async (suitData) => {
  if (!isDatabaseConfigured()) {
    const localCatalog = JSON.parse(localStorage.getItem('msh_local_catalog') || '[]');
    localCatalog.push(suitData);
    localStorage.setItem('msh_local_catalog', JSON.stringify(localCatalog));
    return { success: true, data: suitData };
  }

  // Map camelCase to lowercase PostgreSQL columns
  const dbData = {
    id: suitData.id,
    name: suitData.name,
    pricerange: suitData.priceRange,
    pricecategory: suitData.priceCategory,
    occasion: suitData.occasion,
    color: suitData.color,
    fabric: suitData.fabric,
    work: suitData.work,
    image: suitData.image,
    coinsreward: suitData.coinsReward,
    colorhex: suitData.colorHex,
    active: suitData.active
  };

  try {
    const { data, error } = await supabase
      .from('catalog')
      .insert([dbData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error adding suit to Supabase:', err);
    return { success: false, error: err.message };
  }
};

// --- 2. Image Upload ---
export const uploadImage = async (file, bucketName = 'suit-images') => {
  if (!isSupabaseConfigured()) {
    // Fallback: local base64 preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) throw error;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Error uploading image to Supabase Storage:', err);
    throw new Error('Image upload failed: ' + err.message);
  }
};

// --- 3. User & Coins Actions ---
export const getUserProfile = async (phone) => {
  if (!isSupabaseConfigured()) {
    return JSON.parse(localStorage.getItem(`msh_profile_${phone}`));
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('Error fetching user profile from Supabase:', err);
    return null;
  }
};

export const createUserProfile = async (phone, name) => {
  const defaultProfile = {
    name,
    phone,
    coin_balance: 50,
    referral_code: name.toLowerCase().replace(/\s+/g, '') + phone.slice(-4),
    total_referrals: 0,
    history: [
      { id: 1, type: 'credit', amount: 50, desc: 'Welcome Bonus (Profile Created)', date: new Date().toISOString().split('T')[0] }
    ]
  };

  if (!isSupabaseConfigured()) {
    localStorage.setItem(`msh_profile_${phone}`, JSON.stringify(defaultProfile));
    localStorage.setItem('msh_user_phone', phone);
    localStorage.setItem('msh_user_name', name);
    return { success: true, user: defaultProfile };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([defaultProfile])
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (err) {
    console.error('Error creating user in Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const updateUserCoins = async (phone, newBalance, historyLog) => {
  if (!isSupabaseConfigured()) {
    const key = `msh_profile_${phone}`;
    const profile = JSON.parse(localStorage.getItem(key));
    if (profile) {
      profile.coinBalance = newBalance;
      profile.history.push(historyLog);
      localStorage.setItem(key, JSON.stringify(profile));
    }
    return { success: true };
  }

  try {
    // First, fetch current history array
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('history')
      .eq('phone', phone)
      .single();

    if (fetchErr) throw fetchErr;
    
    const updatedHistory = [...(user.history || []), historyLog];

    const { data, error } = await supabase
      .from('users')
      .update({ coin_balance: newBalance, history: updatedHistory })
      .eq('phone', phone)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (err) {
    console.error('Error updating user coins:', err);
    return { success: false, error: err.message };
  }
};

// --- 4. Orders Actions ---
export const createOrder = async (orderData) => {
  const formattedOrder = {
    id: orderData.id,
    phone: orderData.phone,
    suit_id: orderData.suitId,
    suit_name: orderData.suitName,
    coins_used: orderData.coinsUsed,
    coins_to_earn: orderData.coinsToEarn,
    total: orderData.total,
    status: 'Pending'
  };

  if (!isSupabaseConfigured()) {
    const localOrders = JSON.parse(localStorage.getItem('msh_orders') || '[]');
    localOrders.push(orderData);
    localStorage.setItem('msh_orders', JSON.stringify(localOrders));
    return { success: true, order: orderData };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([formattedOrder])
      .select()
      .single();

    if (error) throw error;
    return { success: true, order: data };
  } catch (err) {
    console.error('Error creating order in Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const completeOrder = async (orderId) => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    // 1. Fetch Order details
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr) throw orderErr;
    if (order.status === 'Completed') throw new Error('Order already completed');

    // 2. Fetch User details
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('phone', order.phone)
      .single();

    if (userErr) throw userErr;

    // 3. Calculate new balance & history logs
    const newBalance = user.coin_balance - order.coins_used + order.coins_to_earn;
    const newHistoryLogs = [
      ...(user.history || []),
      {
        id: (user.history || []).length + 1,
        type: 'debit',
        amount: order.coins_used,
        desc: `Redeemed in Order ${orderId}`,
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: (user.history || []).length + 2,
        type: 'credit',
        amount: order.coins_to_earn,
        desc: `Reward for Order ${orderId}`,
        date: new Date().toISOString().split('T')[0]
      }
    ];

    // 4. Run Transaction / batch update
    const { error: updateOrderErr } = await supabase
      .from('orders')
      .update({ status: 'Completed' })
      .eq('id', orderId);

    if (updateOrderErr) throw updateOrderErr;

    const { error: updateUserErr } = await supabase
      .from('users')
      .update({ coin_balance: newBalance, history: newHistoryLogs })
      .eq('phone', order.phone);

    if (updateUserErr) throw updateUserErr;

    return { success: true };
  } catch (err) {
    console.error('Error completing transaction in Supabase:', err);
    return { success: false, error: err.message };
  }
};

// --- 5. Leads / Form Submissions ---
export const submitLead = async (phone, source) => {
  const leadData = {
    phone,
    source,
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured()) {
    const leads = JSON.parse(localStorage.getItem('msh_contest_leads') || '[]');
    leads.push(leadData);
    localStorage.setItem('msh_contest_leads', JSON.stringify(leads));
    return { success: true };
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error submitting lead to Supabase:', err);
    return { success: false, error: err.message };
  }
};

// Internal configuration check helper
function isDatabaseConfigured() {
  return isSupabaseConfigured();
}
