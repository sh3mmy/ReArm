import React from 'react';
import { Cpu, Zap, Magnet, Clock, Shield } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const FeaturesSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.15 });

  const features = [
    { icon: Cpu, title: 'AI-Powered Microcontroller', description: 'ReArm adapts instantly with AI-driven grip adjustments, learning your patterns in real time.', stat: '2.4 TOPS', statLabel: 'Neural performance', delay: 0 },
    { icon: Zap, title: 'Adaptive Grip Pressure', description: 'Sensitive and strong for any task — from the most delicate to the most demanding.', stat: '<15ms', statLabel: 'Response time', delay: 100 },
    { icon: Magnet, title: 'Magnetic Fingertip Modules', description: 'Customize interaction modes with swappable magnetic modules for unparalleled functionality.', stat: '6 Modes', statLabel: 'Interchangeable', delay: 200 },
    { icon: Clock, title: 'Ultra-Fast Response', description: "ReArm reacts faster than the human body's natural reflexes, ensuring seamless control.", stat: '0.3s', statLabel: 'Activation speed', delay: 300 },
    { icon: Shield, title: 'Built to Last', description: 'Aerospace-grade titanium and carbon fiber construction resists wear for decades.', stat: '25+ Years', statLabel: 'Expected lifespan', delay: 400 },
  ];

  return (
    <section className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`max-w-3xl mb-20 transition-all duration-800 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="section-label mb-4">Capabilities</div>
          <h2 className="font-normal text-white mb-6 tracking-[-0.02em] leading-[1.05]" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
            Engineered Without Compromise.
          </h2>
          <p className="font-light text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Every component is designed to exceed expectations — from neural processing
            to aerospace materials, ReArm represents the pinnacle of prosthetic innovation.
          </p>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {features.map(({ icon: Icon, title, description, stat, statLabel, delay }, index) => (
            <div key={index} className={`transition-all duration-800 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${delay}ms` }}>
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="card-premium aspect-[4/3] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                        <Icon size={36} className="text-accent-400" strokeWidth={1.2} />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-light text-white tracking-tight">{stat}</div>
                        <div className="section-label text-neutral-500 mt-1">{statLabel}</div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-accent-400/20 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-accent-400/20 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="section-label text-accent-400/70">{String(index + 1).padStart(2, '0')}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                  <h3 className="font-normal text-2xl lg:text-3xl text-white mb-4 tracking-[-0.02em] leading-[1.05]">{title}</h3>
                  <p className="font-light text-neutral-400 leading-relaxed text-lg">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
