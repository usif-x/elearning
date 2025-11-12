import { ToastContainerWrapper } from "@/components/ui/ToastContainerWrapper";
import { ThemeProvider } from "@/context/ThemeProvider";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

const IBMSans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export default function AdminLayout({ children }) {
  return (
    <html lang="ar">
      <body className={`${IBMSans.className} bg-white dark:bg-zinc-950 smooth`}>
        <ThemeProvider>
          {children}
          <ToastContainerWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
