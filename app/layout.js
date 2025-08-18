import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ToastContainerWrapper } from "@/components/ui/ToastContainerWrapper";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Zain } from "next/font/google";
import "./globals.css";

const ZainSans = Zain({
  subsets: ["latin"],
  variable: "--font-zain-sans",
  weight: ["200", "300", "400", "700", "800", "900"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${ZainSans.className} dark:bg-slate-950 smooth`}>
        <ThemeProvider>
          <ToastContainerWrapper />
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
