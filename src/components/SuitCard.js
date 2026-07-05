'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './SuitCard.module.css';

export default function SuitCard({ suit }) {
  // Pre-filled WhatsApp message encoding
  const waMessage = encodeURIComponent(
    `Namaste The Modern Suit Hub! Mujhe ${suit.name} (${suit.id}) pasand hai jo ki catalog mein ${suit.priceRange} range ka hai. Kya yeh available hai?`
  );
  const waLink = `https://wa.me/918571911277?text=${waMessage}`;

  return (
    <div className={`${styles.card} glass-card`} id={`suit-card-${suit.id}`}>
      {/* Suit Image Container */}
      <div className={styles.imageContainer}>
        {/* Color Accent Underlay */}
        <div 
          className={styles.colorAccent} 
          style={{ backgroundColor: `${suit.colorHex}15` }}
        />
        <Image
          src={suit.image}
          alt={suit.name}
          width={300}
          height={380}
          className={styles.image}
          priority={suit.id === 'MSH-001'}
        />
        {/* Coins Reward Badge */}
        <div className={styles.coinsBadge}>
          🪙 {suit.coinsReward} Coins
        </div>
      </div>

      {/* Suit Details */}
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={`${styles.badge} badge badge-pink`}>{suit.occasion}</span>
          <span className={`${styles.badge} badge badge-dark`}>{suit.fabric}</span>
        </div>
        <h3 className={styles.name}>{suit.name}</h3>
        <p className={styles.price}>{suit.priceRange}</p>
        <div className={styles.tagsRow}>
          <span className={styles.tag}>Color: {suit.color}</span>
          <span className={styles.tag}>Work: {suit.work}</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.actions}>
        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-whatsapp"
          id={`order-btn-${suit.id}`}
        >
          WhatsApp Order 💬
        </a>
        <Link 
          href={`/tryon?suit=${suit.id}`} 
          className="btn btn-outline"
          id={`try-btn-${suit.id}`}
        >
          Virtual Try-On 🪞
        </Link>
      </div>
    </div>
  );
}
