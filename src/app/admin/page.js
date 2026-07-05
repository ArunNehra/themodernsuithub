'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Orders and Users state (synced with localStorage)
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
    // Check if already authorized
    const auth = localStorage.getItem('msh_admin_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
    }

    // Load mock database entries from localStorage
    loadMockDatabase();
  }, [isAuthorized]);

  const loadMockDatabase = () => {
    // Load local storage registered users
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('msh_profile_'));
    const loadedUsers = userKeys.map(key => JSON.parse(localStorage.getItem(key)));
    setUsers(loadedUsers);

    // Mock some sample orders if none exist
    const storedOrders = localStorage.getItem('msh_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      const sampleOrders = [
        {
          id: 'ORD-9482',
          phone: '9876543210',
          name: 'Priya Sharma',
          suitId: 'MSH-001',
          suitName: 'Bridal Maroon Zari Silk',
          coinsUsed: 200,
          coinsToEarn: 450,
          total: '₹5,000',
          status: 'Pending',
          date: '2026-07-05'
        },
        {
          id: 'ORD-3810',
          phone: '8571911277',
          name: 'Sonia Malik',
          suitId: 'MSH-003',
          suitName: 'Royal Blue Georgette Festival',
          coinsUsed: 0,
          coinsToEarn: 220,
          total: '₹2,500',
          status: 'Completed',
          date: '2026-07-04'
        }
      ];
      localStorage.setItem('msh_orders', JSON.stringify(sampleOrders));
      setOrders(sampleOrders);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('msh_admin_auth');
    setIsAuthorized(false);
    setPasscode('');
  };

  // Suit Uploader Submission
  const handleSuitSubmit = (e) => {
    e.preventDefault();
    if (!suitName || !suitPrice) {
      alert('Kripya suit details fill karein.');
      return;
    }

    setIsUploading(true);

    // Simulate image uploading to Firebase Storage + writing row to Google Sheet
    setTimeout(() => {
      const newSuit = {
        id: `MSH-${String(Math.floor(Math.random() * 900) + 100)}`,
        name: suitName,
        priceRange: suitPrice,
        priceCategory: suitCategory,
        occasion,
        color,
        fabric,
        work,
        image: imagePreview || '/demo/suit-placeholder.svg',
        coinsReward: Number(coinsReward),
        colorHex: '#C2185B'
      };

      // Add to local catalog storage
      const localCatalog = JSON.parse(localStorage.getItem('msh_local_catalog') || '[]');
      localCatalog.push(newSuit);
      localStorage.setItem('msh_local_catalog', JSON.stringify(localCatalog));

      setIsUploading(false);
      setUploadSuccess(true);
      resetSuitForm();

      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const resetSuitForm = () => {
    setSuitName('');
    setSuitPrice('');
    setCoinsReward(150);
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete Order & Credit/Debit coins logic
  const handleCompleteOrder = (orderId) => {
    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId && ord.status === 'Pending') {
        // 1. Sync User Coins in LocalStorage
        const userProfileKey = `msh_profile_${ord.phone}`;
        const userProfile = JSON.parse(localStorage.getItem(userProfileKey));
        
        if (userProfile) {
          const prevBalance = userProfile.coinBalance;
          const newBalance = prevBalance - ord.coinsUsed + ord.coinsToEarn;
          
          userProfile.coinBalance = newBalance;
          userProfile.history.push({
            id: userProfile.history.length + 1,
            type: 'debit',
            amount: ord.coinsUsed,
            desc: `Redeemed in Order ${ord.id}`,
            date: new Date().toISOString().split('T')[0]
          });
          userProfile.history.push({
            id: userProfile.history.length + 1,
            type: 'credit',
            amount: ord.coinsToEarn,
            desc: `Reward for Order ${ord.id}`,
            date: new Date().toISOString().split('T')[0]
          });

          localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
        }

        // Return updated order status
        return { ...ord, status: 'Completed' };
      }
      return ord;
    });

    localStorage.setItem('msh_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    loadMockDatabase(); // Reload counts

    alert('Order mark completed! Customer coins updated automatically.');
  };

  // Manual Coin adjuster
  const adjustUserCoins = (phone, amount) => {
    const key = `msh_profile_${phone}`;
    const profile = JSON.parse(localStorage.getItem(key));
    if (profile) {
      profile.coinBalance = Math.max(0, profile.coinBalance + amount);
      profile.history.push({
        id: profile.history.length + 1,
        type: amount > 0 ? 'credit' : 'debit',
        amount: Math.abs(amount),
        desc: `Admin Adjustment`,
        date: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem(key, JSON.stringify(profile));
      loadMockDatabase();
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
                  <h3>Upload New Suit to Google Sheet Catalog</h3>
                  
                  {uploadSuccess && (
                    <div className={styles.successMessage}>
                      🎉 Suit Catalog mein successfully add ho gaya! (Data written to Catalog Google Sheet)
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
                            <button className={styles.removeImageBtn} onClick={() => setImagePreview('')} type="button">
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
                      {isUploading ? 'Uploading to Firebase Storage...' : 'Publish Suit to Shop 🚀'}
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
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td><strong>{order.id}</strong></td>
                            <td>{order.name} <br /><span className={styles.subtext}>+{order.phone}</span></td>
                            <td>{order.suitName} <br /><span className={styles.subtext}>{order.suitId}</span></td>
                            <td>{order.total}</td>
                            <td className={styles.redText}>-{order.coinsUsed}</td>
                            <td className={styles.greenText}>+{order.coinsToEarn}</td>
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
                        ))}
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
                              <td><code>{user.referralCode}</code></td>
                              <td className={styles.balanceValCol}>🪙 {user.coinBalance}</td>
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
