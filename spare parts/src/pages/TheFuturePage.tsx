import React from 'react';
import { useInView } from '../hooks/useInView';
import { Target, Users, Lightbulb, Rocket, MapPin, Calendar } from 'lucide-react';

const TheFuturePage: React.FC = () => {
  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [storyRef, storyInView] = useInView({ threshold: 0.3 });
  const [valuesRef, valuesInView] = useInView({ threshold: 0.2 });
  const [careersRef, careersInView] = useInView({ threshold: 0.3 });

  const values = [
    {
      icon: Target,
      title: 'Precision',
      description: 'Every component engineered to aerospace standards with micron-level accuracy.'
    },
    {
      icon: Users,
      title: 'Human-Centered',
      description: 'Technology that adapts to human needs, not the other way around.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Pushing the boundaries of what\'s possible in prosthetic technology.'
    },
    {
      icon: Rocket,
      title: 'Excellence',
      description: 'Uncompromising quality in every aspect of design and manufacturing.'
    }
  ];

  const roadmapItems = [
    {
      year: '2025',
      title: 'Neural Interface Integration',
      description: 'Direct brain-to-prosthetic communication for intuitive control.'
    },
    {
      year: '2026',
      title: 'Haptic Feedback System',
      description: 'Advanced sensory feedback for natural touch sensation.'
    },
    {
      year: '2027',
      title: 'Modular Upgrade Platform',
      description: 'Seamless hardware and software upgrades without replacement.'
    },
    {
      year: '2028',
      title: 'Global Manufacturing Network',
      description: 'Worldwide production facilities for rapid delivery and support.'
    }
  ];

  const careers = [
    {
      title: 'Senior Robotics Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time'
    },
    {
      title: 'AI/ML Research Scientist',
      department: 'Research & Development',
      location: 'Boston, MA',
      type: 'Full-time'
    },
    {
      title: 'Clinical Research Coordinator',
      department: 'Medical Affairs',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Manufacturing Process Engineer',
      department: 'Operations',
      location: 'Austin, TX',
      type: 'Full-time'
    }
  ];

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="py-24 lg:py-32" ref={heroRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${
            heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              The Future of Human Augmentation
            </h1>
            <p className="text-xl lg:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              We're not just building prosthetics. We're pioneering the next evolution of human capability.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 lg:py-32 bg-gray-900" ref={storyRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-700 ${
            storyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">
              Where We Started
            </h2>
            <div className="space-y-6 text-lg lg:text-xl text-gray-300 leading-relaxed">
              <p>
                ReArm was born from a simple yet profound realization: traditional prosthetics 
                were built for replacement, not enhancement. Our founders, a team of aerospace 
                engineers and biomedical researchers, saw an opportunity to apply cutting-edge 
                robotics and AI to create something unprecedented.
              </p>
              <p>
                Starting in a small lab in Silicon Valley, we've grown into a global team of 
                innovators united by a single mission: to redefine what it means to be human 
                in the age of advanced technology.
              </p>
              <p>
                Today, ReArm represents the convergence of aerospace engineering, artificial 
                intelligence, and human-centered design. We're not just restoring function—we're 
                expanding human potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32" ref={valuesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            valuesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The principles that guide every decision, every design, and every innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, description }, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-700 ${
                  valuesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:bg-gray-700 transition-colors duration-300">
                  <Icon size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Roadmap */}
      <section className="py-24 lg:py-32 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Technology Roadmap
            </h2>
            <p className="text-xl text-gray-400">
              Our vision for the next generation of prosthetic technology.
            </p>
          </div>

          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{item.year}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="py-24 lg:py-32" ref={careersRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            careersInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Help us build the future of human augmentation. We're looking for exceptional 
              talent to join our growing team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {careers.map((job, index) => (
              <div
                key={index}
                className={`bg-gray-900 p-6 rounded-2xl hover:bg-gray-800 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  careersInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                <p className="text-gray-400 mb-4">{job.department}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform">
              View All Positions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheFuturePage;