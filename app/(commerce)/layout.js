import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function CommerceLayout({ children }) {
  return (
    <Navbar>
      {children}
      <Footer />
    </Navbar>
  );
}
