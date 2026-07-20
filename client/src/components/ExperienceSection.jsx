import React from 'react';

// ============================================================
// EXPERIENCE SECTION
// ============================================================
// Showcases the curated experiences QuickStay hotels offer —
// local adventures, dining, wellness, and cultural immersion.
// Matches the dark/luxury aesthetic of the original project.
// Linked from the "Experience" nav item via the #experience id.
// ============================================================

// Individual experience card
const ExperienceCard = ({ icon, title, description, tag }) => (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-6">
            {/* Icon background circle */}
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-black/5 transition-colors duration-300">
                <span className="text-3xl">{icon}</span>
            </div>
            {/* Tag pill */}
            <span className="text-xs font-semibold text-[#49B9FF] uppercase tracking-widest">{tag}</span>
            <h3 className="font-playfair text-xl font-bold text-gray-900 mt-1 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
        {/* Bottom accent bar that slides in on hover */}
        <div className="h-1 w-0 group-hover:w-full bg-black transition-all duration-500" />
    </div>
);

const experiences = [
    {
        icon: "🍽️",
        tag: "Culinary",
        title: "World-Class Dining",
        description: "From Michelin-starred restaurants to poolside bites, every meal is crafted by award-winning chefs using locally sourced ingredients.",
    },
    {
        icon: "🧖",
        tag: "Wellness",
        title: "Luxury Spa & Wellness",
        description: "Rejuvenate body and mind with signature treatments, infinity pools, and private yoga sessions tailored to your wellbeing.",
    },
    {
        icon: "🌍",
        tag: "Adventure",
        title: "Curated Local Experiences",
        description: "Discover hidden gems with our expert concierge — from desert safaris in Dubai to night markets in Singapore.",
    },
    {
        icon: "🛏️",
        tag: "Comfort",
        title: "Bespoke Room Design",
        description: "Every room is individually styled with bespoke furnishings, premium linens, and panoramic views that make every morning memorable.",
    },
    {
        icon: "✈️",
        tag: "Transfer",
        title: "Seamless Arrivals",
        description: "Private airport transfers, 24/7 concierge, and personalised welcome packages ensure your journey starts before you arrive.",
    },
    {
        icon: "🎉",
        tag: "Events",
        title: "Private Celebrations",
        description: "From intimate anniversaries to grand corporate retreats, our event teams craft flawless experiences at every scale.",
    },
];

// Two large feature stats shown above the cards
const stats = [
    { value: "500+", label: "Luxury Hotels" },
    { value: "50+",  label: "Countries" },
    { value: "1M+",  label: "Happy Guests" },
    { value: "24/7", label: "Concierge Support" },
];

const ExperienceSection = () => (
    <section id="experience" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">

            {/* Section header */}
            <div className="text-center mb-14">
                <p className="text-sm font-semibold text-[#49B9FF] uppercase tracking-widest mb-2">
                    Crafted For You
                </p>
                <h2 className="font-playfair text-3xl md:text-5xl font-bold text-gray-900">
                    The QuickStay Experience
                </h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-sm md:text-base">
                    We don't just book rooms — we curate journeys. Every stay is elevated with
                    handpicked services, exclusive perks, and moments that linger long after check-out.
                </p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
                {stats.map((s, i) => (
                    <div key={i} className="text-center bg-white rounded-2xl py-6 shadow-sm">
                        <p className="font-playfair text-4xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Experience cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp, i) => (
                    <ExperienceCard key={i} {...exp} />
                ))}
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
                <a
                    href="/rooms"
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-300"
                >
                    Browse All Hotels
                    <span className="text-lg">→</span>
                </a>
            </div>
        </div>
    </section>
);

export default ExperienceSection;
