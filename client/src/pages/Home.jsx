import React from 'react';
import Hero               from '../components/Hero';
import FeaturedDestination from '../components/FeaturedDestination';
import ExclusiveOffers    from '../components/ExclusiveOffers';
import Testimonial        from '../components/Testimonial';
import AITripPlanner      from '../components/AITripPlanner';
import AISmartSearch      from '../components/AIRecommendations';
import VibeSurprise       from '../components/VibeSurprise';
import ExperienceSection  from '../components/ExperienceSection';
import AboutSection       from '../components/AboutSection';
import NewsLetter         from '../components/NewsLetter';

const Home = () => (
    <>
        <Hero />
        <AISmartSearch />
        <VibeSurprise />
        <FeaturedDestination />
        <ExperienceSection />
        <ExclusiveOffers />
        <Testimonial />
        <AITripPlanner />
        <AboutSection />
        <NewsLetter />
    </>
);

export default Home;
