import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "The Modern Suit Hub Hansi — Ladies Suits | AI Stylist | Budget to Bridal | Haryana",
  description: "Hansi ka pehla AI ladies suit store — ₹500 se bridal tak. AI Stylist, Virtual Try-On aur WhatsApp delivery. The Modern Suit Hub, Hansi Haryana.",
  keywords: "Ladies Suits, AI Stylist, Virtual Try-On, Suit Shop Hansi, Bridal Suits Haryana, Cotton Suits Hansi, The Modern Suit Hub",
  openGraph: {
    title: "The Modern Suit Hub Hansi — Ladies Suits | AI Stylist | Budget to Bridal | Haryana",
    description: "Hansi ka pehla AI ladies suit store — ₹500 se bridal tak. AI Stylist, Virtual Try-On aur WhatsApp delivery.",
    url: "https://themodernsuithub.com",
    siteName: "The Modern Suit Hub",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" className={poppins.variable}>
      <body style={{ paddingTop: "80px" }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
