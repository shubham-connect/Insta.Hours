import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Search, ChevronDown, Bell, MapPin, Calendar, Tag, DollarSign, Filter, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PulsePage() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [distance, setDistance] = useState('10 KM');
  const [category, setCategory] = useState('All');
  const [entryType, setEntryType] = useState('All');

  // 5 Promoted Banners for Auto-Play Carousel (2 Seconds Auto Move)
  const pulseBanners = [
    {
      id: 1,
      badge: 'AD 1/5 • PROMOTED',
      title: 'Tech Symposium 2026',
      subtitle: 'Free Entry • IIT Campus Gwalior',
      bg: 'from-purple-800 to-indigo-800'
    },
    {
      id: 2,
      badge: 'AD 2/5 • FEATURED',
      title: 'Hackathon 2026',
      subtitle: '₹50,000 Cash Prize Pool • Register',
      bg: 'from-purple-700 to-violet-800'
    },
    {
      id: 3,
      badge: 'AD 3/5 • HOT EVENT',
      title: 'D2C Brand Marketing Summit',
      subtitle: 'Prestige Institute • Networking Pass',
      bg: 'from-orange-500 to-orange-600'
    },
    {
      id: 4,
      badge: 'AD 4/5 • AI WORKSHOP',
      title: 'AI & Web Dev Bootcamp',
      subtitle: 'Free Certificate • 10th August',
      bg: 'from-indigo-800 to-purple-900'
    },
    {
      id: 5,
      badge: 'AD 5/5 • DESIGN SUMMIT',
      title: 'UI/UX Design Masterclass',
      subtitle: 'Innovation Hub • Live Mentorship',
      bg: 'from-violet-800 to-purple-800'
    }
  ];

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Auto-play Banner Carousel every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => (prevIndex + 1) % pulseBanners.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [pulseBanners.length]);

  const events = [
    {
      id: 'e1',
      title: 'Startup Pitch Night',
      venue: 'Gwalior Tech Incubator • Gwalior, MP (4 KM)',
      date: '28th July 2026',
      price: 'Free',
      category: 'Hackathons & Tech',
      isFree: true
    },
    {
      id: 'e2',
      title: 'D2C Brand Marketing Summit',
      venue: 'Prestige Institute • Gwalior, MP (12 KM)',
      date: '2nd August 2026',
      price: '₹99',
      category: 'Workshops & Summits',
      isFree: false
    },
    {
      id: 'e3',
      title: 'AI & Web Development Workshop',
      venue: 'IIT Campus • Gwalior, MP (6 KM)',
      date: '10th August 2026',
      price: 'Free',
      category: 'Hackathons & Tech',
      isFree: true
    },
    {
      id: 'e4',
      title: 'UI/UX Design Masterclass',
      venue: 'Innovation Hub • Gwalior, MP (8 KM)',
      date: '15th August 2026',
      price: '₹149',
      category: 'Design & Arts',
      isFree: false
    }
  ];

  const handleBook = (event) => {
    addToast(`Booked ticket for ${event.title}! Sent to My Bookings.`, 'success');
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = category === 'All' || e.category === category;
    const matchesEntry = entryType === 'All' || (entryType === 'Free' && e.isFree) || (entryType === 'Paid' && !e.isFree);
    return matchesSearch && matchesCat && matchesEntry;
  });

  const currentBanner = pulseBanners[activeBannerIndex];

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER SECTION (Separated Title on Left, Standalone Auto-Play 2s Carousel on Right) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-purple-100">
          
          {/* Left Side: Campus Pulse Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-md">
              ⏳
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6]">Campus Pulse</h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">Discover local campus events, hackathons, and tech summits near you</p>
            </div>
          </div>

          {/* Right Side: Standalone Individual Auto-Playing Banner Carousel (2-Second Auto Move) */}
          <div className="w-full lg:w-96 flex-shrink-0 relative">
            <div className={`bg-gradient-to-r ${currentBanner.bg} text-white p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-500 transform scale-100`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-white bg-black/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentBanner.badge}
                </span>
                <span className="text-[10px] text-purple-200 font-bold">Auto-Moving ⏱️ 2s</span>
              </div>
              <h3 className="font-extrabold text-base leading-snug">{currentBanner.title}</h3>
              <p className="text-xs text-purple-100 font-medium mt-0.5">{currentBanner.subtitle}</p>

              {/* Carousel Pagination Dots */}
              <div className="flex gap-1.5 justify-center mt-3">
                {pulseBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeBannerIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Wide Desktop Grid with Stretched Left Filter Box */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column (1/4 width): Stretched Full Height Filter Box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="app-card p-6 bg-white border border-purple-100 rounded-3xl space-y-6 shadow-sm min-h-[550px] flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
                  <Filter className="w-5 h-5 text-purple-700" />
                  <h3 className="font-extrabold text-base text-[#5B21B6]">Filter Events</h3>
                </div>

                {/* 1. Search Query */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Event</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Event name or city..."
                      className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* 2. Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-purple-600" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Hackathons & Tech">Hackathons & Tech</option>
                    <option value="Workshops & Summits">Workshops & Summits</option>
                    <option value="Design & Arts">Design & Arts</option>
                  </select>
                </div>

                {/* 3. Entry Type (Free / Paid) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Entry Pass
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['All', 'Free', 'Paid'].map(type => (
                      <button
                        key={type}
                        onClick={() => setEntryType(type)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          entryType === type 
                            ? 'bg-purple-700 text-white border-purple-700' 
                            : 'bg-purple-50/50 border-purple-100 text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Distance Range */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> Distance Range
                  </label>
                  <select
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="5 KM">Within 5 KM</option>
                    <option value="10 KM">Within 10 KM</option>
                    <option value="25 KM">Within 25 KM</option>
                    <option value="50 KM">Within 50 KM</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategory('All');
                  setEntryType('All');
                  setDistance('10 KM');
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-all mt-4"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Right Column (3/4 width): Campus Events Grid */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#5B21B6]">Upcoming Campus Events</h2>
              <span className="text-xs font-bold text-gray-500">{filteredEvents.length} Events Found</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleBook(event)}
                  className="app-card p-6 flex flex-col justify-between cursor-pointer bg-white border border-purple-100 rounded-3xl hover:border-purple-300 transition-all shadow-sm space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                          {event.category}
                        </span>
                        <h3 className="font-extrabold text-lg text-[#5B21B6] leading-snug mt-1">
                          {event.title}
                        </h3>
                      </div>
                      <span className={`font-extrabold text-sm ${event.isFree ? 'text-orange-500 bg-orange-50 px-3 py-1 rounded-xl' : 'text-purple-700 bg-purple-50 px-3 py-1 rounded-xl'}`}>
                        {event.price}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      {event.venue}
                    </p>

                    <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" /> {event.date}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-50 flex justify-end">
                    <button className="text-xs font-extrabold text-white bg-purple-700 hover:bg-purple-800 px-5 py-2.5 rounded-xl transition-all shadow-md">
                      Get Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
