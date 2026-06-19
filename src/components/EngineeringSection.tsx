import React from 'react';
import { useInView } from '../hooks/useInView';

type EngineeringSectionProps = { bgSrc?: string };
const EngineeringSection: React.FC<EngineeringSectionProps> = ({ bgSrc }) => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  const sections = [
    {
      title: 'Beyond Human.',
      content: [
        'Compared to traditional prosthetics, ReArm delivers superior, lifelike function—more than a replacement, it\'s a true performance upgrade.',
        'Join the select few experiencing the next frontier in bionic innovation.'
      ]
    },
    {
      title: 'Engineering Excellence. Redefined.',
      content: [
        'Precision 3D-printed titanium alloys and carbon fiber composites elevate each ReArm beyond medical standards.',
        'Spline-finished and meticulously tested for aerospace-grade reliability.'
      ]
    },
    {
      title: 'Precision. Down to the Micron.',
      content: [
        'Every component—from hand-polished surface finishes to machined titanium joints—reflects absolute commitment to perfection.',
        'No detail overlooked; every micron matters in the pursuit of excellence.'
      ]
    }
  ];

  return (
    <section id="engineering" className="py-24 lg:py-32 bg-black" ref={ref}>
      {bgSrc && (
        <img src={bgSrc} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`mb-24 lg:mb-32 last:mb-0 transition-all duration-700 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-8">
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            {index < sections.length - 1 && (
              <div className="mt-16 w-24 h-px bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default EngineeringSection;