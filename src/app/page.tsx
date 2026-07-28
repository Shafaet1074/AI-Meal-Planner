"use client";

import About from "./components/About";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Navbar from "./components/Navbar";
import Pricing from "./components/Pricing/Pricning";






export default function LandingPage() {
  return (
    <div className="font-sans text-gray-800">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      {/* <About /> */}
      <Pricing />
      <Footer />
    </div>
  );
}
