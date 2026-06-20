import React from 'react';
import { useInView } from '../hooks/useInView';

type EngineeringSectionProps = { bgSrc?: string };

const EngineeringSection: React.FC<EngineeringSectionProps> = ({ bgSrc }) => {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  const sections = [
    {
      label: 'Performance',
      title: 'Beyond Human.',
      content: [
        'Compared to traditional prosthetics, ReArm delivers superior, lifelike function — more than a replacement, it\'s a true performance upgrade.',
        'Join the select few experiencing the next frontier in bionic innovation.'
      ]
    },
    {
      label: 'Materials',
      title: 'Engineering Excellence. Redefined.',
      content: [
        'Precision 3D-printed titanium alloys and carbon fiber composites elevate each ReArm beyond medical standards.',
        'Spline-finished and meticulously tested for aerospace-grade reliability.'
      ]
    },
    {
      label: 'Precision',
      title: 'Precision. Down to the Micron.',
      content: [
        'Every component — from hand-polished surface finishes to machined titanium joints — reflects absolute commitment to perfection.',
        'No detail overlooked; every micron matters in the pursuit of excellence.'
      ]
    }
  ];

  return (
    <section id="engineering" className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden" ref={ref}>
      {/* Background image with overlay */}
      {bgSrc && (
        <div className="absolute inset-0">
          <img
            src={bgSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/80 to-neutral-950" />
        </div>
      )}

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section Label */}
        <div className={`mb-20 transition-all duration-800 ease-premium ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="section-label mb-4">Engineering</div>
          <h2 className="heading-section text-display-md text-white">
            Where Craftsmanship
            <br />
            <span className="text-neutral-400">Meets Innovation.</span>
          </h2>
        </div>

        {sections.map((section, index) => (
          <div
            key={index}
            className={`mb-28 lg:mb-36 last:mb-0 transition-all duration-800 ease-premium ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-label text-accent-400/70">{section.label}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <h3 className="heading-section text-3xl lg:text-5xl text-white mb-8 tracking-tight">
              {section.title}
            </h3>

            <div className="space-y-5 max-w-3xl">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="body-premium text-lg lg:text-xl text-neutral-400 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {index < sections.length - 1 && (
              <div className="mt-16 flex items-center gap-4">
                <div className="divider-premium" />
                <span className="text-label text-neutral-600">{String(index + 2).padStart(2, '0')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default EngineeringSection;
