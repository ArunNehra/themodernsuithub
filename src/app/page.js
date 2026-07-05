import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  const features = [
    {
      icon: '👗',
      title: 'AI Stylist',
      desc: 'Aapki skin tone aur occasion ke hisab se perfect suit suggest kare.',
      id: 'feat-stylist'
    },
    {
      icon: '🪞',
      title: 'Virtual Try-On',
      desc: 'Ghar baithe photo upload karke suit pehen ke dekho kaisa lagega.',
      id: 'feat-tryon'
    },
    {
      icon: '🪙',
      title: 'Coins Kamao',
      desc: 'Register aur refer karne pe milenge coins, agle order mein discount pao.',
      id: 'feat-coins'
    },
    {
      icon: '💬',
      title: 'WhatsApp Order',
      desc: 'Seedha click karo, chat pe sizes aur stitching final karke order karo.',
      id: 'feat-whatsapp'
    }
  ];

  const steps = [
    {
      num: '1',
      title: 'Suit Choose Karo',
      desc: 'Catalog dekho ya hamare AI Stylist se unique suggestions lo jo aap pe khilenge.',
      icon: '🛍️'
    },
    {
      num: '2',
      title: 'Virtual Try-On',
      desc: 'Apni photo upload karo aur live dekho dupatta aur neckline customize karke.',
      icon: '✨'
    },
    {
      num: '3',
      title: 'WhatsApp Pe Order',
      desc: 'Ek click pe order WhatsApp pe bhejo. Stitching options aur delivery details confirm karo.',
      icon: '📦'
    }
  ];

  const testimonials = [
    {
      name: 'Sunita Malik',
      location: 'Hansi',
      text: 'AI Stylist ne mujhe lavender color ka suit suggest kiya tha festival ke liye, sabne tareef ki! Virtual try-on se pehle hi check kar liya tha.',
      stars: '⭐⭐⭐⭐⭐'
    },
    {
      name: 'Pooja Verma',
      location: 'Hansi',
      text: 'Ghar baithe virtual try-on kiya aur WhatsApp par hi order de diya. Fitting bilkul perfect aayi aur delivery bhi bohot jaldi hui.',
      stars: '⭐⭐⭐⭐⭐'
    }
  ];

  return (
    <div className={styles.wrapper}>
      {/* 1. Hero Section */}
      <section className={`${styles.hero} anim-fade-in`}>
        <div className={`${styles.heroContainer} container`}>
          <div className={styles.heroContent}>
            <span className={styles.badgeText}>Hansi Ka Pehla AI Suit Store</span>
            <h1 className={`${styles.heroTitle} anim-slide-up`}>
              The Modern <br /><span className={styles.highlight}>Suit Hub</span>
            </h1>
            <p className={styles.heroTagline}>
              "Ghar baithe try karo, dil se pasand karo."
            </p>
            <div className={styles.heroCtas}>
              <Link href="/catalog" className="btn btn-primary" id="hero-shop-btn">
                Shop Collection 🛍️
              </Link>
              <Link href="/stylist" className="btn btn-outline" id="hero-stylist-btn">
                AI Stylist Se Baat Karo 👗
              </Link>
            </div>
          </div>
          <div className={`${styles.heroImageContainer} anim-float`}>
            <Image 
              src="/demo/suit-placeholder.svg" 
              alt="Premium Ladies Suit Design" 
              width={400} 
              height={500} 
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. Features Strip */}
      <section className={`${styles.featuresSection} section`}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {features.map((feat) => (
              <div key={feat.id} className={`${styles.featureCard} glass-card`} id={feat.id}>
                <span className={styles.featureIcon}>{feat.icon}</span>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Main Hinglish Brand Story */}
      <section className={`${styles.storySection} section`}>
        <div className="container">
          <div className={`${styles.storyCard} glass-card`}>
            <span className={styles.storyQuoteIcon}>“</span>
            <h2 className={styles.storyTitle}>Suit dekhna toh sabne dekha hai — lekin The Modern Suit Hub mein aake dekho, yahan suit aapko khud bulata hai.</h2>
            <div className={styles.storyDivider}></div>
            <div className={styles.storyBody}>
              <p>
                Hansi ki galiyon mein chupi ek aisi jagah jahan <strong>₹500 wala cotton suit</strong> bhi utna hi pyaara hai jitna <strong>₹6000 wala bridal piece</strong>. Haan, yahan budget aur quality mein se ek chunna nahi padta — dono milte hain, ek hi jagah.
              </p>
              <p>
                Aur jo cheez is jagah ko bilkul alag banati hai? Yahan aapke liye kaam karta hai ek <strong>AI Stylist</strong> — jo aapki skin tone dekhta hai, occasion jaanta hai, budget samjhta hai — aur phir suggest karta hai exactly woh suits jo aap pe sach mein khilenge.
              </p>
              <p>
                <strong>Virtual Try-On</strong> se ghar baithe pehno, pasand aaye toh WhatsApp pe order karo — stitched suit seedha ghar aayega.
              </p>
              <p className={styles.storyHighlight}>
                Koi pressure nahi, koi confusion nahi — bas aapka apna look, aapki apni marzi. Yahi toh hai The Modern Suit Hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className={`${styles.stepsSection} section`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Kaise Kaam Karta Hai?</h2>
          <p className={styles.sectionSubtitle}>Sirf teen aasan steps mein apna dream look paayein</p>
          
          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <div key={step.num} className={styles.stepItem}>
                <div className={styles.stepIconWrap}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <span className={styles.stepNum}>{step.num}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Price Banner */}
      <section className={styles.bannerSection}>
        <div className={`${styles.bannerContainer} container`}>
          <div className={styles.bannerContent}>
            <h2>₹500 Se Lekar ₹6000+ Bridal Collection Tak</h2>
            <p>Har budget ke liye sabse best quality fabric aur designer stitching, Hansi mein sabse pehli baar AI technology ke saath.</p>
            <div className={styles.bannerCtas}>
              <Link href="/catalog" className="btn btn-secondary" id="banner-catalog-btn">
                Browse Suit Collection 🛍️
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className={`${styles.reviewsSection} section`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Miliye Hamare Pyare Customers Se</h2>
          <p className={styles.sectionSubtitle}>Hansi ki ladies jo bani hain The Modern Suit Hub ka hissa</p>
          <div className={styles.reviewsGrid}>
            {testimonials.map((test, index) => (
              <div key={index} className={`${styles.reviewCard} glass-card`}>
                <span className={styles.stars}>{test.stars}</span>
                <p className={styles.reviewText}>"{test.text}"</p>
                <div className={styles.reviewerInfo}>
                  <span className={styles.reviewerName}>{test.name}</span>
                  <span className={styles.reviewerLoc}>, {test.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Last Call to Action */}
      <section className={`${styles.ctaSection} section`}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Apna Naya Favorite Suit Chuniye</h2>
            <p>Hamare AI Stylist se styling advice lein ya catalog mein suits try karein.</p>
            <div className={styles.ctaButtons}>
              <Link href="/stylist" className="btn btn-primary" id="footer-cta-stylist">
                👗 Try AI Stylist
              </Link>
              <Link href="/catalog" className="btn btn-outline" id="footer-cta-catalog">
                🛍️ View Full Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
