import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";

export default function UnauthedQuestionsForumLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
