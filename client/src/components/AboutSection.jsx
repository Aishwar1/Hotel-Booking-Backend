import React from "react";
import aishwarPortrait from "../assets/aishwar-bhatnagar.png";

const values = [
  ["01", "Thoughtful stays", "Hand-picked properties and clear details, so every choice feels considered."],
  ["02", "Smarter planning", "AI that turns a travel mood into useful choices, not more tabs and filters."],
  ["03", "Human perspective", "Travel should feel personal. Every feature is designed to make planning calmer."],
];

const AboutSection = () => <section id="about" className="py-16 md:py-20 bg-white">
  <div className="max-w-6xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-10 md:gap-14 items-center">
      <div>
        <p className="text-xs font-semibold text-sky-600 uppercase tracking-[.22em] mb-3">TravelWithAsh</p>
        <h2 className="font-playfair text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Travel planning, made more personal.</h2>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed mt-5 max-w-xl">TravelWithAsh brings together exceptional stays, natural-language search, and an AI assistant that helps shape a trip around how you actually want to feel.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-8">{values.map(([number, title, text]) => <div key={number} className="rounded-2xl border border-slate-200 p-4"><p className="text-sky-600 font-semibold text-sm">{number}</p><p className="font-semibold text-slate-900 mt-2">{title}</p><p className="text-xs text-slate-500 leading-relaxed mt-1">{text}</p></div>)}</div>
      </div>
      <aside className="rounded-3xl bg-slate-950 text-white p-7 md:p-9 shadow-xl">
        <p className="text-xs font-semibold text-sky-300 uppercase tracking-[.22em]">Your Travel Curator</p>
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center sm:items-start gap-5 mt-6">
          <img src={aishwarPortrait} alt="Aishwar Bhatnagar" className="w-32 h-32 rounded-2xl object-cover object-center ring-2 ring-sky-300/50 shrink-0" />
          <div className="text-center sm:text-left lg:text-center xl:text-left"><h3 className="font-playfair text-2xl">Aishwar Bhatnagar</h3><p className="text-sky-300 text-sm mt-1">Founder & Travel Curator</p><p className="text-slate-300 text-sm leading-relaxed mt-3">Creating a more elegant, intelligent way to find a stay and build a memorable journey.</p></div>
        </div>
      </aside>
    </div>
  </div>
</section>;

export default AboutSection;
