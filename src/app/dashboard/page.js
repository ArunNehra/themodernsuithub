'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [activeTab, setActiveTab] = useState('coins');
  
  // User Data State (Mock synced with localStorage / Google Sheets fallback)
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    coinBalance: 50, // Welcome bonus
    referralCode: '',
    totalReferrals: 0,
    history: [
      { id: 1, type: 'credit', amount: 50, desc: 'Welcome Bonus (Profile Created)', date: '2026-07-05' }
    ]
  });

  useEffect(() => {
    // Check if user session exists in local storage
    const savedPhone = localStorage.getItem('msh_user_phone');
    const savedName = localStorage.getItem('msh_user_name');
    
    if (savedPhone && savedName) {
      setIsLoggedIn(true);
      setWhatsappNumber(savedPhone);
      setCustomerName(savedName);
      
      // Load user profile details
      const storedData = localStorage.getItem(`msh_profile_${savedPhone}`);
      if (storedData) {
        setUserData(JSON.parse(storedData));
      } else {
        const defaultProfile = {
          name: savedName,
          phone: savedPhone,
          coinBalance: 50,
          referralCode: savedName.toLowerCase().replace(/\s+/g, '') + savedPhone.slice(-4),
          totalReferrals: 0,
          history: [
            { id: 1, type: 'credit', amount: 50, desc: 'Welcome Bonus (Profile Created)', date: '2026-07-05' }
          ]
        };
        localStorage.setItem(`msh_profile_${savedPhone}`, JSON.stringify(defaultProfile));
        setUserData(defaultProfile);
      }
    }
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Kripya valid 10-digit WhatsApp number dalein.');
      return;
    }
    if (!customerName) {
      alert('Kripya apna naam dalein.');
      return;
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, ''); // Extract digits only
    localStorage.setItem('msh_user_phone', cleanPhone);
    localStorage.setItem('msh_user_name', customerName);
    
    // Load or create profile
    const storedData = localStorage.getItem(`msh_profile_${cleanPhone}`);
    let profile;
    if (storedData) {
      profile = JSON.parse(storedData);
    } else {
      profile = {
        name: customerName,
        phone: cleanPhone,
        coinBalance: 50,
        referralCode: customerName.toLowerCase().replace(/\s+/g, '') + cleanPhone.slice(-4),
        totalReferrals: 0,
        history: [
          { id: 1, type: 'credit', amount: 50, desc: 'Welcome Bonus (Profile Created)', date: '2026-07-05' }
        ]
      };
      localStorage.setItem(`msh_profile_${cleanPhone}`, JSON.stringify(profile));
    }
    
    setUserData(profile);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('msh_user_phone');
    localStorage.removeItem('msh_user_name');
    setIsLoggedIn(false);
    setWhatsappNumber('');
    setCustomerName('');
  };

  // Referral Sharing copy generators
  const getReferUrl = () => {
    return `https://themodernsuithub.com/ref/${userData.referralCode}`;
  };

  const getWhatsAppShareUrl = () => {
    const text = `Yaar! The Modern Suit Hub se suit liya — AI se styling advice li, ghar baithe virtual try-on kiya. Ekdum kamaal experience tha! Tu bhi dekh — mere link se join kar, dono ko ₹100 off milega 🎉 ${getReferUrl()}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const copyReferLink = () => {
    navigator.clipboard.writeText(getReferUrl());
    alert('Referral link copy ho gaya hai! WhatsApp ya Instagram par share karein.');
  };

  // Coin Value mapping
  const coinRules = [
    { coins: 50, discount: 25 },
    { coins: 100, discount: 50 },
    { coins: 200, discount: 100 },
    { coins: 500, discount: 300 },
    { coins: 1000, discount: 700 }
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        {!isLoggedIn ? (
          /* 1. LOGIN / REGISTRATION STATE */
          <div className={`${styles.loginCard} glass-card`}>
            <div className={styles.loginHeader}>
              <span className={styles.loginIcon}>🪙</span>
              <h2>Coins Dashboard Login</h2>
              <p>Apna phone number register karke <strong>50 Welcome Coins (₹25 discount)</strong> paayein.</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="login-name">Apna Naam (Name)</label>
                <input
                  type="text"
                  id="login-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="login-phone">WhatsApp Number</label>
                <input
                  type="tel"
                  id="login-phone"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" id="dashboard-login-submit-btn">
                Register & Coins Claim Karein 🪙
              </button>
            </form>
          </div>
        ) : (
          /* 2. LOGGED-IN ACCOUNT DASHBOARD */
          <div className={styles.dashboardContainer}>
            {/* Account Header */}
            <div className={`${styles.dashboardHeader} glass-card`}>
              <div className={styles.userInfo}>
                <span className={styles.userAvatar}>👤</span>
                <div>
                  <h2>Namaste, {userData.name}!</h2>
                  <p>WhatsApp ID: +91 {userData.phone}</p>
                </div>
              </div>
              <div className={styles.balanceBox}>
                <span className={styles.balanceLabel}>Coin Balance:</span>
                <span className={styles.balanceVal}>🪙 {userData.coinBalance}</span>
                <span className={styles.valInInr}>≈ ₹{userData.coinBalance / 2} Discount Value</span>
              </div>
            </div>

            {/* Main Tabs */}
            <div className={styles.tabsRow}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'coins' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('coins')}
                type="button"
                id="tab-coins-btn"
              >
                🪙 Coins Ledger & Rules
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'refer' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('refer')}
                type="button"
                id="tab-refer-btn"
              >
                🔗 Refer & Earn (₹100 Off)
              </button>
            </div>

            <div className={`${styles.tabContent} glass-card`}>
              {/* Tab A: COINS DATA */}
              {activeTab === 'coins' && (
                <div className={styles.coinsTab}>
                  {/* Ledger logs */}
                  <div className={styles.ledgerWrap}>
                    <h3>Coins History</h3>
                    <div className={styles.ledgerList}>
                      {userData.history.map(log => (
                        <div key={log.id} className={styles.ledgerItem}>
                          <div>
                            <p className={styles.logDesc}>{log.desc}</p>
                            <span className={styles.logDate}>{log.date}</span>
                          </div>
                          <span className={`${styles.logAmt} ${log.type === 'credit' ? styles.creditAmt : styles.debitAmt}`}>
                            {log.type === 'credit' ? '+' : '-'}{log.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculator/Rules */}
                  <div className={styles.rulesWrap}>
                    <h3>Coins Discount Value</h3>
                    <div className={styles.rulesList}>
                      {coinRules.map(rule => (
                        <div key={rule.coins} className={styles.ruleItem}>
                          <span className={styles.ruleCoins}>🪙 {rule.coins} Coins</span>
                          <span className={styles.ruleArrow}>➔</span>
                          <span className={styles.ruleDisc}>₹{rule.discount} Off on Bill</span>
                        </div>
                      ))}
                    </div>
                    <p className={styles.noteText}>💡 Note: Check-out karte waqt WhatsApp order message mein code select karke automatically discount apply ho jayega. Coins validation shop owner dwara WhatsApp payment verification ke time kiya jata hai.</p>
                  </div>
                </div>
              )}

              {/* Tab B: REFERRALS */}
              {activeTab === 'refer' && (
                <div className={styles.referTab}>
                  <div className={styles.referContent}>
                    <h3>Saheli ko refer karein aur ₹100 Off paayein!</h3>
                    <p className={styles.referDesc}>
                      Aapka referral link share karein. Jab aapki saheli pehla suit order karegi, toh unhe <strong>₹100 direct discount</strong> milega, aur aapko bhi <strong>₹100 off coupon + 150 coins bonus</strong> milenge.
                    </p>

                    <div className={styles.linkBox}>
                      <input type="text" readOnly value={getReferUrl()} className={styles.linkInput} />
                      <button className="btn btn-secondary" onClick={copyReferLink} id="copy-referral-link-btn">
                        Copy Link
                      </button>
                    </div>

                    <div className={styles.shareButtons}>
                      <a 
                        href={getWhatsAppShareUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-whatsapp"
                        id="share-whatsapp-referral-btn"
                      >
                        WhatsApp Status Pe Lagayein 📱
                      </a>
                    </div>

                    <div className={styles.referStats}>
                      <div className={styles.statBox}>
                        <span className={styles.statVal}>{userData.totalReferrals}</span>
                        <span className={styles.statLabel}>Successful Refers</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statVal}>🪙 {userData.totalReferrals * 150}</span>
                        <span className={styles.statLabel}>Referral Coins Earned</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.logoutBtnBox}>
              <button className={styles.logoutBtn} onClick={handleLogout} id="dashboard-logout-btn">
                🚪 Log Out (Switch Account)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
