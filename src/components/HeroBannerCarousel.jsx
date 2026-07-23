import React, { useState, useEffect } from 'react';

export default function HeroBannerCarousel({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultBanners = [
    {
      badge: 'AD 1/5 • HOT GIG',
      title: 'Event Operations Rep',
      subtitle: '₹1500 • On-Site • 50+ Applied',
      bg: 'bg-gradient-to-r from-purple-700 to-violet-700',
      peekTitle: 'Social Media'
    },
    {
      badge: 'AD 2/5 • TOP COMPANY',
      title: 'Brand Marketing Intern',
      subtitle: 'Pre-placement offer available • ₹15k/mo',
      bg: 'bg-gradient-to-r from-purple-800 to-indigo-800',
      peekTitle: 'Junior Dev'
    },
    {
      badge: 'PRO TIP',
      title: 'Boost Your Score',
      subtitle: 'Higher scores get 3x more invites from employers',
      bg: 'bg-gradient-to-r from-purple-700 to-purple-900',
      peekTitle: 'Verified Skills'
    }
  ];

  const items = banners || defaultBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [items.length]);

  const active = items[currentIndex];
  const next = items[(currentIndex + 1) % items.length];

  return (
    <div className="mb-6">
      {/* Cards Container with peeking right card */}
      <div className="relative flex gap-3 overflow-hidden rounded-2xl">
        {/* Main Banner Card */}
        <div className={`flex-1 p-6 sm:p-8 rounded-2xl text-white shadow-lg transition-all duration-500 ${active.bg}`}>
          <span className="inline-block bg-orange-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-md mb-3">
            {active.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {active.title}
          </h2>
          <p className="text-purple-100 text-sm font-medium">
            {active.subtitle}
          </p>
        </div>

        {/* Peeking Next Card on Right */}
        <div className="w-16 sm:w-24 p-6 rounded-2xl bg-orange-500 text-white flex-shrink-0 opacity-90 hidden sm:flex flex-col justify-center items-center shadow-lg">
          <span className="text-xs font-black uppercase rotate-90 whitespace-nowrap tracking-wider">
            {next.badge || 'AD 2/5'}
          </span>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? 'w-5 bg-purple-700' : 'w-2 bg-purple-200 hover:bg-purple-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
