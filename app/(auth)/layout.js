import "@/app/globals.css";
import { ToastContainerWrapper } from "@/components/ui/ToastContainerWrapper";
import { ThemeProvider } from "@/context/ThemeProvider";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

const IBMSans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export default function AuthLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Theme Script - Must be first to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${IBMSans.className} bg-white dark:bg-zinc-950 smooth antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
          <ToastContainerWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
