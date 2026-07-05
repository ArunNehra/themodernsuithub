// Google Sheets API Connector
// Fallbacks to localStorage if the Google Apps Script Web App URL is not configured.

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

// Helper to check if database is live
const isDatabaseConfigured = () => {
  return !!APPS_SCRIPT_URL;
};

// 1. Catalog API Actions
export const getCatalog = async () => {
  if (!isDatabaseConfigured()) {
    // Fallback: load hardcoded demo suits + locally uploaded suits
    const localSuits = JSON.parse(localStorage.getItem('msh_local_catalog') || '[]');
    const { suits } = require('@/data/suits');
    return [...suits, ...localSuits];
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getCatalog`);
    const data = await res.json();
    return data.suits || [];
  } catch (err) {
    console.error('Error fetching Google Sheets Catalog:', err);
    return [];
  }
};

export const addCatalogItem = async (suitData) => {
  if (!isDatabaseConfigured()) {
    // Fallback: save to localStorage
    const localCatalog = JSON.parse(localStorage.getItem('msh_local_catalog') || '[]');
    localCatalog.push(suitData);
    localStorage.setItem('msh_local_catalog', JSON.stringify(localCatalog));
    return { success: true, data: suitData };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'addCatalog', data: suitData }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error adding item to Google Sheets:', err);
    return { success: false, error: err.message };
  }
};

// 2. User & Coins API Actions
export const getUserProfile = async (phone) => {
  if (!isDatabaseConfigured()) {
    // Fallback: local profile read
    return JSON.parse(localStorage.getItem(`msh_profile_${phone}`));
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getUser&phone=${phone}`);
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
};

export const createUserProfile = async (phone, name) => {
  const defaultProfile = {
    name,
    phone,
    coinBalance: 50,
    referralCode: name.toLowerCase().replace(/\s+/g, '') + phone.slice(-4),
    totalReferrals: 0,
    history: [
      { id: 1, type: 'credit', amount: 50, desc: 'Welcome Bonus (Profile Created)', date: new Date().toISOString().split('T')[0] }
    ]
  };

  if (!isDatabaseConfigured()) {
    // Fallback: save local profile
    localStorage.setItem(`msh_profile_${phone}`, JSON.stringify(defaultProfile));
    localStorage.setItem('msh_user_phone', phone);
    localStorage.setItem('msh_user_name', name);
    return { success: true, user: defaultProfile };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createUser', data: defaultProfile }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error creating user profile:', err);
    return { success: false, error: err.message };
  }
};

// 3. Orders API Actions
export const createOrder = async (orderData) => {
  if (!isDatabaseConfigured()) {
    // Fallback: save to localStorage orders list
    const localOrders = JSON.parse(localStorage.getItem('msh_orders') || '[]');
    localOrders.push(orderData);
    localStorage.setItem('msh_orders', JSON.stringify(localOrders));
    return { success: true, order: orderData };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createOrder', data: orderData }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error creating order row:', err);
    return { success: false, error: err.message };
  }
};

export const completeOrder = async (orderId) => {
  if (!isDatabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'completeOrder', orderId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error completing order transaction:', err);
    return { success: false, error: err.message };
  }
};

// 4. Leads / Form Submissions
export const submitLead = async (phone, source) => {
  const leadData = {
    phone,
    source,
    date: new Date().toISOString()
  };

  if (!isDatabaseConfigured()) {
    const leads = JSON.parse(localStorage.getItem('msh_contest_leads') || '[]');
    leads.push(leadData);
    localStorage.setItem('msh_contest_leads', JSON.stringify(leads));
    return { success: true };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submitLead', data: leadData }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error submitting lead form:', err);
    return { success: false, error: err.message };
  }
};
