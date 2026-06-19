import React from 'react';
import { Link } from 'react-router-dom';

type HeroSectionProps = { bgSrc?: string };
const HeroSection: React.FC<HeroSectionProps> = ({ bgSrc }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {bgSrc && (
        <img
          src={bgSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeInUp">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            <span className="block">Welcome to the New Era of</span>
            <span className="block text-white">
              High-Performance Prosthetics.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            <span className="block mb-2">
              Revolutionary engineering. AI-driven adaptability.
            </span>
            <span className="block">Aerospace-grade precision.</span>
          </p>

          {/* CTA → goes to /your-arm */}
          <Link
            to="/your-arm"
            className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform"
          >
            Explore the Arm
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
