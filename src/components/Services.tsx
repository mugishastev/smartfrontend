import { Building2, ShoppingCart, Wallet, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: "Cooperative Registration",
      description: "Seamless onboarding process with RCA integration and certificate verification for legitimate cooperatives."
    },
    {
      icon: ShoppingCart,
      title: "Digital Marketplace",
      description: "Access a wide network of buyers, showcase your products, and manage orders with built-in payment processing."
    },
    {
      icon: Wallet,
      title: "Paypack Integration",
      description: "Secure mobile money and bank transactions with MTN, Airtel, and bank coverage through Paypack integration."
    },
    {
      icon: FileText,
      title: "Regulatory Compliance",
      description: "Automated reporting tools for RCA compliance with transparent, blockchain-anchored financial records."
    }
  ];

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions designed to meet the unique needs of Rwandan cooperatives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex h-16 w-16 rounded-full bg-blue-900 items-center justify-center">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
