'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ContestTeaser() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set Target Date: 30 days from now or a fixed date like August 1, 2026
  useEffect(() => {
    const targetDate = new Date('2026-08-01T00:00:00+05:30').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Kripya valid 10-digit WhatsApp number dalein.');
      return;
    }

    setIsSubmitting(true);

    // Simulate Apps Script / Google Sheets API write delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Save locally to simulate database tracking
      const leads = JSON.parse(localStorage.getItem('msh_contest_leads') || '[]');
      leads.push({ phone, date: new Date().toISOString() });
      localStorage.setItem('msh_contest_leads', JSON.stringify(leads));
    }, 1200);
  };

  const prizes = [
    { rank: '👑 #1 Queen', reward: '50% Discount + Free Stitching', cond: 'Sabse Zyada Points' },
    { rank: '🌸 #2 & #3', reward: '30% Discount on Bill', cond: 'Best Suit Styling' },
    { rank: '🎀 #4 se #6', reward: '20% Discount on Bill', cond: 'Creative Outfit ideas' },
    { rank: '🛍️ Participants', reward: 'Guaranteed 5% Discount', cond: 'Contest Entry' }
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={`${styles.teaserCard} glass-card`}>
          {/* Header */}
          <div className={styles.header}>
            <span className={styles.contestBadge}>🏆 Launching Soon</span>
            <h1 className={styles.title}>Monthly Style Contest</h1>
            <p className={styles.tagline}>"Apna hunar dikhao, free stitching aur bhari discounts jeeto!"</p>
          </div>

          {/* Countdown Clock */}
          <div className={styles.countdownGrid}>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>{String(timeLeft.days).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Days</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Hours</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Mins</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.timeVal}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Secs</span>
            </div>
          </div>

          {/* Contest info */}
          <div className={styles.infoSection}>
            <h3>Contest Highlights:</h3>
            <div className={styles.prizesGrid}>
              {prizes.map((p, idx) => (
                <div key={idx} className={styles.prizeItem}>
                  <span className={styles.rank}>{p.rank}</span>
                  <span className={styles.reward}>{p.reward}</span>
                  <span className={styles.cond}>{p.cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Lead Capture */}
          <div className={styles.formSection}>
            {!isSubmitted ? (
              <form onSubmit={handleNotifySubmit} className={styles.notifyForm}>
                <p>Launch notification aur rules sheet seedha WhatsApp pe paane ke liye abhi register karein:</p>
                <div className={styles.inputWrap}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Apna WhatsApp Number dalein"
                    required
                    disabled={isSubmitting}
                  />
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="contest-notify-submit-btn">
                    {isSubmitting ? 'Registering...' : 'Meko Batana 🔔'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.successState}>
                <span className={styles.successIcon}>🎉</span>
                <h3>Danyawaad! Aapka registration ho gaya hai.</h3>
                <p>Contest launch hote hi aapko WhatsApp pe notifications aur rules sheet mil jayegi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
