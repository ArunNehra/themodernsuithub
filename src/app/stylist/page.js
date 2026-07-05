'use client';

import { useState } from 'react';
import Link from 'next/link';
import { suits } from '@/data/suits';
import SuitCard from '@/components/SuitCard';
import styles from './page.module.css';

const steps = [
  { id: 'skinTone', title: 'Skin Tone Select Karein' },
  { id: 'occasion', title: 'Occasion Choose Karein' },
  { id: 'budget', title: 'Budget Range Set Karein' },
  { id: 'style', title: 'Design Preferences' },
  { id: 'result', title: 'Hamari Recommendations' }
];

export default function AIStylist() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    skinTone: '',
    occasion: '',
    budget: '',
    neckline: '',
    sleeve: '',
    bottom: '',
    dupatta: ''
  });

  const skinToneOptions = [
    { label: 'Gori (Fair)', value: 'Gori', desc: 'Light & bright colors like soft pink, mint green, and pastels look stunning.', bg: '#FCE6DE' },
    { label: 'Wheatish (Medium)', value: 'Wheatish', desc: 'Rich tones like mustard, royal blue, emerald, and warm colors suit beautifully.', bg: '#EED9C4' },
    { label: 'Saanwli (Olive)', value: 'Saanwli', desc: 'Jewel tones, bright reds, whites, and vibrant shades compliment elegantly.', bg: '#DDB892' },
    { label: 'Dusky (Deep)', value: 'Dusky', desc: 'Deep maroon, gold, magenta, white, and warm earth tones look regal.', bg: '#B08968' }
  ];

  const occasionOptions = [
    { label: '👰 Bridal (Wedding)', value: 'Bridal', desc: 'Heavy embroidery, zari silk, and royal designs.' },
    { label: '🎉 Shaadi Guest', value: 'Shaadi', desc: 'Elegant partywear with designer necklines and rich fabrics.' },
    { label: '🪔 Festival / Pooja', value: 'Festival', desc: 'Bright colors, mirror work, and comfortable yet festive sets.' },
    { label: '👚 Casual / Daily', value: 'Casual', desc: 'Light cotton suits, easy-to-carry fabrics, and prints.' },
    { label: '💼 Office / Formal', value: 'Office', desc: 'Sophisticated prints, straight pants, and minimal necklines.' }
  ];

  const budgetOptions = [
    { label: '₹500 - ₹1,500 (Budget friendly)', value: '₹500-1500' },
    { label: '₹1,500 - ₹3,000 (Popular range)', value: '₹1500-3000' },
    { label: '₹3,000 - ₹6,000 (Premium wear)', value: '₹3000-6000' },
    { label: '₹6,000+ (Exclusive Bridal/Heavy designs)', value: '₹6000+' }
  ];

  const styleOptions = {
    neckline: ['Round neck', 'V-neck', 'Boat neck', 'Square neck', 'High neck'],
    sleeve: ['Full sleeves', '3/4 sleeves', 'Half sleeves', 'Sleeveless', 'Bell sleeves'],
    bottom: ['Salwar', 'Patiala', 'Palazzo', 'Straight pant', 'Churidar'],
    dupatta: ['Haan — Shoulders pe', 'Haan — Ek taraf', 'Nahi']
  };

  const handleSelect = (field, value) => {
    setSelections(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep === 0 && !selections.skinTone) return;
    if (currentStep === 1 && !selections.occasion) return;
    if (currentStep === 2 && !selections.budget) return;
    if (currentStep === 3 && (!selections.neckline || !selections.sleeve || !selections.bottom || !selections.dupatta)) return;
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const restartQuiz = () => {
    setSelections({
      skinTone: '',
      occasion: '',
      budget: '',
      neckline: '',
      sleeve: '',
      bottom: '',
      dupatta: ''
    });
    setCurrentStep(0);
  };

  // Rule-based Suit Recommendations
  const getRecommendations = () => {
    return suits.filter(suit => {
      // 1. Must match occasion
      if (suit.occasion !== selections.occasion) return false;
      // 2. Must match budget category
      if (suit.priceCategory !== selections.budget) return false;
      return true;
    });
  };

  const recommendedSuits = getRecommendations();

  // Custom AI Advice text generation
  const getStylistAdvice = () => {
    const { skinTone, occasion, neckline, sleeve, bottom } = selections;
    let colorAdvice = '';
    
    if (skinTone === 'Gori') colorAdvice = 'Light pink, sky blue, ya soft pastel mint green colors aap par behad pyaare lagenge.';
    if (skinTone === 'Wheatish') colorAdvice = 'Bright shades jaise yellow, royal blue aur warm maroon colors aapke skin tone ko bohot accha compliment karenge.';
    if (skinTone === 'Saanwli') colorAdvice = 'Royal blue, bright red, mustard, aur cream shades aapki personality par bohot rich look denge.';
    if (skinTone === 'Dusky') colorAdvice = 'Deep emerald green, rich maroon, dark black, aur golden accents waale fabrics aap par ekdum queen jaisa look denge.';

    return `Stylist Advice: ${colorAdvice} Aapke selected styling rules (${neckline} design, ${sleeve} aur comfort bottom mein ${bottom}) ke hisab se humne niche catalog se best options select kiye hain.`;
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Stepper Progress Bar */}
        {currentStep < 4 && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${(currentStep / 3) * 100}%` }}></div>
            {steps.slice(0, 4).map((step, idx) => (
              <div 
                key={step.id} 
                className={`${styles.stepBubble} ${idx <= currentStep ? styles.bubbleActive : ''}`}
                title={step.title}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        )}

        {/* Stepper Content */}
        <div className={`${styles.quizCard} glass-card`}>
          <h2 className={styles.stepTitle}>{steps[currentStep].title}</h2>

          {/* STEP 1: SKIN TONE */}
          {currentStep === 0 && (
            <div className={styles.optionsGrid}>
              {skinToneOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.optionBtn} ${selections.skinTone === opt.value ? styles.selectedOption : ''}`}
                  onClick={() => handleSelect('skinTone', opt.value)}
                  type="button"
                  id={`skintone-opt-${opt.value}`}
                >
                  <div className={styles.colorCircle} style={{ backgroundColor: opt.bg }} />
                  <div className={styles.optionDetails}>
                    <span className={styles.optionName}>{opt.label}</span>
                    <span className={styles.optionDesc}>{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: OCCASION */}
          {currentStep === 1 && (
            <div className={styles.optionsList}>
              {occasionOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.listBtn} ${selections.occasion === opt.value ? styles.selectedList : ''}`}
                  onClick={() => handleSelect('occasion', opt.value)}
                  type="button"
                  id={`occasion-opt-${opt.value}`}
                >
                  <div className={styles.optionDetails}>
                    <span className={styles.optionName}>{opt.label}</span>
                    <span className={styles.optionDesc}>{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 3: BUDGET */}
          {currentStep === 2 && (
            <div className={styles.optionsList}>
              {budgetOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.listBtn} ${selections.budget === opt.value ? styles.selectedList : ''}`}
                  onClick={() => handleSelect('budget', opt.value)}
                  type="button"
                  id={`budget-opt-${opt.value}`}
                >
                  <span className={styles.optionName}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 4: DESIGN STYLES */}
          {currentStep === 3 && (
            <div className={styles.styleForm}>
              {/* Neckline Selection */}
              <div className={styles.selectGroup}>
                <label htmlFor="neckline-select">Neckline preference kya hai?</label>
                <select
                  id="neckline-select"
                  value={selections.neckline}
                  onChange={(e) => handleSelect('neckline', e.target.value)}
                >
                  <option value="">Choose Neckline...</option>
                  {styleOptions.neckline.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Sleeve Selection */}
              <div className={styles.selectGroup}>
                <label htmlFor="sleeve-select">Sleeves size kya pasand hai?</label>
                <select
                  id="sleeve-select"
                  value={selections.sleeve}
                  onChange={(e) => handleSelect('sleeve', e.target.value)}
                >
                  <option value="">Choose Sleeves...</option>
                  {styleOptions.sleeve.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Bottom Selection */}
              <div className={styles.selectGroup}>
                <label htmlFor="bottom-select">Bottom style kya pehenna chahte hain?</label>
                <select
                  id="bottom-select"
                  value={selections.bottom}
                  onChange={(e) => handleSelect('bottom', e.target.value)}
                >
                  <option value="">Choose Bottom Style...</option>
                  {styleOptions.bottom.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Dupatta Selection */}
              <div className={styles.selectGroup}>
                <label htmlFor="dupatta-select">Dupatta setting preference?</label>
                <select
                  id="dupatta-select"
                  value={selections.dupatta}
                  onChange={(e) => handleSelect('dupatta', e.target.value)}
                >
                  <option value="">Choose Dupatta style...</option>
                  {styleOptions.dupatta.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: RECOMMENDATIONS */}
          {currentStep === 4 && (
            <div className={styles.resultContainer}>
              <div className={`${styles.stylistBox} glass`}>
                <div className={styles.stylistAvatar}>👩‍💼</div>
                <div className={styles.stylistMessage}>
                  <p>{getStylistAdvice()}</p>
                </div>
              </div>

              {/* Suits recommendations grid */}
              <h3 className={styles.gridHeading}>Suggested Designs:</h3>
              {recommendedSuits.length > 0 ? (
                <div className={styles.resultGrid}>
                  {recommendedSuits.map(suit => (
                    <SuitCard key={suit.id} suit={suit} />
                  ))}
                </div>
              ) : (
                <div className={styles.noMatchBox}>
                  <p>Aapke selected criteria (Budget aur Occasion) ke exact matches abhi available nahi hain. Kripya hamare catalog ko browse karein ya budget limit adjust karein.</p>
                  <Link href="/catalog" className="btn btn-primary" id="stylist-fallback-catalog">
                    Catalog Browse Karein 🛍️
                  </Link>
                </div>
              )}
              
              <div className={styles.restartBtnBox}>
                <button className="btn btn-outline" onClick={restartQuiz} id="stylist-restart-btn">
                  🔄 Test Dobara Karein
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {currentStep < 4 && (
            <div className={styles.controls}>
              {currentStep > 0 && (
                <button className="btn btn-outline" onClick={prevStep} id="stylist-back-btn">
                  ← Peeche
                </button>
              )}
              <button 
                className="btn btn-primary" 
                onClick={nextStep}
                style={{ marginLeft: 'auto' }}
                id="stylist-next-btn"
              >
                Aage →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
