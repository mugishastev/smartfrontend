const Features = () => {
  return (
    <section id="features" className="py-24 bg-background flex flex-col items-center">
      {/* Section Title same size as About */}
      <h2 className="text-4xl md:text-4xl font-bold text-center text-foreground mb-12">
        Key Features of Smart Cooperative Hub
      </h2>

      {/* Feature Image */}
      <div className="w-full flex justify-center">
        <img
          src="/feature.png"
          alt="Smart Cooperative Hub Features"
          className="w-full max-w-3xl h-auto rounded-xl shadow-lg"
          style={{ backgroundColor: 'transparent' }} // PNG needs transparency
        />
      </div>
    </section>
  );
};

export default Features;
