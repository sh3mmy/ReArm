import React from 'react';
import { Square, Circle, Triangle } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const PossibilitiesSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  const shapes = [
    { Icon: Square, delay: 0 },
    { Icon: Circle, delay: 100 },
    { Icon: Triangle, delay: 200 }
  ];

  return (
    <section className="py-24 lg:py-32 bg-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Redefining{' '}
            <span className="text-white">
              Possibilities.
            </span>
          </h2>
          <p className={`text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-100 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            We're not replacing what's lost — we're redefining what's possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {shapes.map(({ Icon, delay }, index) => (
            <div
              key={index}
              className={`flex justify-center transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <div className="group relative">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center hover:from-gray-700 hover:to-gray-800 transition-all duration-300 cursor-pointer transform hover:scale-105">
                  <Icon size={80} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PossibilitiesSection;