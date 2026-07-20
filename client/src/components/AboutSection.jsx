import React from 'react';

// ============================================================
// ABOUT SECTION
// ============================================================
// Tells the QuickStay story — mission, values, and the team
// promise. Linked from the "About" nav item via #about id.
// Styled to match the dark/luxury aesthetic of the project.
// ============================================================

const values = [
    {
        icon: "✦",
        title: "Trust & Transparency",
        description: "No hidden fees, no surprises. The price you see is the price you pay — with clear cancellation policies every time.",
    },
    {
        icon: "◈",
        title: "Handpicked Quality",
        description: "Every hotel on QuickStay is personally vetted. We only list properties that meet our strict standards for comfort, cleanliness, and service.",
    },
    {
        icon: "⬡",
        title: "Human-First Support",
        description: "Real people, real help — 24 hours a day. Our concierge team is always one message away, wherever in the world you are.",
    },
];

const team = [
    {
        name: "Aria Sinclair",
        role: "Founder & CEO",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80",
    },
    {
        name: "James Okafor",
        role: "Head of Partnerships",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
    },
    {
        name: "Mei Lin",
        role: "Chief Experience Officer",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
    },
];

const AboutSection = () => (
    <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">

            {/* ── Our Story ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-20">

                {/* Left — image collage */}
                <div className="relative">
                    {/* Large background image */}
                    <img
                        src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&q=80"
                        alt="Luxury hotel atrium"
                        className="w-full h-96 object-cover rounded-2xl shadow-lg"
                    />
                    {/* Floating accent card */}
                    <div className="absolute -bottom-6 -right-6 bg-black text-white p-6 rounded-2xl shadow-xl max-w-52 hidden md:block">
                        <p className="font-playfair text-4xl font-bold">8+</p>
                        <p className="text-gray-300 text-sm mt-1">Years elevating travel</p>
                    </div>
                </div>

                {/* Right — text */}
                <div>
                    <p className="text-sm font-semibold text-[#49B9FF] uppercase tracking-widest mb-2">
                        Our Story
                    </p>
                    <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
                        We Believe Every Journey<br className="hidden md:block" /> Deserves a Perfect Stay
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-4">
                        QuickStay was founded in 2017 with a simple conviction: booking a luxury hotel should feel
                        as good as the stay itself. We were tired of cluttered interfaces, opaque pricing, and
                        impersonal service — so we built the alternative.
                    </p>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
                        Today, QuickStay connects discerning travellers with over 500 hand-curated properties
                        across 50+ countries — from boutique cliff-side retreats to five-star city icons. Every
                        property is reviewed by our team in person before it earns a place on our platform.
                    </p>

                    {/* Inline stats */}
                    <div className="flex gap-10">
                        {[["500+", "Hotels"], ["50+", "Countries"], ["1M+", "Guests"]].map(([val, lbl], i) => (
                            <div key={i}>
                                <p className="font-playfair text-3xl font-bold text-gray-900">{val}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{lbl}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Our Values ── */}
            <div className="mb-20">
                <div className="text-center mb-10">
                    <p className="text-sm font-semibold text-[#49B9FF] uppercase tracking-widest mb-2">What Drives Us</p>
                    <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900">Our Values</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {values.map((v, i) => (
                        <div key={i} className="border border-gray-100 rounded-2xl p-8 hover:border-black/20 hover:shadow-md transition-all duration-300">
                            <span className="text-3xl font-thin text-gray-300">{v.icon}</span>
                            <h3 className="font-playfair text-xl font-bold text-gray-900 mt-3 mb-2">{v.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Team ── */}
            <div>
                <div className="text-center mb-10">
                    <p className="text-sm font-semibold text-[#49B9FF] uppercase tracking-widest mb-2">The People Behind It</p>
                    <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900">Meet the Team</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    {team.map((member, i) => (
                        <div key={i} className="text-center group">
                            <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-[#49B9FF] text-sm">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </section>
);

export default AboutSection;
