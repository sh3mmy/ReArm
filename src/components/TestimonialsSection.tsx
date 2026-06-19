import React from 'react';
import { useInView } from '../hooks/useInView';

const TestimonialsSection: React.FC = () => {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  const testimonials = [
    {
      quote: "ReArm sets a new standard in adaptive bionics.",
      author: "Dr. Ayodeji Lawal",
      title: "Robotics Engineer",
      delay: 0
    },
    {
      quote: "Every detail reflects precision and intent.",
      author: "Prof. Eliza Nakamura",
      title: "Orthopedic Surgeon",
      delay: 100
    },
    {
      quote: "Wearing ReArm is empowering—it feels limitless.",
      author: "M. Roman",
      title: "Early Adopter",
      delay: 200
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            What Experts and Users Are Saying.
          </h2>
          <p className={`text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-100 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Testimonials from world-class experts, surgeons, and users.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(({ quote, author, title, delay }, index) => (
            <div
              key={index}
              className={`bg-gray-900 p-8 rounded-2xl transition-all duration-700 hover:bg-gray-800 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${delay}ms` }}
            >
              <blockquote className="text-lg text-gray-300 mb-6 leading-relaxed">
                "{quote}"
              </blockquote>
              <div>
                <div className="text-white font-semibold">{author}</div>
                <div className="text-gray-400 text-sm">{title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;