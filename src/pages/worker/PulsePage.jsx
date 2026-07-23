import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import HeroBannerCarousel from '../../components/HeroBannerCarousel';
import { Search, ChevronDown, Bell, MapPin, Calendar } from 'lucide-react';

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
      price: 'Free',
      isFree: true
    },
    {
      id: 'e2',
      title: 'D2C Brand Marketing Summit',
      venue: 'Prestige Institute • Gwalior, MP (12 KM)',
      price: '₹99',
      isFree: false
    },
    {
      id: 'e3',
      title: 'AI & Web Development Workshop',
      venue: 'IIT Campus • Gwalior, MP (6 KM)',
      price: 'Free',
      isFree: true
    }
  ];

  const handleBook = (event) => {
    addToast(`Booked ticket for ${event.title}! Sent to My Bookings.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-8 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-lg">
              ⏳
            </div>
            <h1 className="text-2xl font-extrabold text-[#5B21B6]">Campus Pulse</h1>
          </div>
          <Bell className="w-6 h-6 text-purple-900" />
        </div>

        {/* Hero Banner Carousel */}
        <HeroBannerCarousel banners={pulseBanners} />

        {/* Campus Events Section with My Bookings button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-[#5B21B6]">Campus Events</h2>
          <button
            onClick={() => addToast('Displaying your booked event passes', 'info')}
            className="btn-orange text-xs py-2 px-4 shadow-md"
          >
            My Bookings
          </button>
        </div>

        {/* Search & Distance Row matching Screenshot 4 */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center bg-[#EDE9FE]/40 border border-purple-100 rounded-2xl px-4 py-3">
            <Search className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search City..."
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
            />
          </div>

          <div className="relative">
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="appearance-none bg-white border border-purple-100 rounded-2xl px-4 py-3 pr-8 text-sm font-bold text-gray-800 cursor-pointer shadow-sm"
            >
              <option value="5 KM">5 KM</option>
              <option value="10 KM">10 KM</option>
              <option value="25 KM">25 KM</option>
              <option value="50 KM">50 KM</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Event Cards matching Screenshot 4 */}
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleBook(event)}
              className="app-card p-4 flex items-center justify-between cursor-pointer bg-white hover:border-purple-300 transition-all"
            >
              <div>
                <h3 className="font-extrabold text-base text-[#5B21B6] leading-snug">
                  {event.title}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  {event.venue}
                </p>
              </div>

              <div className="text-right flex-shrink-0 ml-4">
                <span className={`font-extrabold text-sm ${event.isFree ? 'text-orange-500' : 'text-purple-700'}`}>
                  {event.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
