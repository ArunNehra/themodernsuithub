'use client';

import styles from './FloatingWhatsApp.module.css';

export default function FloatingWhatsApp() {
  return (
    <a 
      href="https://wa.me/918571911277?text=Namaste%20The%20Modern%20Suit%20Hub!%20Mujhe%20aapke%20suits%20ke%20baare%20mein%20jaanna%20hai."
      target="_blank" 
      rel="noopener noreferrer" 
      className={`${styles.floatBtn} anim-pulse`}
      aria-label="Chat on WhatsApp"
      id="floating-whatsapp-widget"
    >
      <svg viewBox="0 0 24 24" className={styles.icon} fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.985L2 22l5.163-1.354c1.512.825 3.208 1.258 4.961 1.258 5.506 0 9.988-4.482 9.988-9.988C22.012 6.482 17.53 2 12.012 2zm6.657 14.39c-.273.766-1.583 1.464-2.186 1.542-.603.078-1.206.113-1.809.113-2.61-.1-5.187-1.1-7.203-3.116s-3.016-4.593-3.116-7.203c-.1-.603-.064-1.206.113-1.809.078-.603.776-1.913 1.542-2.186.27-.09.539-.126.809-.126.27 0 .539.036.809.126.634.331.956.956 1.206 1.704.25.748.25 1.496.25 2.244-.99.036-1.98.072-2.97.108.33.659.66 1.318 1.055 1.913 1.512 2.244 3.754 4.486 5.998 5.998.595.395 1.254.725 1.913 1.055.036-.99.072-1.98.108-2.97.748 0 1.496 0 2.244.25.748.25 1.373.572 1.704 1.206.09.27.126.539.126.809 0 .27-.036.539-.126.809z"/>
      </svg>
      <span className={styles.tooltip}>WhatsApp pe baat karo</span>
    </a>
  );
}
