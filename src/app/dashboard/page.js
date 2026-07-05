'use client';

import { useState, useEffect } from 'react';
import { supabase, getUserProfile, createUserProfile } from '@/lib/supabase';
import styles from './page.module.css';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [activeTab, setActiveTab] = useState('coins');
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // User Data State (Synced with Supabase / local fallback)
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    coin_balance: 50,
    referral_code: '',
    total_referrals: 0,
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
      
      const loadProfile = async () => {
        setLoading(true);
        const profile = await getUserProfile(savedPhone);
        if (profile) {
          setUserData(profile);
        } else {
          // If profile missing on server but exists locally, re-create
          const result = await createUserProfile(savedPhone, savedName);
          if (result.success) {
            setUserData(result.user);
          }
        }
        setLoading(false);
      };
      loadProfile();
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!whatsappNumber || whatsappNumber.length < 10) {
      alert('Kripya valid 10-digit WhatsApp number dalein.');
      return;
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, ''); // Extract digits only
    setLoading(true);

    try {
      // Check if user already exists in database
      const profile = await getUserProfile(cleanPhone);

      if (profile) {
        // User exists: Log in instantly (No OTP needed for returning users)
        localStorage.setItem('msh_user_phone', cleanPhone);
        localStorage.setItem('msh_user_name', profile.name);
        setUserData(profile);
        setIsLoggedIn(true);
      } else {
        // User does not exist: Require WhatsApp OTP Verification
        if (!customerName) {
          alert('Aap naye customer hain! Kripya registration complete karne ke liye apna Naam (Name) enter karein.');
          setLoading(false);
          return;
        }

        // Generate verification code
        const code = String(Math.floor(1000 + Math.random() * 9000));
        setGeneratedOtp(code);
        setIsVerifying(true);

        // Open WhatsApp pre-filled window
        const waMsg = encodeURIComponent(`Namaste The Modern Suit Hub! Mera registration verification code hai: ${code}`);
        window.open(`https://wa.me/918571911277?text=${waMsg}`, '_blank');
      }
    } catch (err) {
      alert('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (userOtpInput !== generatedOtp) {
      alert('Incorrect Code! Kripya WhatsApp par bheja gaya sahi code enter karein.');
      return;
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, '');
    setLoading(true);

    try {
      let profile = await getUserProfile(cleanPhone);
      
      if (!profile) {
        // Create new user profile in Database
        const result = await createUserProfile(cleanPhone, customerName);
        if (result.success) {
          profile = result.user;
        } else {
          throw new Error(result.error);
        }
      }

      // Save locally
      localStorage.setItem('msh_user_phone', cleanPhone);
      localStorage.setItem('msh_user_name', profile.name);
      
      setUserData(profile);
      setIsLoggedIn(true);
      setIsVerifying(false);
      setUserOtpInput('');
    } catch (err) {
      alert('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
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
    return `https://themodernsuithub.com/ref/${userData.referral_code}`;
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
            {!isVerifying ? (
              /* Step A: Profile Input Form */
              <>
                <div className={styles.loginHeader}>
                  <span className={styles.loginIcon}>🪙</span>
                  <h2>Coins Dashboard Login</h2>
                  <p>Apna phone number register karke <strong>50 Welcome Coins (₹25 discount)</strong> paayein.</p>
                </div>
                
                <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="login-name">Apna Naam (Sirf naye user ke liye zaroori)</label>
                    <input
                      type="text"
                      id="login-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Priya Sharma (Returning users leave blank)"
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
                    Log In / Register ➔
                  </button>
                </form>
              </>
            ) : (
              /* Step B: OTP Validation Form */
              <>
                <div className={styles.loginHeader}>
                  <span className={styles.loginIcon}>💬</span>
                  <h2>WhatsApp Verification</h2>
                  <p>Verification window open ho gayi hai. Sended chat message confirm karke niche code enter karein.</p>
                </div>
                
                <form onSubmit={handleOtpVerification} className={styles.loginForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="otp-input">Verification Code</label>
                    <input
                      type="text"
                      id="otp-input"
                      value={userOtpInput}
                      onChange={(e) => setUserOtpInput(e.target.value)}
                      placeholder="Enter 4-digit code (e.g. 5842)"
                      maxLength={4}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-whatsapp" disabled={loading} id="dashboard-otp-verify-btn">
                    {loading ? 'Verifying...' : 'Verify & Dashboard Open Karein 🔑'}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      const waMsg = encodeURIComponent(`Namaste The Modern Suit Hub! Mera verification code hai: ${generatedOtp}`);
                      window.open(`https://wa.me/918571911277?text=${waMsg}`, '_blank');
                    }}
                    id="dashboard-otp-resend-btn"
                  >
                    Resend code via WhatsApp 🔄
                  </button>

                  <button 
                    type="button" 
                    className={styles.backBtn} 
                    onClick={() => setIsVerifying(false)}
                    style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', marginTop: '10px' }}
                    id="dashboard-otp-back-btn"
                  >
                    ← Form Edit Karein
                  </button>
                </form>
              </>
            )}
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
                <span className={styles.balanceVal}>🪙 {userData.coin_balance}</span>
                <span className={styles.valInInr}>≈ ₹{userData.coin_balance / 2} Discount Value</span>
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
                        <span className={styles.statVal}>{userData.total_referrals}</span>
                        <span className={styles.statLabel}>Successful Refers</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statVal}>🪙 {userData.total_referrals * 150}</span>
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
