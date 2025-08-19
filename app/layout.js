import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ToastContainerWrapper } from "@/components/ui/ToastContainerWrapper";
import { ThemeProvider } from "@/context/ThemeProvider";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const IBMSans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"], // 👈 مهم تضيف "arabic"
  weight: ["100", "200", "300", "400", "500", "600", "700"], // 👈 من غير backticks
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${IBMSans.className} bg-white dark:bg-zinc-950 smooth`}>
        <ThemeProvider>
          <Navbar>
            {children}
            <Footer />
          </Navbar>

          <ToastContainerWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
