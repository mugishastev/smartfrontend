import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import MarketplacePreview from "@/components/MarketplacePreview";
import HowItWorks from "@/components/HowItWorks";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Features />
      <MarketplacePreview />
      <HowItWorks />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
