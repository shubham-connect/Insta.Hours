import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import HeroBannerCarousel from '../../components/HeroBannerCarousel';
import { Search, ChevronDown, Bell, MapPin, Calendar, Ticket, Zap } from 'lucide-react';

export default function PulsePage() {
  const { addToast } = useToast();
  const [searchCity, setSearchCity] = useState('');
  const [distance, setDistance] = useState('10 KM');

  const pulseBanners = [
    {
      badge: 'AD 1/5 • PROMOTED',
      title: 'Tech Symposium 2026',
      subtitle: 'Biggest IT Event in City • Free Entry',
      bg: 'bg-gradient-to-r from-purple-800 to-indigo-800'
    },
    {
      badge: 'AD 2/5 • FEATURED',
      title: 'Hackathon 2026',
      subtitle: '₹50,000 Cash Prize Pool • Register Now',
      bg: 'bg-gradient-to-r from-purple-700 to-violet-800'
    }
  ];

  const events = [
    {
      id: 'e1',
      title: 'Startup Pitch Night',
      venue: 'Gwalior Tech Incubator • Gwalior, MP (4 KM)',
      date: '28th July 2026',
      price: 'Free',
      isFree: true
    },
    {
      id: 'e2',
      title: 'D2C Brand Marketing Summit',
      venue: 'Prestige Institute • Gwalior, MP (12 KM)',
      date: '2nd August 2026',
      price: '₹99',
      isFree: false
    },
    {
      id: 'e3',
      title: 'AI & Web Development Workshop',
      venue: 'IIT Campus • Gwalior, MP (6 KM)',
      date: '10th August 2026',
      price: 'Free',
      isFree: true
    },
    {
      id: 'e4',
      title: 'UI/UX Design Masterclass',
      venue: 'Innovation Hub • Gwalior, MP (8 KM)',
      date: '15th August 2026',
      price: '₹149',
      isFree: false
    }
  ];

  const handleBook = (event) => {
    addToast(`Booked ticket for ${event.title}! Sent to My Bookings.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-lg">
              ⏳
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5B21B6]">Campus Pulse</h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Discover local campus events, hackathons, and tech summits near you</p>
            </div>
          </div>
          <Bell className="w-6 h-6 text-purple-900" />
        </div>

        {/* 2-Column Wide Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (1/3 width): Hero Carousel & Search Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search & Distance Filters */}
            <div className="app-card p-5 bg-white border border-purple-100 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-[#5B21B6]">Filter Campus Events</h3>

              <div className="flex items-center bg-purple-50/50 border border-purple-200 rounded-2xl px-4 py-3">
                <Search className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Search City or Venue..."
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Distance Range
                </label>
                <div className="relative">
                  <select
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full appearance-none bg-white border border-purple-200 rounded-2xl px-4 py-3 pr-8 text-sm font-bold text-gray-800 cursor-pointer shadow-sm"
                  >
                    <option value="5 KM">Within 5 KM</option>
                    <option value="10 KM">Within 10 KM</option>
                    <option value="25 KM">Within 25 KM</option>
                    <option value="50 KM">Within 50 KM</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Hero Banner Carousel */}
            <HeroBannerCarousel banners={pulseBanners} />
          </div>

          {/* Right Column (2/3 width): Campus Events Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#5B21B6]">Upcoming Campus Events</h2>
              <button
                onClick={() => addToast('Displaying your booked event passes', 'info')}
                className="btn-orange text-xs py-2 px-5 shadow-md"
              >
                My Bookings
              </button>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleBook(event)}
                  className="app-card p-5 flex flex-col justify-between cursor-pointer bg-white border border-purple-100 rounded-2xl hover:border-purple-300 transition-all shadow-sm space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-base text-[#5B21B6] leading-snug">
                        {event.title}
                      </h3>
                      <span className={`font-extrabold text-sm ${event.isFree ? 'text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg' : 'text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg'}`}>
                        {event.price}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      {event.venue}
                    </p>

                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> {event.date}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-50 flex justify-end">
                    <button className="text-xs font-extrabold text-white bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-xl transition-all shadow-md">
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
