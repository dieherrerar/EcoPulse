
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../global.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
