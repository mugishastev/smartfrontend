import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section id="home" className="h-[80vh] flex items-center pt-16 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Smart Cooperative Hub"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1e3d]/95 via-[#0a1e3d]/70 to-[#0a1e3d]/50"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-20 relative z-10">
        <div className="max-w-3xl">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Digital Solutions for Modern Cooperatives
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Streamline your cooperative management with our all-in-one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 bg-[#b7eb34] text-white hover:bg-[#a3d72f]">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
