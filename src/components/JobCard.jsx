import React from 'react';
import { DollarSign, ChevronRight, Check, MapPin, Laptop, Code } from 'lucide-react';

const JobCard = ({ job, onApply, applied, onClick }) => {
  const { title, type, pay, description, location = 'Remote', workMode = 'Remote', skills = [], hiringProcess = [] } = job;

  const getTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'gig': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'internship': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'job': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (!applied && onApply) {
      onApply(job);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-white/[0.08] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer group hover:-translate-y-1 flex flex-col"
    >
      {/* Type badge & Compensation */}
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getTypeBadgeColor(type)}`}>
          {type || 'Gig'}
        </span>
        <div className="flex items-center text-orange-400 font-bold">
          <DollarSign className="w-4 h-4 mr-0.5" />
          <span>{pay}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
        {title}
      </h3>
      
      {/* Location & Work Mode */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
          {location}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Laptop className="w-3.5 h-3.5 text-orange-400" />
          {workMode}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
        {description}
      </p>

      {/* Required Skills pills */}
      {skills.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {skills.map((skill, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Hiring Process Stepper */}
      {hiringProcess.length > 0 && (
        <div className="mb-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {hiringProcess.map((stage, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
                  <span>{stage}</span>
                </div>
                {index < hiringProcess.length - 1 && (
                  <div className="w-3 h-px bg-white/10"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/5">
        <span className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center group/link">
          View Details
          <ChevronRight className="w-4 h-4 ml-0.5 transform group-hover/link:translate-x-1 transition-transform" />
        </span>
        
        <button
          onClick={handleApplyClick}
          disabled={applied}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            applied 
              ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed border border-emerald-500/30' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
          }`}
        >
          {applied ? (
            <>
              Applied <Check className="w-3.5 h-3.5" />
            </>
          ) : (
            'Quick Apply'
          )}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
