'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase, uploadImage, getCatalog, addCatalogItem, completeOrder, updateUserCoins } from '@/lib/supabase';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('add-suit');

  // Add Suit Form State
  const [suitName, setSuitName] = useState('');
  const [suitPrice, setSuitPrice] = useState('');
  const [suitCategory, setSuitCategory] = useState('₹1500-3000');
  const [occasion, setOccasion] = useState('Festival');
  const [color, setColor] = useState('Pink');
  const [fabric, setFabric] = useState('Cotton');
  const [work, setWork] = useState('Print');
  const [coinsReward, setCoinsReward] = useState(150);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Orders and Users state (synced with Supabase / localStorage fallback)
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Default Passcode validation
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (passcode === 'Hansi2026') {
      setIsAuthorized(true);
      localStorage.setItem('msh_admin_auth', 'true');
    } else {
      alert('Invalid Passcode! Kripya sahi passcode dalein.');
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('msh_admin_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
    }

    if (isAuthorized) {
      loadMockDatabase();
    }
  }, [isAuthorized]);

  const loadMockDatabase = async () => {
    if (!supabase) {
      // Fallback: Load local storage registered users
      const userKeys = Object.keys(localStorage).filter(key => key.startsWith('msh_profile_'));
      const loadedUsers = userKeys.map(key => JSON.parse(localStorage.getItem(key)));
      
      // Map properties for UI naming compatibility
      const compatibleUsers = loadedUsers.map(u => ({
        name: u.name,
        phone: u.phone,
        coin_balance: u.coinBalance,
        referral_code: u.referralCode,
        history: u.history
      }));
      setUsers(compatibleUsers);

      // Mock some sample orders if none exist
      const storedOrders = localStorage.getItem('msh_orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        const compatibleOrders = parsedOrders.map(o => ({
          id: o.id,
          phone: o.phone,
          name: o.name || 'Test User',
          suit_id: o.suitId || o.suit_id,
          suit_name: o.suitName || o.suit_name,
          coins_used: o.coinsUsed !== undefined ? o.coinsUsed : o.coins_used,
          coins_to_earn: o.coinsToEarn !== undefined ? o.coinsToEarn : o.coins_to_earn,
          total: o.total,
          status: o.status,
          date: o.date
        }));
        setOrders(compatibleOrders);
      } else {
        const sampleOrders = [
          {
            id: 'ORD-9482',
            phone: '9876543210',
            name: 'Priya Sharma',
            suit_id: 'MSH-001',
            suit_name: 'Bridal Maroon Zari Silk',
            coins_used: 200,
            coins_to_earn: 450,
            total: '₹5,000',
            status: 'Pending',
            date: '2026-07-05'
          }
        ];
        localStorage.setItem('msh_orders', JSON.stringify(sampleOrders));
        setOrders(sampleOrders);
      }
      return;
    }

    try {
      // Load users from Supabase
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userErr) throw userErr;
      setUsers(userData || []);

      // Load orders from Supabase
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderErr) throw orderErr;
      setOrders(orderData || []);
    } catch (err) {
      console.error('Error loading database from Supabase:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('msh_admin_auth');
    setIsAuthorized(false);
    setPasscode('');
  };

  // Suit Uploader Submission
  const handleSuitSubmit = async (e) => {
    e.preventDefault();
    if (!suitName || !suitPrice) {
      alert('Kripya suit details fill karein.');
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = '/demo/suit-placeholder.svg';
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const newSuit = {
        id: `MSH-${String(Math.floor(Math.random() * 900) + 100)}`,
        name: suitName,
        priceRange: suitPrice,
        priceCategory: suitCategory,
        occasion,
        color,
        fabric,
        work,
        image: imageUrl,
        coinsReward: Number(coinsReward),
        colorHex: '#C2185B',
        active: true
      };

      const result = await addCatalogItem(newSuit);
      if (result.success) {
        setUploadSuccess(true);
        resetSuitForm();
        loadMockDatabase();
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert('Error adding suit: ' + result.error);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetSuitForm = () => {
    setSuitName('');
    setSuitPrice('');
    setCoinsReward(150);
    setImagePreview('');
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete Order & Sync Coins
  const handleCompleteOrder = async (orderId) => {
    if (!supabase) {
      // Fallback: LocalStorage coins sync
      const updatedOrders = orders.map(ord => {
        if (ord.id === orderId && ord.status === 'Pending') {
          const userProfileKey = `msh_profile_${ord.phone}`;
          const userProfile = JSON.parse(localStorage.getItem(userProfileKey));
          
          if (userProfile) {
            const prevBalance = userProfile.coinBalance;
            const newBalance = prevBalance - ord.coins_used + ord.coins_to_earn;
            
            userProfile.coinBalance = newBalance;
            userProfile.history.push({
              id: userProfile.history.length + 1,
              type: 'debit',
              amount: ord.coins_used,
              desc: `Redeemed in Order ${ord.id}`,
              date: new Date().toISOString().split('T')[0]
            });
            userProfile.history.push({
              id: userProfile.history.length + 1,
              type: 'credit',
              amount: ord.coins_to_earn,
              desc: `Reward for Order ${ord.id}`,
              date: new Date().toISOString().split('T')[0]
            });

            localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
          }
          return { ...ord, status: 'Completed' };
        }
        return ord;
      });

      localStorage.setItem('msh_orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      loadMockDatabase();
      alert('Order completed! Local coins synced successfully.');
      return;
    }

    try {
      const result = await completeOrder(orderId);
      if (result.success) {
        loadMockDatabase();
        alert('Order completed and user coins synced in Supabase!');
      } else {
        alert('Error completing order: ' + result.error);
      }
    } catch (err) {
      alert('Order completion failed: ' + err.message);
    }
  };

  // Manual Coin adjustment
  const adjustUserCoins = async (phone, amount) => {
    const user = users.find(u => u.phone === phone);
    if (!user) return;

    const newBalance = Math.max(0, user.coin_balance + amount);
    const historyLog = {
      id: (user.history || []).length + 1,
      type: amount > 0 ? 'credit' : 'debit',
      amount: Math.abs(amount),
      desc: 'Admin Adjustment',
      date: new Date().toISOString().split('T')[0]
    };

    if (!supabase) {
      // Fallback
      const key = `msh_profile_${phone}`;
      const profile = JSON.parse(localStorage.getItem(key));
      if (profile) {
        profile.coinBalance = newBalance;
        profile.history.push(historyLog);
        localStorage.setItem(key, JSON.stringify(profile));
        loadMockDatabase();
      }
      return;
    }

    try {
      const result = await updateUserCoins(phone, newBalance, historyLog);
      if (result.success) {
        loadMockDatabase();
      } else {
        alert('Error adjusting coins: ' + result.error);
      }
    } catch (err) {
      alert('Coin adjustment failed: ' + err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {!isAuthorized ? (
          /* 1. PASSCODE SCREEN */
          <div className={`${styles.authCard} glass-card`}>
            <h2>Admin Control Panel</h2>
            <p>Kripya passcode enter karke dashboard access karein.</p>
            <form onSubmit={handleAuthSubmit} className={styles.authForm}>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                required
              />
              <button type="submit" className="btn btn-primary" id="admin-auth-submit-btn">
                Dashboard Open Karein 🔐
              </button>
            </form>
          </div>
        ) : (
          /* 2. ADMIN DASHBOARD */
          <div className={styles.adminContainer}>
            <div className={styles.adminHeader}>
              <h2>The Modern Suit Hub — Admin Portal 🛠️</h2>
              <button className={styles.logoutLink} onClick={handleLogout} id="admin-logout-btn">
                🚪 Log Out
              </button>
            </div>

            {/* Sidebar/Top tabs */}
            <div className={styles.tabsRow}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'add-suit' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('add-suit')}
                type="button"
                id="admin-tab-add-suit"
              >
                📤 Upload New Suit
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('orders')}
                type="button"
                id="admin-tab-orders"
              >
                📋 Orders Registry
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'customers' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('customers')}
                type="button"
                id="admin-tab-customers"
              >
                👥 Manage Customers
              </button>
            </div>

            <div className={`${styles.tabContent} glass-card`}>
              {/* TAB 1: ADD NEW SUIT */}
              {activeTab === 'add-suit' && (
                <div className={styles.suitUploadSection}>
                  <h3>Upload New Suit to Supabase Storage & Catalog</h3>
                  
                  {uploadSuccess && (
                    <div className={styles.successMessage}>
                      🎉 Suit Catalog mein successfully add ho gaya! (Data written to Supabase table)
                    </div>
                  )}

                  <form onSubmit={handleSuitSubmit} className={styles.uploadForm}>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-title">Suit Title / Code</label>
                        <input
                          type="text"
                          id="suit-title"
                          value={suitName}
                          onChange={(e) => setSuitName(e.target.value)}
                          placeholder="e.g. MSH-013 Pink Velvet Silk"
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-price-range">Price Range</label>
                        <input
                          type="text"
                          id="suit-price-range"
                          value={suitPrice}
                          onChange={(e) => setSuitPrice(e.target.value)}
                          placeholder="e.g. ₹1800 - ₹2400"
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-price-cat">Budget Category</label>
                        <select id="suit-price-cat" value={suitCategory} onChange={(e) => setSuitCategory(e.target.value)}>
                          <option value="₹500-1500">₹500 - ₹1,500</option>
                          <option value="₹1500-3000">₹1,500 - ₹3,000</option>
                          <option value="₹3000-6000">₹3,000 - ₹6,000</option>
                          <option value="₹6000+">₹6,000+</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-occasion">Occasion</label>
                        <select id="suit-occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                          <option value="Bridal">Bridal</option>
                          <option value="Shaadi">Shaadi</option>
                          <option value="Festival">Festival</option>
                          <option value="Casual">Casual</option>
                          <option value="Office">Office</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-color">Color</label>
                        <select id="suit-color" value={color} onChange={(e) => setColor(e.target.value)}>
                          <option value="Maroon">Maroon</option>
                          <option value="Pink">Pink</option>
                          <option value="Blue">Blue</option>
                          <option value="Green">Green</option>
                          <option value="Yellow">Yellow</option>
                          <option value="Red">Red</option>
                          <option value="White">White</option>
                          <option value="Black">Black</option>
                          <option value="Cream">Cream</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-fabric">Fabric</label>
                        <select id="suit-fabric" value={fabric} onChange={(e) => setFabric(e.target.value)}>
                          <option value="Cotton">Cotton</option>
                          <option value="Chiffon">Chiffon</option>
                          <option value="Silk">Silk</option>
                          <option value="Georgette">Georgette</option>
                          <option value="Rayon">Rayon</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-work">Work Type</label>
                        <select id="suit-work" value={work} onChange={(e) => setWork(e.target.value)}>
                          <option value="Embroidery">Embroidery</option>
                          <option value="Plain">Plain</option>
                          <option value="Print">Print</option>
                          <option value="Zari">Zari</option>
                          <option value="Mirror work">Mirror work</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label htmlFor="suit-coins">Coins Rewards</label>
                        <input
                          type="number"
                          id="suit-coins"
                          value={coinsReward}
                          onChange={(e) => setCoinsReward(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className={styles.imageUploadBlock}>
                      <label>Suit Photo</label>
                      <div className={styles.uploadBox}>
                        {imagePreview ? (
                          <div className={styles.previewBox}>
                            <Image src={imagePreview} alt="Preview" width={100} height={130} className={styles.uploadedPreview} />
                            <button className={styles.removeImageBtn} onClick={() => { setImagePreview(''); setImageFile(null); }} type="button">
                              ✕ Remove
                            </button>
                          </div>
                        ) : (
                          <div className={styles.selectFileBox}>
                            <input type="file" onChange={handleImageChange} accept="image/*" className={styles.fileInput} />
                            <span>📁 Click to Select Photo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={isUploading} id="suit-submit-btn">
                      {isUploading ? 'Uploading to Supabase Storage...' : 'Publish Suit to Shop 🚀'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: PENDING ORDERS */}
              {activeTab === 'orders' && (
                <div className={styles.ordersSection}>
                  <h3>Orders and Coin Transactions Log</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>WhatsApp User</th>
                          <th>Selected Suit</th>
                          <th>Total</th>
                          <th>Coins Used</th>
                          <th>Coins Gained</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map(order => (
                            <tr key={order.id}>
                              <td><strong>{order.id}</strong></td>
                              <td>{order.name || 'User'} <br /><span className={styles.subtext}>+{order.phone}</span></td>
                              <td>{order.suit_name} <br /><span className={styles.subtext}>{order.suit_id}</span></td>
                              <td>{order.total}</td>
                              <td className={styles.redText}>-{order.coins_used}</td>
                              <td className={styles.greenText}>+{order.coins_to_earn}</td>
                              <td>
                                <span className={`${styles.statusLabel} ${order.status === 'Completed' ? styles.statusSuccess : styles.statusPending}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                {order.status === 'Pending' ? (
                                  <button 
                                    className="btn btn-whatsapp" 
                                    onClick={() => handleCompleteOrder(order.id)}
                                    id={`complete-order-btn-${order.id}`}
                                  >
                                    Complete & Add Coins ✅
                                  </button>
                                ) : (
                                  <span className={styles.completedCheck}>✓ Confirmed</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className={styles.noUsers}>
                              Koi orders log nahi hain.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className={styles.customersSection}>
                  <h3>Registered Customer Database</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                      <thead>
                        <tr>
                          <th>Customer Name</th>
                          <th>WhatsApp Number</th>
                          <th>Referral Code</th>
                          <th>Coin Balance</th>
                          <th>Manual Adjustment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map(user => (
                            <tr key={user.phone}>
                              <td><strong>{user.name}</strong></td>
                              <td>+{user.phone}</td>
                              <td><code>{user.referral_code}</code></td>
                              <td className={styles.balanceValCol}>🪙 {user.coin_balance}</td>
                              <td>
                                <div className={styles.adjustBtns}>
                                  <button className="btn btn-secondary" onClick={() => adjustUserCoins(user.phone, 50)} id={`add-50-coins-${user.phone}`}>
                                    +50 Coins
                                  </button>
                                  <button className="btn btn-outline" onClick={() => adjustUserCoins(user.phone, -50)} id={`sub-50-coins-${user.phone}`}>
                                    -50 Coins
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className={styles.noUsers}>
                              Abhi tak koi customers register nahi huye hain. Home ya Dashboard page par signup test karein.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
