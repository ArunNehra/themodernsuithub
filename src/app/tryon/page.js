'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCatalog, getUserProfile, updateUserCoins } from '@/lib/supabase';
import styles from './page.module.css';

function VirtualTryOnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [suits, setSuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Customize preferences
  const [neckline, setNeckline] = useState('Round neck');
  const [sleeve, setSleeve] = useState('3/4 sleeves');
  const [bottom, setBottom] = useState('Salwar');
  const [dupatta, setDupatta] = useState('Haan — Shoulders pe');

  const fileInputRef = useRef(null);

  // Load catalog and determine initial selection
  useEffect(() => {
    const loadCatalog = async () => {
      const data = await getCatalog();
      setSuits(data);
      
      const suitId = searchParams.get('suit');
      if (suitId) {
        const match = data.find(s => s.id === suitId);
        if (match) {
          setSelectedSuit(match);
        }
      } else if (data.length > 0) {
        setSelectedSuit(data[0]);
      }
      setLoading(false);
    };
    loadCatalog();
  }, [searchParams]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhotoPreview(reader.result);
        setResultImage(null); // Clear previous result
        setIsFallback(false);
      };
      reader.readAsDataURL(file);
    }
  };


  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Helper to convert File to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // Helper to fetch remote image URL and convert to Base64
  const urlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
    } catch (err) {
      throw new Error('Image load failed: ' + err.message);
    }
  };

  const runTryOn = async () => {
    if (!userPhoto) {
      alert('Kripya apni photo upload karein pehle.');
      return;
    }
    if (!selectedSuit) {
      alert('Kripya try karne ke liye catalog se suit chunein.');
      return;
    }

    // 1. Enforce Try-On daily limit check (3 Free Try-Ons)
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    let tryonDate = localStorage.getItem('msh_tryon_date');
    let tryonCount = parseInt(localStorage.getItem('msh_tryon_count') || '0', 10);

    if (tryonDate !== today) {
      tryonDate = today;
      tryonCount = 0;
      localStorage.setItem('msh_tryon_date', today);
      localStorage.setItem('msh_tryon_count', '0');
    }

    const isLoggedIn = !!localStorage.getItem('msh_user_phone');
    let isExtraPayNeeded = tryonCount >= 3;
    let userPhone = localStorage.getItem('msh_user_phone');

    if (isExtraPayNeeded) {
      if (!isLoggedIn) {
        alert('Aapki daily 3 free try-ons ki limit khatam ho gayi hai. Kripya My Account page par register/login karein aur extra try-ons ke liye coins use karein!');
        setIsFallback(true);
        return;
      }

      // Check user coins balance from Supabase
      setIsProcessing(true);
      setLoadingProgress(5);
      try {
        const profileRes = await getUserProfile(userPhone);
        if (!profileRes.success || !profileRes.user) {
          throw new Error('User profile fetch failed');
        }

        const balance = profileRes.user.coin_balance;
        if (balance < 50) {
          alert(`Aapki daily 3 free try-ons khatam ho gayi hain aur aapke paas 50 coins nahi hain. (Coin balance: 🪙 ${balance})\n\nCoins earn karne ke liye orders place karein ya saheliyon ko refer karein! Tab tak aap manually WhatsApp pe generate karwa sakte hain.`);
          setIsFallback(true);
          setIsProcessing(false);
          return;
        }

        const proceed = confirm(`Aapne aaj ki 3 free try-ons use kar li hain. Kya aap 50 coins deduct karke 1 extra try-on generate karna chahte hain?\n\nYour Current Balance: 🪙 ${balance} coins`);
        if (!proceed) {
          setIsProcessing(false);
          return;
        }

        // Deduct 50 coins
        const newBalance = balance - 50;
        const historyLog = {
          id: 'debit-' + Date.now(),
          desc: 'Used 50 coins for 1 extra virtual try-on',
          amount: 50,
          type: 'debit',
          date: new Date().toLocaleDateString('en-IN')
        };
        const updateRes = await updateUserCoins(userPhone, newBalance, historyLog);
        if (!updateRes.success) {
          throw new Error('Coin deduction failed: ' + updateRes.error);
        }
        
        alert(`🪙 50 coins successfully deduct ho gaye hain! Processing your extra try-on...`);
      } catch (err) {
        alert('Coin deduction failed: ' + err.message);
        setIsProcessing(false);
        return;
      }
    }

    setIsProcessing(true);
    setLoadingProgress(10);
    setIsFallback(false);

    try {
      setLoadingProgress(30);
      
      // Package images into FormData
      const formData = new FormData();
      formData.append('personImage', userPhoto);
      formData.append('clothUrl', selectedSuit.image);

      setLoadingProgress(55);
      
      // Call backend API route which runs server-side (CORS-free)
      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData
      });

      setLoadingProgress(80);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server returned status ${response.status}`);
      }

      const json = await response.json();
      setLoadingProgress(95);

      if (json.success && json.image) {
        setResultImage(json.image);
        
        // If they did not pay extra (it was a free one), increment their daily count
        if (!isExtraPayNeeded) {
          localStorage.setItem('msh_tryon_count', String(tryonCount + 1));
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.warn('Free API Try-On failed, falling back to manual WhatsApp:', err);
      setIsFallback(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pre-filled WhatsApp link for manual processing fallback
  const getWhatsAppFallbackLink = () => {
    if (!selectedSuit) return '#';
    const msg = encodeURIComponent(
      `Namaste The Modern Suit Hub! Maine virtual try-on try kiya tha par AI server busy hai. Mujhe is suit (${selectedSuit.name} - ${selectedSuit.id}) ka virtual try-on look chahiye. Neckline: ${neckline}, Sleeve: ${sleeve}, Bottom: ${bottom}, Dupatta: ${dupatta}. Maine apni photo attach kar di hai.`
    );
    return `https://wa.me/918571911277?text=${msg}`;
  };

  // WhatsApp order text if result was successful
  const getWhatsAppOrderLink = () => {
    if (!selectedSuit) return '#';
    const msg = encodeURIComponent(
      `Namaste! Maine ${selectedSuit.name} (${selectedSuit.id}) ka virtual try-on kiya. Look bohot pyaara lag raha hai. Mujhe yeh suit order karna hai. Stitching details finalize karein?`
    );
    return `https://wa.me/918571911277?text=${msg}`;
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h1>Virtual Try-On 🪞</h1>
          <p className={styles.subtitle}>
            Apni photo upload karein, design customize karein aur live check karein ki suit aap par kaisa lagega.
          </p>
        </div>

        {/* Main Work Area */}
        <div className={styles.layout}>
          
          {/* Left Canvas: Upload / Result */}
          <div className={`${styles.canvas} glass-card`}>
            {!userPhotoPreview ? (
              /* Initial Upload State */
              <div className={styles.uploadState} onClick={triggerFileInput}>
                <span className={styles.uploadIcon}>📸</span>
                <h3>Apni Photo Upload Karein</h3>
                <p>Webcam se photo khichein ya phone gallery se select karein</p>
                <button className="btn btn-secondary" type="button">
                  Choose Photo
                </button>
              </div>
            ) : (
              /* Edit Preview / Loader / Result State */
              <div className={styles.previewContainer}>
                {isProcessing ? (
                  /* Processing Loader */
                  <div className={styles.loaderWrap}>
                    <div className={styles.spinner}></div>
                    <h3>AI generating your look...</h3>
                    <p>Hansi AI Server is running (CatVTON model). Queue progress: {loadingProgress}%</p>
                  </div>
                ) : isFallback ? (
                  /* Busy Server Fallback Warning */
                  <div className={styles.fallbackWrap}>
                    <span className={styles.fallbackIcon}>⚠️</span>
                    <h3>AI Server Busy hai!</h3>
                    <p style={{ marginBottom: '10px' }}>
                      Hamare free AI Try-On server par load zyada hai. Lekin hum aapka look manually generate karke bhej denge!
                    </p>
                    
                    <div className={styles.instructionsBox} style={{
                      textAlign: 'left',
                      backgroundColor: 'rgba(194, 24, 91, 0.03)',
                      border: '1px dashed rgba(194, 24, 91, 0.2)',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      lineHeight: '1.6',
                      color: '#444',
                      width: '100%',
                      marginBottom: '20px'
                    }}>
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--primary-pink)', marginBottom: '8px' }}>
                        Aapko Kya Karna Hai? (2 Aasan Steps):
                      </strong>
                      <ol style={{ paddingLeft: '16px', margin: '0' }}>
                        <li style={{ marginBottom: '6px' }}>Niche <strong>"WhatsApp Pe Open Karein"</strong> par click karein. Chat open hote hi predefined text automatically type ho jayega.</li>
                        <li>Apni chat window mein attach (📎) ya camera icon par click karke <strong>apni photo select karke send kar dein</strong>.</li>
                      </ol>
                    </div>

                    <a 
                      href={getWhatsAppFallbackLink()} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-whatsapp anim-pulse"
                      id="tryon-whatsapp-fallback-btn"
                      style={{ width: '100%' }}
                    >
                      WhatsApp Pe Open Karein 💬
                    </a>
                    <button 
                      className={styles.retryBtn} 
                      onClick={() => setUserPhotoPreview('')}
                      id="tryon-upload-another-btn"
                    >
                      Choose Another Photo
                    </button>
                  </div>
                ) : resultImage ? (
                  /* Successful Result Display */
                  <div className={styles.resultWrap}>
                    <Image src={resultImage} alt="Try On Result" width={300} height={400} className={styles.resultImg} />
                    <div className={styles.resultActions}>
                      <a href={getWhatsAppOrderLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                        Yeh Look Chahiye (Order via WhatsApp) 💬
                      </a>
                    </div>
                  </div>
                ) : (
                  /* User Photo Uploaded View */
                  <div className={styles.uploadedView}>
                    <Image src={userPhotoPreview} alt="User Upload" width={300} height={400} className={styles.uploadedImg} />
                    <button className={styles.changePhotoBtn} onClick={triggerFileInput}>
                      Change Photo
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className={styles.hiddenInput}
            />
          </div>

          {/* Right Panel: Selectors & Customizers */}
          <div className={`${styles.panel} glass-card`}>
            {/* Suit Selector Selection */}
            <div className={styles.sectionGroup}>
              <h3>1. Suit Select Chunein</h3>
              <div className={styles.suitGrid}>
                {loading ? (
                  <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid var(--primary-pink)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : suits.length > 0 ? (
                  suits.map(suit => (
                    <button
                      key={suit.id}
                      className={`${styles.suitThumbBtn} ${selectedSuit?.id === suit.id ? styles.selectedThumb : ''}`}
                      onClick={() => setSelectedSuit(suit)}
                      type="button"
                      id={`tryon-select-suit-${suit.id}`}
                    >
                      <div className={styles.thumbAccent} style={{ backgroundColor: `${suit.colorHex}20` }} />
                      <Image src={suit.image} alt={suit.name} width={50} height={60} className={styles.thumbImg} />
                      <span className={styles.thumbName}>{suit.name}</span>
                    </button>
                  ))
                ) : (
                  <div style={{ gridColumn: 'span 4', fontSize: '12px', color: '#777', textAlign: 'center', padding: '10px 0' }}>
                    No suits available.
                  </div>
                )}
              </div>
            </div>

            {/* Customization Details Selection */}
            <div className={styles.sectionGroup}>
              <h3>2. Customization (Stitching preferences)</h3>
              
              <div className={styles.formGrid}>
                {/* Neckline select */}
                <div className={styles.selectGroup}>
                  <label htmlFor="tryon-neckline">Neckline</label>
                  <select id="tryon-neckline" value={neckline} onChange={(e) => setNeckline(e.target.value)}>
                    <option value="Round neck">Round neck</option>
                    <option value="V-neck">V-neck</option>
                    <option value="Boat neck">Boat neck</option>
                    <option value="Square neck">Square neck</option>
                    <option value="High neck">High neck</option>
                  </select>
                </div>

                {/* Sleeve select */}
                <div className={styles.selectGroup}>
                  <label htmlFor="tryon-sleeve">Sleeves</label>
                  <select id="tryon-sleeve" value={sleeve} onChange={(e) => setSleeve(e.target.value)}>
                    <option value="Full sleeves">Full sleeves</option>
                    <option value="3/4 sleeves">3/4 sleeves</option>
                    <option value="Half sleeves">Half sleeves</option>
                    <option value="Sleeveless">Sleeveless</option>
                    <option value="Bell sleeves">Bell sleeves</option>
                  </select>
                </div>

                {/* Bottom select */}
                <div className={styles.selectGroup}>
                  <label htmlFor="tryon-bottom">Bottom Style</label>
                  <select id="tryon-bottom" value={bottom} onChange={(e) => setBottom(e.target.value)}>
                    <option value="Salwar">Salwar</option>
                    <option value="Patiala">Patiala</option>
                    <option value="Palazzo">Palazzo</option>
                    <option value="Straight pant">Straight pant</option>
                    <option value="Churidar">Churidar</option>
                  </select>
                </div>

                {/* Dupatta select */}
                <div className={styles.selectGroup}>
                  <label htmlFor="tryon-dupatta">Dupatta Settings</label>
                  <select id="tryon-dupatta" value={dupatta} onChange={(e) => setDupatta(e.target.value)}>
                    <option value="Haan — Shoulders pe">Haan — Shoulders pe</option>
                    <option value="Haan — Ek taraf">Haan — Ek taraf</option>
                    <option value="Nahi">Nahi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Try-On Rules */}
            <div className={styles.sectionGroup}>
              <h3>3. Try-On Rules & Structure</h3>
              <div className={styles.rulesList}>
                <div className={styles.ruleRowHeader}>
                  <span>Situation</span>
                  <span>Extra Try-on</span>
                  <span>Cost</span>
                </div>
                {[
                  { sit: 'Roz — bilkul free', qty: '3 try-ons', cost: '₹0 (Free)' },
                  { sit: '50 coins use karo', qty: '+1 extra', cost: '50 coins' },
                  { sit: 'Purchase suit', qty: '+1 extra', cost: '₹0 (Included)' },
                  { sit: 'Story lagao aaj', qty: '+2 extra', cost: 'Marketing code' },
                  { sit: 'Reel daalo aaj', qty: '+3 extra', cost: 'Marketing code' },
                ].map((r, idx) => (
                  <div key={idx} className={styles.ruleRow}>
                    <span className={styles.ruleSit}>{r.sit}</span>
                    <span className={styles.ruleQty}>{r.qty}</span>
                    <span className={styles.ruleCost}>{r.cost}</span>
                  </div>
                ))}
              </div>
              <p className={styles.resetNote}>💡 Note: Daily 3 free try-ons automatically midnight (raat 12 baje) ke baad reset ho jate hain.</p>
            </div>

            {/* Run Button */}
            <div className={styles.actionBox}>
              <button 
                className="btn btn-primary btn-large" 
                onClick={runTryOn} 
                disabled={isProcessing}
                id="tryon-run-submit-btn"
              >
                {isProcessing ? 'AI Processing...' : '🪞 Try Suit Now'}
              </button>
              <p className={styles.rateLimitNote}>Daily Limit: 3 Free Try-Ons/day. Resets at Midnight.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VirtualTryOn() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid var(--primary-pink)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ fontWeight: '700' }}>Loading Try-On Canvas...</h3>
        </div>
      </div>
    }>
      <VirtualTryOnContent />
    </Suspense>
  );
}
