import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { Cpu, Zap, Shield, Microscope, MessageSquare, Star, ChevronRight } from 'lucide-react';

const EngineeringPage: React.FC = () => {
  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [techRef, techInView] = useInView({ threshold: 0.2 });
  const [caseStudiesRef, caseStudiesInView] = useInView({ threshold: 0.2 });
  const [activeTab, setActiveTab] = useState('materials');

  const technologies = [
    {
      icon: Cpu,
      title: 'Neural Processing Unit',
      description: 'Custom AI chip designed specifically for real-time prosthetic control and adaptation.',
      specs: ['12nm architecture', '2.4 TOPS performance', 'Ultra-low latency']
    },
    {
      icon: Zap,
      title: 'Adaptive Control System',
      description: 'Machine learning algorithms that continuously improve grip patterns and responses.',
      specs: ['Real-time learning', 'Predictive control', 'Personalized adaptation']
    },
    {
      icon: Shield,
      title: 'Aerospace Materials',
      description: 'Grade 5 titanium alloy and carbon fiber composites for maximum strength and durability.',
      specs: ['Ti-6Al-4V titanium', 'Carbon fiber reinforcement', 'Corrosion resistant']
    },
    {
      icon: Microscope,
      title: 'Precision Manufacturing',
      description: 'CNC machining and 3D printing with tolerances measured in microns.',
      specs: ['±0.001" tolerance', 'Surface finish Ra 0.8μm', 'ISO 13485 certified']
    }
  ];

  const caseStudies = [
    {
      title: 'Professional Musician Returns to Performance',
      description: 'How ReArm\'s precision control enabled a concert pianist to return to professional performance after amputation.',
      image: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=800',
      results: ['99.7% accuracy in finger positioning', '15ms response time', '8-hour continuous use']
    },
    {
      title: 'Surgeon Performs Complex Operations',
      description: 'A cardiac surgeon using ReArm technology to perform life-saving procedures with enhanced precision.',
      image: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800',
      results: ['Sub-millimeter precision', 'Haptic feedback integration', 'Zero fatigue after 6-hour surgery']
    },
    {
      title: 'Rock Climber Conquers Everest',
      description: 'An extreme athlete\'s journey to summit Mount Everest using ReArm\'s weather-resistant technology.',
      image: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800',
      results: ['Operated at -40°C', '29,000ft altitude tested', '72-hour continuous operation']
    }
  ];

  const communitySubmissions = [
    {
      user: 'Dr. Sarah Chen',
      title: 'Improved Grip Algorithm for Delicate Tasks',
      description: 'A refined machine learning model that better handles fragile objects like eggs and glass.',
      votes: 247,
      comments: 18
    },
    {
      user: 'Marcus Rodriguez',
      title: 'Custom Finger Attachments for Musical Instruments',
      description: 'Specialized fingertip modules designed for guitar playing and piano performance.',
      votes: 189,
      comments: 31
    },
    {
      user: 'Prof. Elena Volkov',
      title: 'Enhanced Battery Life Optimization',
      description: 'Power management improvements that extend operation time by 40% without compromising performance.',
      votes: 156,
      comments: 12
    }
  ];

  const manufacturingSteps = [
    {
      step: '01',
      title: 'Material Selection',
      description: 'Aerospace-grade titanium alloy and carbon fiber composites are carefully selected and inspected.'
    },
    {
      step: '02',
      title: 'Precision Machining',
      description: '5-axis CNC machining creates components with micron-level accuracy and perfect surface finishes.'
    },
    {
      step: '03',
      title: 'Assembly & Integration',
      description: 'Expert technicians assemble each component with specialized tools in cleanroom environments.'
    },
    {
      step: '04',
      title: 'Quality Testing',
      description: 'Rigorous testing protocols ensure every unit meets our aerospace-grade standards before delivery.'
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
            <div className="section-label mb-6">Engineering</div>
            <h1 className="heading-section text-display-lg text-white mb-8">
              Engineering Excellence
            </h1>
            <p className="body-premium text-lg lg:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              Where aerospace precision meets human innovation. Discover the technology that powers ReArm.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-32 lg:py-40 bg-neutral-900/30" ref={techRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`mb-20 transition-all duration-700 ${
            techInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label mb-4">Technology</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Cutting-Edge Technology
            </h2>
            <p className="body-premium text-lg text-neutral-400 max-w-2xl">
              Every component engineered to exceed aerospace standards and redefine what's possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {technologies.map(({ icon: Icon, title, description, specs }, index) => (
              <div
                key={index}
                className={`card-premium p-8 lg:p-10 transition-all duration-700 ${
                  techInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                  <Icon size={28} className="text-accent-400" strokeWidth={1.2} />
                </div>
                <h3 className="text-xl font-medium text-white mb-4 tracking-tight">{title}</h3>
                <p className="body-premium text-neutral-400 mb-6">{description}</p>
                <div className="space-y-2">
                  {specs.map((spec, specIndex) => (
                    <div key={specIndex} className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-400/40" />
                      <span className="text-sm text-neutral-500">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-32 lg:py-40" ref={caseStudiesRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`mb-20 transition-all duration-700 ${
            caseStudiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="section-label mb-4">Impact</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Real-World Impact
            </h2>
            <p className="body-premium text-lg text-neutral-400 max-w-2xl">
              See how ReArm technology is transforming lives across different professions and challenges.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className={`card-premium overflow-hidden transition-all duration-700 ${
                  caseStudiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                </div>
                <div className="p-6 lg:p-8">
                  <h3 className="text-lg font-medium text-white mb-3 tracking-tight">{study.title}</h3>
                  <p className="body-premium text-neutral-400 text-sm mb-4">{study.description}</p>
                  <div className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-center space-x-2">
                        <ChevronRight size={14} className="text-accent-400/50" />
                        <span className="text-sm text-neutral-500">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Submissions */}
      <section className="py-32 lg:py-40 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <div className="section-label mb-4">Community</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Community Innovation
            </h2>
            <p className="body-premium text-lg text-neutral-400 max-w-2xl">
              Our users and researchers contribute improvements that benefit the entire ReArm community.
            </p>
          </div>

          <div className="space-y-4">
            {communitySubmissions.map((submission, index) => (
              <div key={index} className="card-premium p-6 lg:p-8 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-white font-medium text-sm">{submission.user}</span>
                      <span className="text-neutral-600 text-sm">·</span>
                      <span className="text-neutral-600 text-sm">2 days ago</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 tracking-tight">{submission.title}</h3>
                    <p className="body-premium text-neutral-400 text-sm">{submission.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <Star size={14} className="text-neutral-600" />
                      <span className="text-neutral-500 text-sm">{submission.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MessageSquare size={14} className="text-neutral-600" />
                      <span className="text-neutral-500 text-sm">{submission.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn-premium">
              Join the Discussion
            </button>
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="py-32 lg:py-40">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <div className="section-label mb-4">Manufacturing</div>
            <h2 className="heading-section text-display-md text-white mb-6">
              Precision Manufacturing
            </h2>
            <p className="body-premium text-lg text-neutral-400 max-w-2xl">
              Every ReArm is crafted using aerospace-grade processes and materials for uncompromising quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {manufacturingSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{step.title}</h3>
                  <p className="body-premium text-neutral-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Material Showcase */}
          <div className="mt-24">
            <div className="card-premium p-8 lg:p-12">
              <h3 className="text-2xl font-medium text-white mb-8 text-center tracking-tight">
                Aerospace-Grade Materials
              </h3>

              <div className="flex justify-center mb-8">
                <div className="flex bg-neutral-900/50 rounded-full p-1 border border-white/[0.06]">
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeTab === 'materials' ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Materials
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeTab === 'specifications' ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Specifications
                  </button>
                </div>
              </div>

              {activeTab === 'materials' && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/[0.06]">
                      <div className="w-16 h-16 rounded-xl bg-neutral-700/50" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">Titanium Alloy</h4>
                    <p className="body-premium text-neutral-400 text-sm">Ti-6Al-4V aerospace-grade titanium for maximum strength-to-weight ratio</p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/[0.06]">
                      <div className="w-16 h-16 rounded-xl bg-neutral-700/50" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">Carbon Fiber</h4>
                    <p className="body-premium text-neutral-400 text-sm">High-modulus carbon fiber composites for lightweight durability</p>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6">
                    <div className="text-3xl lg:text-4xl font-light text-white mb-2 tracking-tight">99.7%</div>
                    <div className="text-label text-neutral-500">Purity Grade</div>
                  </div>
                  <div className="text-center p-6">
                    <div className="text-3xl lg:text-4xl font-light text-white mb-2 tracking-tight">±0.001"</div>
                    <div className="text-label text-neutral-500">Tolerance</div>
                  </div>
                  <div className="text-center p-6">
                    <div className="text-3xl lg:text-4xl font-light text-white mb-2 tracking-tight">0.8μm</div>
                    <div className="text-label text-neutral-500">Surface Finish</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EngineeringPage;
