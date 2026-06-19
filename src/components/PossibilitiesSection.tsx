import React from 'react';
import { useInView } from '../hooks/useInView';

const PossibilitiesSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  const possibilities = [
    {
      number: '01',
      title: 'Precision Control',
      description: 'Sub-millimeter accuracy in every movement, powered by neural processing.',
    },
    {
      number: '02',
      title: 'Adaptive Learning',
      description: 'AI that evolves with you, learning your unique patterns and preferences.',
    },
    {
      number: '03',
      title: 'Limitless Expression',
      description: 'From delicate artistry to extreme athletics — no boundaries, only possibilities.',
    },
  ];

  return (
    <section className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden" ref={ref}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-accent-500/[0.03] rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`max-w-3xl mb-20 transition-all duration-800 ease-premium ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="section-label mb-4">Vision</div>
          <h2 className="heading-section text-display-md text-white mb-6">
            Redefining
            <br />
            <span className="text-neutral-400">Possibilities.</span>
          </h2>
          <p className="body-premium text-lg text-neutral-400 max-w-2xl">
            We are not replacing what is lost — we are redefining what is possible.
            Each ReArm is a testament to human ingenuity and the relentless pursuit of excellence.
          </p>
        </div>

        {/* Possibility Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {possibilities.map((item, index) => (
            <div
              key={index}
              className={`group card-premium p-8 lg:p-10 transition-all duration-800 ease-premium ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Number */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-label text-accent-400/60">{item.number}</span>
                <div className="w-10 h-10 rounded-full border border-white/[0.06] flex items-center justify-center group-hover:border-accent-400/30 group-hover:bg-accent-400/5 transition-all duration-500">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-neutral-500 group-hover:text-accent-400 transition-colors duration-500">
                    <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl lg:text-2xl font-medium text-white mb-4 tracking-tight">
                {item.title}
              </h3>
              <p className="body-premium text-neutral-500 leading-relaxed">
                {item.description}
              </p>

              {/* Hover line */}
              <div className="mt-8 h-px bg-gradient-to-r from-accent-400/40 via-accent-400/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-600 ease-premium origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PossibilitiesSection;
