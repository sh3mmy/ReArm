import React from 'react';
import { useInView } from '../hooks/useInView';

type FutureSectionProps = { bgSrc?: string };
const FutureSection: React.FC<FutureSectionProps> = ({ bgSrc }) => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section id="future" className="py-24 lg:py-32 bg-black" ref={ref}>
      {bgSrc && (
        <img src={bgSrc} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <div className={`transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              We Don't Just Build Prosthetics. We Build{' '}
              <span className="text-white">
                the Future.
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
              ReArm is where cutting-edge robotics meets human resilience.
            </p>
          </div>

          {/* Visual Element */}
          <div className={`relative transition-all duration-700 delay-200 ${
            isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureSection;