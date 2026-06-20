import React from 'react';
import { useInView } from '../hooks/useInView';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BuiltAroundYouSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden" ref={ref}>
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-500/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className={`transition-all duration-1000 ease-premium ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Label */}
          <div className="section-label mb-6 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-400/60" />
            Experience
            <span className="w-8 h-px bg-accent-400/60" />
          </div>

          {/* Headline */}
          <h2 className="heading-section text-display-lg text-white mb-8">
            Built Around You.
          </h2>

          {/* Description */}
          <p className="body-premium text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience the future of prosthetics. Request a private demo and begin your ReArm journey.
          </p>

          {/* CTA */}
          <Link
            to="/private-demo"
            className="btn-premium group inline-flex"
          >
            Request a Private Demo
            <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BuiltAroundYouSection;
