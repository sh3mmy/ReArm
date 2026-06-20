import React from 'react';
import HeroSection from '../components/HeroSection';
import FutureSection from '../components/FutureSection';
import PossibilitiesSection from '../components/PossibilitiesSection';
import FeaturesSection from '../components/FeaturesSection';
import EngineeringSection from '../components/EngineeringSection';
import TestimonialsSection from '../components/TestimonialsSection';
import BuiltAroundYouSection from '../components/BuiltAroundYouSection';
import Footer from '../components/Footer';
import { HERO, ENGINEERING } from '../lib/images';

const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection bgSrc={HERO.home} />
      <FutureSection />
      <PossibilitiesSection />
      <FeaturesSection />
      <EngineeringSection bgSrc={ENGINEERING.lab1} />
      <TestimonialsSection />
      <BuiltAroundYouSection />
      <Footer />
    </>
  );
};

export default LandingPage;
