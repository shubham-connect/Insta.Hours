import React from 'react';
import { Search, X, Filter, MapPin, Laptop, Layers, Code, DollarSign } from 'lucide-react';
import { LOCATIONS, WORK_MODES, ROLE_CATEGORIES, POPULAR_SKILLS } from '../utils/mockData';

const FilterSidebar = ({ filters, onFilterChange, hideOpportunityType = false, allowedOpportunityTypes = null }) => {
  const allJobTypes = ['All', 'Gig', 'Internship', 'Job'];
  const displayJobTypes = allowedOpportunityTypes ? ['All', ...allowedOpportunityTypes] : allJobTypes;

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleTypeChange = (type) => {
    onFilterChange({ ...filters, type: type === 'All' ? null : type });
  };

  const handleLocationChange = (e) => {
    const loc = e.target.value === 'All Locations' ? null : e.target.value;
    onFilterChange({ ...filters, location: loc });
  };

  const handleWorkModeChange = (mode) => {
    onFilterChange({ ...filters, workMode: mode === 'All Modes' ? null : mode });
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value === 'All Categories' ? null : e.target.value;
    onFilterChange({ ...filters, roleCategory: cat });
  };

  const handlePayoutChange = (e) => {
    const pay = e.target.value === 'All Payouts' ? null : e.target.value;
    onFilterChange({ ...filters, payout: pay });
  };

  const toggleSkill = (skill) => {
    const currentSkills = filters.skills || [];
    let updated;
    if (currentSkills.includes(skill)) {
      updated = currentSkills.filter(s => s !== skill);
    } else {
      updated = [...currentSkills, skill];
    }
    onFilterChange({ ...filters, skills: updated });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      type: null,
      location: null,
      workMode: null,
      roleCategory: null,
      payout: null,
      skills: []
    });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.type || filters.location || filters.workMode || filters.roleCategory || filters.payout || (filters.skills && filters.skills.length > 0)
  );

  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(109,40,217,0.06)] space-y-6">
      <div className="flex items-center justify-between text-gray-900 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-700" />
          <h2 className="font-extrabold text-base text-[#5B21B6]">Filter Opportunities</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold"
          >
            Reset
          </button>
        )}
      </div>

      {/* 1. Keyword Search */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Keywords</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Role, title, or keywords..."
            className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 2. Opportunity Type (Hidden on Gigs tab, Custom on Careers tab) */}
      {!hideOpportunityType && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opportunity Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {displayJobTypes.map((type) => {
              const isSelected = (filters.type === type) || (type === 'All' && !filters.type);
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center border ${
                    isSelected 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-sm' 
                      : 'bg-purple-50/50 border-purple-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. City / Location */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-600" /> City / Location
        </label>
        <select
          value={filters.location || 'All Locations'}
          onChange={handleLocationChange}
          className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
        >
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc} className="bg-white text-gray-900">{loc}</option>
          ))}
        </select>
      </div>

      {/* 4. Work Mode */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Laptop className="w-3.5 h-3.5 text-orange-500" /> Work Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {WORK_MODES.map(mode => {
            const isSelected = (filters.workMode === mode) || (mode === 'All Modes' && !filters.workMode);
            return (
              <button
                key={mode}
                onClick={() => handleWorkModeChange(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center border ${
                  isSelected 
                    ? 'bg-purple-700 border-purple-700 text-white shadow-sm' 
                    : 'bg-purple-50/50 border-purple-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Payout Filter */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Pay / Payout Range
        </label>
        <select
          value={filters.payout || 'All Payouts'}
          onChange={handlePayoutChange}
          className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
        >
          <option value="All Payouts" className="bg-white">All Payout Ranges</option>
          <option value="Under ₹1,000" className="bg-white">Under ₹1,000</option>
          <option value="₹1,000 - ₹5,000" className="bg-white">₹1,000 - ₹5,000</option>
          <option value="Above ₹5,000" className="bg-white">Above ₹5,000 / month</option>
        </select>
      </div>

      {/* 6. Role Category */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-600" /> Role Category
        </label>
        <select
          value={filters.roleCategory || 'All Categories'}
          onChange={handleCategoryChange}
          className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
        >
          {ROLE_CATEGORIES.map(cat => (
            <option key={cat} value={cat} className="bg-white text-gray-900">{cat}</option>
          ))}
        </select>
      </div>

      {/* 7. Required Skills */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-purple-600" /> Required Skills
        </label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.map(skill => {
            const isSelected = filters.skills?.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-purple-50 text-gray-600 border-purple-100 hover:border-purple-300 hover:text-purple-800'
                }`}
              >
                {skill} {isSelected && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-purple-100">
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-200"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
