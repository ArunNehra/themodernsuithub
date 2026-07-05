'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { suits } from '@/data/suits';
import styles from './page.module.css';

function VirtualTryOnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Read suit ID from URL parameters if redirected from Catalog card
  useEffect(() => {
    const suitId = searchParams.get('suit');
    if (suitId) {
      const match = suits.find(s => s.id === suitId);
      if (match) {
        setSelectedSuit(match);
      }
    } else if (suits.length > 0) {
      setSelectedSuit(suits[0]);
    }
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

  const runTryOn = () => {
    if (!userPhoto) {
      alert('Kripya apni photo upload karein pehle.');
      return;
    }
    if (!selectedSuit) {
      alert('Kripya try karne ke liye catalog se suit chunein.');
      return;
    }

    setIsProcessing(true);
    setLoadingProgress(10);
    setIsFallback(false);

    // Simulate Try-On loading states (Hugging Face ZeroGPU simulation)
    // In real scenario, this connects to Gradio client or replicate endpoint.
    // If it exceeds 6 seconds in our simulation, we trigger the fallback warning
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          // Trigger fallback since it takes longer than 20 seconds / is busy
          setIsProcessing(false);
          setIsFallback(true);
          return 90;
        }
        return prev + 15;
      });
    }, 800);
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
                    <p>
                      Hamare free AI Try-On server par load zyada hai. Aapka look manually generate karne ke liye click karke WhatsApp par apni photo aur selected suit automatically bhej dein. Hum 2 minute mein look generate karke wapas bhej denge!
                    </p>
                    <a 
                      href={getWhatsAppFallbackLink()} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-whatsapp anim-pulse"
                      id="tryon-whatsapp-fallback-btn"
                    >
                      WhatsApp Pe Look Mangwayein 💬
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
                {suits.map(suit => (
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
                ))}
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
              <p className={styles.rateLimitNote}>Guest limits: 2 try-ons/day. Register to get 10 try-ons.</p>
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
