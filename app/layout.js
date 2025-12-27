import SessionTracker from "@/components/client/SessionTracker";
import SnowEffect from "@/components/client/SnowEffect";
// import TokenValidator from "@/components/client/TokenValidator";
import "@/app/globals.css";
import { ToastContainerWrapper } from "@/components/ui/ToastContainerWrapper";
import { ThemeProvider } from "@/context/ThemeProvider";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/libs/seo-config";
import { Almarai } from "next/font/google";

const almarai = Almarai({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

export const metadata = {
  title: {
    default: "دحيحة ميديكال - منصة التعلم الإلكتروني",
    template: "%s - دحيحة ميديكال",
  },
  description:
    "منصة تعليمية شاملة تقدم دورات تدريبية متنوعة في مجال الطب والعلوم الصحية. تعلم من أفضل الأطباء والمتخصصين في بيئة تفاعلية وآمنة.",
  keywords: [
    "تعلم إلكتروني",
    "دورات طبية",
    "تدريب طبي",
    "منصة تعليمية",
    "طب",
    "علوم صحية",
    "دحيحة ميديكال",
    "كورسات طبية",
    "تعليم طبي",
    "منصة e-learning",
  ],
  authors: [{ name: "دحيحة ميديكال" }],
  creator: "دحيحة ميديكال",
  publisher: "دحيحة ميديكال",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "دحيحة ميديكال - منصة التعلم الإلكتروني",
    description:
      "منصة تعليمية شاملة تقدم دورات تدريبية متنوعة في مجال الطب والعلوم الصحية.",
    siteName: "دحيحة ميديكال",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "دحيحة ميديكال - منصة التعلم الإلكتروني",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "دحيحة ميديكال - منصة التعلم الإلكتروني",
    description:
      "منصة تعليمية شاملة تقدم دورات تدريبية متنوعة في مجال الطب والعلوم الصحية.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // TODO: Replace with actual verification codes from Google Search Console, Yandex, etc.
  // verification: {
  //   google: "your-google-site-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   yahoo: "your-yahoo-verification-code",
  // },
  category: "education",
  classification: "Educational Platform",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"
  ),
};

export default function RootLayout({ children }) {
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#3B82F6"
        />
        {/* Umami Analytics */}
        <script
          defer
          src="https://umami.usif.space/script.js"
          data-website-id="b66544ae-16df-4ce3-b059-42ea1899f394"
        />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
      </head>
      <body
        className={`${almarai.className} bg-white dark:bg-zinc-950 smooth antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* <TokenValidator /> */}
          <SessionTracker />
          <SnowEffect />
          {children}
          <ToastContainerWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
