import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Zain } from "next/font/google";
import "./globals.css";

const ZainSans = Zain({
  subsets: ["latin"],
  variable: "--font-zain-sans",
  weight: ["200", "300", "400", "700", "800", "900"],
});

export const metadata = {
  title: "E-Learning Platform",
  description: "An interactive platform for online learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${ZainSans.className} dark:bg-slate-950 smooth`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
