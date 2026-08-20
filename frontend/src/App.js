import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Navbar from "@/components/Navbar";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfSale from "@/pages/legal/TermsOfSale";
import RefundPolicy from "@/pages/legal/RefundPolicy";
import ShippingPolicy from "@/pages/legal/ShippingPolicy";
import CookiePolicy from "@/pages/legal/CookiePolicy";
import TermsOfUse from "@/pages/legal/TermsOfUse";
import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "@/components/ui/sonner";
import OrderPage from "@/components/OrderPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/commander" element={<OrderPage />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
          <Route path="/conditions-generales-vente" element={<TermsOfSale />} />
          <Route path="/politique-remboursement" element={<RefundPolicy />} />
          <Route path="/politique-livraison" element={<ShippingPolicy />} />
          <Route path="/politique-cookies" element={<CookiePolicy />} />
          <Route path="/conditions-utilisation" element={<TermsOfUse />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
