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
    <div className="bg-neutral-950">
      {/* Hero Section */}
      <section className="py-32 lg:py-40" ref={heroRef}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${
            heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label mb-6">Vision</div>
            <h1 className="heading-section text-display-lg text-white mb-8">
              The Future of
              <br />
              <span className="text-neutral-400">Human Augmentation.</span>
            </h1>
            <p className="body-premium text-lg lg:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              We are not just building prosthetics. We are pioneering the next evolution of human capability.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-32 lg:py-40 bg-neutral-900/30" ref={storyRef}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className={`transition-all duration-700 ${
            storyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label mb-6">Story</div>
            <h2 className="heading-section text-display-md text-white mb-10">
              Where We Started.
            </h2>
            <div className="space-y-6">
              <p className="body-premium text-lg lg:text-xl text-neutral-400 leading-relaxed">
                ReArm was born from a simple yet profound realization: traditional prosthetics
                were built for replacement, not enhancement. Our founders, a team of aerospace
                engineers and biomedical researchers, saw an opportunity to apply cutting-edge
                robotics and AI to create something unprecedented.
              </p>
              <p className="body-premium text-lg lg:text-xl text-neutral-400 leading-relaxed">
                Starting in a small lab in Silicon Valley, we have grown into a global team of
                innovators united by a single mission: to redefine what it means to be human
                in the age of advanced technology.
              </p>
              <p className="body-premium text-lg lg:text-xl text-neutral-400 leading-relaxed">
                Today, ReArm represents the convergence of aerospace engineering, artificial
                intelligence, and human-centered design. We are not just restoring function —
                we are expanding human potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 lg:py-40" ref={valuesRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`mb-20 transition-all duration-700 ${
            valuesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label mb-4">Values</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Our Principles.
            </h2>
            <p className="body-premium text-lg text-neutral-400 max-w-2xl">
              The principles that guide every decision, every design, and every innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, description }, index) => (
              <div
                key={index}
                className={`card-premium p-8 text-center transition-all duration-700 ${
                  valuesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/[0.06]">
                  <Icon size={28} className="text-accent-400" strokeWidth={1.2} />
                </div>
                <h3 className="text-lg font-medium text-white mb-4 tracking-tight">{title}</h3>
                <p className="body-premium text-neutral-400 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Roadmap */}
      <section className="py-32 lg:py-40 bg-neutral-900/30">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <div className="section-label mb-4">Roadmap</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Technology Roadmap.
            </h2>
            <p className="body-premium text-lg text-neutral-400">
              Our vision for the next generation of prosthetic technology.
            </p>
          </div>

          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-6 group">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/[0.06] group-hover:border-accent-400/30 transition-colors duration-300">
                    <span className="text-white font-medium text-sm">{item.year}</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-medium text-white mb-2 tracking-tight">{item.title}</h3>
                  <p className="body-premium text-neutral-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="py-32 lg:py-40" ref={careersRef}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className={`mb-20 transition-all duration-700 ${
            careersInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label mb-4">Careers</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Join Our Mission.
            </h2>
            <p className="body-premium text-lg text-neutral-400 max-w-2xl">
              Help us build the future of human augmentation. We are looking for exceptional
              talent to join our growing team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {careers.map((job, index) => (
              <div
                key={index}
                className={`card-premium p-6 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 ${
                  careersInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h3 className="text-lg font-medium text-white mb-2 tracking-tight">{job.title}</h3>
                <p className="text-neutral-500 mb-4 text-sm">{job.department}</p>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={14} strokeWidth={1.5} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={14} strokeWidth={1.5} />
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn-premium">
              View All Positions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheFuturePage;
