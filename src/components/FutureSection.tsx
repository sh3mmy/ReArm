import React from 'react';
import { useInView } from '../hooks/useInView';

type FutureSectionProps = { bgSrc?: string };

const FutureSection: React.FC<FutureSectionProps> = ({ bgSrc }) => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section id="future" className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden" ref={ref}>
      {/* Background image with subtle treatment */}
      {bgSrc && (
        <div className="absolute inset-0">
          <img
            src={bgSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/70 to-neutral-950" />
        </div>
      )}

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-accent-500/[0.03] rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <div className={`transition-all duration-800 ease-premium ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="section-label mb-6">Vision</div>
            <h2 className="heading-section text-display-md text-white mb-8">
              We Don't Just Build
              <br />
              <span className="text-neutral-400">Prosthetics.</span>
              <br />
              We Build the Future.
            </h2>
            <p className="body-premium text-lg text-neutral-400 leading-relaxed max-w-lg">
              ReArm is where cutting-edge robotics meets human resilience.
              Every innovation pushes the boundary of what prosthetics can achieve.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-light text-white tracking-tight">99.7%</div>
                <div className="text-label text-neutral-500 mt-1">Accuracy</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-light text-white tracking-tight">15ms</div>
                <div className="text-label text-neutral-500 mt-1">Response</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-light text-white tracking-tight">25yr</div>
                <div className="text-label text-neutral-500 mt-1">Lifespan</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className={`relative transition-all duration-800 delay-200 ease-premium ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="aspect-square bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl flex items-center justify-center relative overflow-hidden border border-white/[0.06]">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent-500/[0.03] to-transparent" />

              {/* Central element */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-400/20 to-accent-600/10 border border-accent-400/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 opacity-80" />
                </div>
                <div className="mt-6 text-center">
                  <div className="text-label text-accent-400/70">Neural Interface</div>
                  <div className="text-sm text-neutral-500 mt-1">v3.2 Active</div>
                </div>
              </div>

              {/* Orbital rings */}
              <div className="absolute inset-8 rounded-full border border-white/[0.03]" />
              <div className="absolute inset-16 rounded-full border border-white/[0.02]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureSection;
