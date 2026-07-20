import React from 'react';
import Hero               from '../components/Hero';
import FeaturedDestination from '../components/FeaturedDestination';
import ExclusiveOffers    from '../components/ExclusiveOffers';
import Testimonial        from '../components/Testimonial';
import AIRecommendations  from '../components/AIRecommendations';
import ExperienceSection  from '../components/ExperienceSection';
import AboutSection       from '../components/AboutSection';
import NewsLetter         from '../components/NewsLetter';

// ============================================================
// HOME PAGE
// ============================================================
// Section order (top → bottom):
//   Hero          — animated wallpaper carousel + search
//   Featured      — popular destinations
//   Experience    — curated experiences (nav anchor: #experience)
//   Exclusive     — limited-time offers
//   Testimonials  — guest reviews
//   AI Recs       — AI-powered hotel recommender
//   About         — brand story + team (nav anchor: #about)
//   Newsletter    — email sign-up
// ============================================================

const Home = () => (
    <>
        <Hero />
        <FeaturedDestination />
        <ExperienceSection />     {/* Linked from "Experience" in Navbar */}
        <ExclusiveOffers />
        <Testimonial />
        <AIRecommendations />
        <AboutSection />          {/* Linked from "About" in Navbar */}
        <NewsLetter />
    </>
);

export default Home;
