import React from 'react';
import HeroSection from '../components/HeroSection';
import FutureSection from '../components/FutureSection';
import PossibilitiesSection from '../components/PossibilitiesSection';
import FeaturesSection from '../components/FeaturesSection';
import EngineeringSection from '../components/EngineeringSection';
import TestimonialsSection from '../components/TestimonialsSection';
import BuiltAroundYouSection from '../components/BuiltAroundYouSection';

const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FutureSection />
      <PossibilitiesSection />
      <FeaturesSection />
      <EngineeringSection />
      <TestimonialsSection />
      <BuiltAroundYouSection />
    </>
  );
};

export default LandingPage;