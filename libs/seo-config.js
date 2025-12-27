/**
 * SEO Configuration for دحيحة ميديكال E-Learning Platform
 * This file contains all SEO-related configurations for the application
 */

export const siteConfig = {
  name: "دحيحة ميديكال",
  nameEn: "Dahiha Medical",
  description:
    "منصة تعليمية شاملة تقدم دورات تدريبية متنوعة في مجال الطب والعلوم الصحية. تعلم من أفضل الأطباء والمتخصصين في بيئة تفاعلية وآمنة.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
  ogImage: "/images/logo.png",
  links: {
    twitter: "https://twitter.com/dahihamedical",
    facebook: "https://facebook.com/dahihamedical",
    instagram: "https://instagram.com/dahihamedical",
  },
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
    "medical courses",
    "online learning",
    "medical education",
  ],
};

/**
 * Generate JSON-LD structured data for better SEO
 */
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteConfig.name,
  alternateName: siteConfig.nameEn,
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.ogImage}`,
  description: siteConfig.description,
  sameAs: [
    siteConfig.links.twitter,
    siteConfig.links.facebook,
    siteConfig.links.instagram,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    availableLanguage: ["Arabic", "English"],
  },
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "ar",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/courses/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const generateCourseSchema = (course) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.name,
  description: course.description,
  provider: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  },
  image: course.image,
  offers: {
    "@type": "Offer",
    price: course.is_free ? "0" : course.price,
    priceCurrency: "EGP",
    availability: "https://schema.org/InStock",
  },
});

export const generateBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${siteConfig.url}${item.url}`,
  })),
});
