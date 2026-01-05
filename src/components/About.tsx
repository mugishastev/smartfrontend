import { CheckCircle2 } from "lucide-react";

const About = () => {
  const features = [
    "Multi-tenant platform supporting multiple cooperatives",
    "Comprehensive member and financial management",
    "Integrated marketplace for product visibility",
    "Blockchain-anchored transparency for trust",
    "Mobile money integration via Paypack",
    "Role-based access control for security"
  ];

  return (
    <section id="about" className="py-24 bg-background flex flex-col items-center">
      {/* Title outside the card */}
      <h2 className="text-4xl md:text-4xl font-bold text-center text-foreground mb-10">
        About Smart Cooperative Hub
      </h2>

      {/* Card container */}
      <div className="max-w-5xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10">
        {/* Intro Paragraphs */}
        <div className="space-y-6 text-center">
          <p className="text-lg text-muted-foreground dark:text-white text-justify">
            Smart Cooperative Hub (SCH) is a revolutionary multi-tenant digital platform designed specifically for cooperatives in Rwanda. Our platform digitalizes cooperative operations, enabling efficient management of members, finances, products, and announcements.
          </p>
          <p className="text-lg text-muted-foreground dark:text-white text-justify">
            By connecting cooperatives with buyers through an integrated marketplace and leveraging blockchain technology for transparency, we're transforming how cooperatives operate and grow in the digital age.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md hover:scale-105 transition-transform duration-300"
            >
              <CheckCircle2 className="h-6 w-6 text-[#8ccc15] flex-shrink-0 mt-1" />
              <p className="text-lg text-foreground text-left">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
