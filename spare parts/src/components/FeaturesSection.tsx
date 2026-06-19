import React from 'react';
import { Cpu, Zap, Magnet, Clock, Shield } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const FeaturesSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  const features = [
    {
      icon: Cpu,
      title: 'AI-powered microcontroller',
      description: 'ReArm adapts instantly with AI-driven grip adjustments.',
      delay: 0
    },
    {
      icon: Zap,
      title: 'Adaptive grip pressure',
      description: 'Sensitive and strong for any task, from delicate to powerful.',
      delay: 100
    },
    {
      icon: Magnet,
      title: 'Magnetic fingertip modules',
      description: 'Customize interaction modes for unparalleled functionality.',
      delay: 200
    },
    {
      icon: Clock,
      title: 'Ultra-fast response',
      description: 'ReArm reacts faster than the human body\'s reflexes.',
      delay: 300
    },
    {
      icon: Shield,
      title: 'Built to last',
      description: 'Aerospace-grade construction resists wear and lasts for decades.',
      delay: 400
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-gray-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:gap-12">
          {features.map(({ icon: Icon, title, description, delay }, index) => (
            <div
              key={index}
              className={`group transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {index % 2 === 0 ? (
                  <>
                    <div className="order-2 lg:order-1">
                      <div className="aspect-square bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:from-gray-700 group-hover:to-gray-900 transition-all duration-300">
                        <Icon size={80} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">{title}</h3>
                      <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">{description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-2xl lg:text-4xl font-bold text-white mb-4">{title}</h3>
                      <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">{description}</p>
                    </div>
                    <div>
                      <div className="aspect-square bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:from-gray-700 group-hover:to-gray-900 transition-all duration-300">
                        <Icon size={80} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;