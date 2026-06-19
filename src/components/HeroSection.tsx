import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

type HeroSectionProps = { bgSrc?: string };

const HeroSection: React.FC<HeroSectionProps> = ({ bgSrc }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-end justify-center bg-neutral-950 overflow-hidden">
      {/* Background Image with Ken Burns effect */}
      {bgSrc && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={bgSrc}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[20000ms] ease-linear ${
              loaded ? 'scale-105' : 'scale-100'
            }`}
          />
          {/* Cinematic vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/30 via-transparent to-neutral-950/30" />
        </div>
      )}

      {/* Ambient light accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-24 lg:pb-32">
        <div className={`transition-all duration-1000 ease-premium ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Label */}
          <div className="section-label mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-accent-400/60" />
            ReArm Series
          </div>

          {/* Headline */}
          <h1 className="heading-hero text-display-xl text-white max-w-5xl mb-8">
            The New Era of
            <br />
            <span className="text-neutral-300">High-Performance</span>
            <br />
            Prosthetics.
          </h1>

          {/* Subheadline */}
          <p className="body-premium text-lg lg:text-xl max-w-xl mb-10 text-neutral-400">
            Revolutionary engineering. AI-driven adaptability.
            Aerospace-grade precision. Built for those who refuse to compromise.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/your-arm"
              className="btn-premium group"
            >
              Explore the Arm
              <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/private-demo"
              className="btn-outline"
            >
              Book a Private Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center gap-2 text-neutral-500">
          <span className="text-label">Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
