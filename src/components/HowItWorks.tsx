const HowItWorks = () => {
  return (
    <section className="py-24 bg-background flex flex-col items-center">
      {/* Title same size as About / Features */}
      <h2 className="text-4xl md:text-4xl font-bold text-center text-foreground mb-12">
        How It Works
      </h2>

      {/* Image covering the page */}
      <div className="w-full flex justify-center">
        <img
          src="/steps.png"
          alt="How Smart Cooperative Hub Works"
          className="w-full max-w-6xl h-auto rounded-xl shadow-lg"
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
    </section>
  );
};

export default HowItWorks;
