import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ribbon from "@/components/Ribbon";
import Products from "@/components/Products";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  const [preselected, setPreselected] = useState(null);

  return (
    <div className="min-h-screen bg-brand-sand text-brand-ink" data-testid="home-page">
      <Navbar />
      <Hero />
      <Ribbon />
      <Products onOrder={setPreselected} />
      <Gallery />
      <Testimonials />
      <OrderForm preselected={preselected} onConsume={() => setPreselected(null)} />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
