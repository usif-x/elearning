# SEO Implementation Guide - دحيحة ميديكال

## Overview

This document describes the SEO metadata implementation for the e-learning platform. All admin routes are excluded from search engine indexing as requested.

## Implemented Features

### 1. **Root Metadata** (`/app/layout.js`)

- Global title template: `%s - دحيحة ميديكال`
- Comprehensive Arabic and English keywords
- OpenGraph and Twitter Card metadata
- JSON-LD structured data (Organization & Website schemas)
- Proper locale settings (ar_EG)
- MetadataBase for absolute URLs

### 2. **Page-Specific Metadata**

#### Public Pages (Indexed)

- **Homepage** (`/`) - Priority: 1.0
  - Title: "الصفحة الرئيسية"
  - Full SEO metadata with keywords
- **Courses Listing** (`/courses`) - Priority: 0.9
  - Title: "الدورات التدريبية"
  - Course-specific keywords and descriptions
- **Login** (`/login`) - Priority: 0.8
  - Title: "تسجيل الدخول"
  - Indexed for accessibility
- **Register** (`/register`) - Priority: 0.8
  - Title: "إنشاء حساب جديد"
  - Indexed to attract new users
- **Guest Questions Forum** (`/guest-questions-forum`) - Priority: 0.7
  - Title: "منتدى الأسئلة للزوار"
  - Indexed to showcase platform features
- **Profile** (`/profile`) - Priority: 0.6
  - Title: "الملف الشخصي"
  - Full SEO metadata with keywords
  - Indexed for user engagement
- **Community** (`/community`) - Priority: 0.7
  - Title: "المجتمع"
  - Full SEO metadata with keywords
  - Indexed to promote community features
- **Questions Forum** (`/questions-forum`) - Priority: 0.7
  - Title: "منتدى الأسئلة"
  - Full SEO metadata with keywords
  - Indexed for educational content discovery

#### Auth Utility Pages

- **Forgot Password** - `robots: { index: false }`
- **Logout** - Not indexed via robots.txt

### 3. **Admin Routes Protection**

All admin routes are blocked from indexing:

- Layout metadata: `robots: { index: false, follow: false, nocache: true }`
- robots.txt: `Disallow: /admin/`
- No sitemap entries for admin pages

### 4. **robots.txt** (`/public/robots.txt`)

```
User-agent: *
Allow: /
Allow: /login
Allow: /register
Allow: /courses
Allow: /guest-questions-forum
Allow: /profile
Allow: /community
Allow: /questions-forum

Disallow: /admin/
Disallow: /api/
...
```

### 5. **Dynamic Sitemap** (`/app/sitemap.js`)

- Automatically generates sitemap.xml
- Includes static public routes (homepage, login, register, courses, guest-questions-forum)
- Includes user pages (profile, community, questions-forum)
- Dynamically fetches and includes course pages
- Proper priority and change frequency settings

### 6. **Structured Data** (`/libs/seo-config.js`)

JSON-LD schemas for:

- Organization (EducationalOrganization)
- Website with SearchAction
- Course schema generator (for individual courses)
- Breadcrumb schema generator

## Production Checklist

### Before Deployment:

1. **Update Environment Variables**

   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-actual-domain.com
   ```

2. **Add Search Console Verification Codes**

   - Uncomment and update in `/app/layout.js`:

   ```javascript
   verification: {
     google: "your-actual-google-code",
     yandex: "your-actual-yandex-code",
   }
   ```

3. **Update Social Links** in `/libs/seo-config.js`

   ```javascript
   links: {
     twitter: "https://twitter.com/your-actual-handle",
     facebook: "https://facebook.com/your-actual-page",
     instagram: "https://instagram.com/your-actual-account",
   }
   ```

4. **Update robots.txt Sitemap URL**

   ```
   Sitemap: https://your-actual-domain.com/sitemap.xml
   ```

5. **Verify Image Assets**
   - Ensure `/images/logo.png` exists (1200x630px for OpenGraph)
   - Check all icon files in `/public/icons/`

### After Deployment:

1. Submit sitemap to Google Search Console
2. Submit sitemap to Bing Webmaster Tools
3. Test with:
   - Google Rich Results Test
   - Facebook Sharing Debugger
   - Twitter Card Validator
4. Monitor search console for indexing issues

## Metadata Strategy

### Public Pages (Should be indexed)

- Homepage
- Courses listing & individual courses
- Login/Register (for user acquisition)
- Guest features
- User profile pages
- Community section
- Questions forum

### Private Pages (Should NOT be indexed)

- Admin dashboard
- API routes
- Auth utility pages (forgot-password, logout)

## Notes

- All metadata uses Arabic as primary language (with English keywords)
- RTL support is properly configured
- Dynamic course metadata can be enhanced per-course
- Consider adding FAQ schema for better rich snippets
- Monitor Core Web Vitals for SEO ranking

## Future Enhancements

1. Add FAQ schema to common pages
2. Implement Article schema for blog posts (if added)
3. Add Video schema for course videos
4. Implement breadcrumb structured data on all pages
5. Add Review/Rating schema for courses
