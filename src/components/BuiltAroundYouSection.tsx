import React from 'react';
import { useInView } from '../hooks/useInView';

const BuiltAroundYouSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section className="py-24 lg:py-32 bg-black" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-8">
            Built Around You.
          </h2>
          <p className="text-xl lg:text-2xl text-gray-400 leading-relaxed mb-12 max-w-2xl mx-auto">
            Experience the future of prosthetics. Request a private demo and begin your ReArm journey.
          </p>
          <button className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform">
            Request a Private Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default BuiltAroundYouSection;