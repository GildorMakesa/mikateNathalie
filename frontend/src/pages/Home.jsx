import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ribbon from "@/components/Ribbon";
import Products from "@/components/Products";
import Delivery from "@/components/Delivery";
import Story from "@/components/Story";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import OrderForm from "@/components/OrderForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import NancyChat from "@/components/NancyChat";

export default function Home() {
  const [preselected, setPreselected] = useState(null);
  const [eventPreselected, setEventPreselected] = useState(null);

  // route preselected to either regular or event form based on target
  const handleOrder = (target) => (sel) => {
    if (target === "event") setEventPreselected(sel);
    else setPreselected(sel);
    setTimeout(() => {
      const id = target === "event" ? "evenements" : "commander";
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Listen for global events to focus event form
  useEffect(() => {
    const handler = () => {
      document.getElementById("evenements")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("mr:focus-events", handler);
    return () => window.removeEventListener("mr:focus-events", handler);
  }, []);

  return (
    <div className="min-h-screen bg-brand-sand text-brand-ink" data-testid="home-page">
      <Navbar />
      <Hero />
      <Ribbon />
      <Products onOrder={handleOrder("regular")} />
      <Delivery />
      <Story />
      <Gallery />
      <Testimonials />
      <OrderForm
        preselected={preselected}
        onConsume={() => setPreselected(null)}
        mode="regular"
        onSwitchMode={() => document.getElementById("evenements")?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
      <OrderForm
        preselected={eventPreselected}
        onConsume={() => setEventPreselected(null)}
        mode="event"
        onSwitchMode={() => document.getElementById("commander")?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
      <FAQ />
      <Footer />
      <NancyChat />
    </div>
  );
}
