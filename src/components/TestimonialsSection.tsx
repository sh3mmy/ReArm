import React from 'react';
import { useInView } from '../hooks/useInView';
import { Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  const testimonials = [
    {
      quote: "ReArm sets a new standard in adaptive bionics. The precision and responsiveness are unlike anything I've encountered in my career.",
      author: "Dr. Ayodeji Lawal",
      title: "Robotics Engineer",
      org: "MIT Robotics Lab",
      delay: 0
    },
    {
      quote: "Every detail reflects precision and intent. This is what happens when aerospace engineering meets human-centered design.",
      author: "Prof. Eliza Nakamura",
      title: "Orthopedic Surgeon",
      org: "Tokyo Medical University",
      delay: 150
    },
    {
      quote: "Wearing ReArm is empowering — it feels limitless. I forgot I was wearing a prosthetic within the first hour.",
      author: "M. Roman",
      title: "Early Adopter",
      org: "Professional Musician",
      delay: 300
    }
  ];

  return (
    <section className="relative py-32 lg:py-40 bg-neutral-950 overflow-hidden" ref={ref}>
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-20 transition-all duration-800 ease-premium ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="section-label mb-4">Testimonials</div>
          <h2 className="heading-section text-display-md text-white">
            What Experts and Users
            <br />
            <span className="text-neutral-400">Are Saying.</span>
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map(({ quote, author, title, org, delay }, index) => (
            <div
              key={index}
              className={`group card-premium p-8 lg:p-10 flex flex-col transition-all duration-800 ease-premium ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              {/* Quote icon */}
              <div className="mb-6">
                <Quote size={28} className="text-accent-400/40" strokeWidth={1} />
              </div>

              {/* Quote text */}
              <blockquote className="body-premium text-neutral-300 leading-relaxed flex-1 mb-8 text-base">
                "{quote}"
              </blockquote>

              {/* Author */}
              <div className="pt-6 border-t border-white/[0.06]">
                <div className="text-white font-medium text-sm tracking-wide">{author}</div>
                <div className="text-neutral-500 text-sm mt-1">{title}</div>
                <div className="text-accent-400/60 text-xs mt-1">{org}</div>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-accent-400/50 via-accent-400/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-premium origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
