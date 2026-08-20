import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ribbon from "@/components/Ribbon";
import Products from "@/components/Products";
import Delivery from "@/components/Delivery";
import Story from "@/components/Story";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import NancyChat from "@/components/NancyChat";

export default function Home() {

  return (
    <div className="min-h-screen bg-brand-sand text-brand-ink" data-testid="home-page">
      <Navbar />
      <Hero />
      <Ribbon />
      <Products/>
      <Delivery />
      <Story />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Footer />
      <NancyChat />
    </div>
  );
}
