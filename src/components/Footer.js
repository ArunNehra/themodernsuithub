import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        {/* Brand Info */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logoLink}>
            <Image 
              src="/logo.svg" 
              alt="The Modern Suit Hub Logo" 
              width={60} 
              height={60} 
              className={styles.logo}
            />
            <span className={styles.brandName}>The Modern Suit Hub</span>
          </Link>
          <p className={styles.tagline}>"Ghar baithe try karo, dil se pasand karo."</p>
          <p className={styles.description}>
            Hansi ka pehla AI ladies suit store. Hum laaye hain virtual styling aur shopping ka ek naya aur modern anubhav.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.linksCol}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.linksList}>
            <li><Link href="/catalog" className={styles.link}>Shop Collection</Link></li>
            <li><Link href="/stylist" className={styles.link}>AI Stylist</Link></li>
            <li><Link href="/tryon" className={styles.link}>Virtual Try-On</Link></li>
            <li><Link href="/contest" className={styles.link}>Style Contest</Link></li>
            <li><Link href="/dashboard" className={styles.link}>My Coins Balance</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.contactCol}>
          <h3 className={styles.colTitle}>Contact Us</h3>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.icon}>📍</span>
              <span className={styles.text}>Hansi, Haryana, India</span>
            </li>
            <li>
              <span className={styles.icon}>💬</span>
              <a href="https://wa.me/918571911277" className={styles.link} id="footer-whatsapp-link">
                +91 8571911277 (WhatsApp)
              </a>
            </li>
            <li>
              <span className={styles.icon}>✉️</span>
              <a href="mailto:modernsuit31@gmail.com" className={styles.link} id="footer-email-link">
                modernsuit31@gmail.com
              </a>
            </li>
          </ul>
          {/* Social Icons */}
          <div className={styles.socials}>
            <a 
              href="https://www.instagram.com/themodern_suithub" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink}
              aria-label="Instagram"
              id="footer-insta-btn"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className="container">
          <p>© 2026 The Modern Suit Hub. Hansi, Haryana. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
