export const metadata = {
  title: "المجتمع",
  description:
    "انضم إلى مجتمع دحيحة ميديكال وشارك مع الطلاب والمتخصصين في المجال الطبي.",
  keywords: ["مجتمع طبي", "منتدى طبي", "نقاش طبي", "مجتمع تعليمي", "شبكة طبية"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "المجتمع - دحيحة ميديكال",
    description:
      "انضم إلى مجتمع دحيحة ميديكال وشارك مع الطلاب والمتخصصين في المجال الطبي.",
    type: "website",
  },
};

export default function CommunityLayout({ children }) {
  return <>{children}</>;
}
