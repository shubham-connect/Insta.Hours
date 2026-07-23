import React from 'react';
import Modal from './Modal';
import { Send, CheckCircle2, MapPin, Laptop, Layers } from 'lucide-react';

export default function JobDetailModal({ job, isOpen, onClose, onApply, applied }) {
  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={job.title} size="lg">
      <div className="text-gray-900 space-y-6">
        
        {/* Header Badges & Compensation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-extrabold border border-purple-200">
              {job.type}
            </span>
            {job.roleCategory && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-orange-500" /> {job.roleCategory}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-700">
            <span className="text-orange-600 font-black text-xl">{job.pay}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gray-600 font-extrabold">
              <MapPin className="w-4 h-4 text-purple-600" /> {job.location || 'Remote'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gray-600 font-extrabold">
              <Laptop className="w-4 h-4 text-orange-500" /> {job.workMode || 'Remote'}
            </span>
          </div>
        </div>

        {/* Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-200 rounded-full text-xs font-extrabold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-base font-extrabold text-[#5B21B6] mb-2">Description & Responsibilities</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm font-semibold">
            {job.description}
          </p>
        </div>

        {/* Hiring Process Pipeline */}
        {job.hiringProcess && job.hiringProcess.length > 0 && (
          <div>
            <h3 className="text-base font-extrabold text-[#5B21B6] mb-4">Hiring Evaluation Pipeline</h3>
            <div className="flex items-center justify-between relative px-6 py-4 bg-purple-50/40 rounded-2xl border border-purple-100">
              {job.hiringProcess.map((stage, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                    {index + 1}
                  </div>
                  <span className="text-xs font-bold text-purple-900 mt-1.5">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply CTA Button */}
        <div className="pt-2">
          {applied ? (
            <button 
              disabled
              className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold py-3.5 rounded-xl flex items-center justify-center cursor-not-allowed text-sm"
            >
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
              Already Applied
            </button>
          ) : (
            <button 
              onClick={onApply}
              className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-purple-600/20 text-sm"
            >
              Apply Now
              <Send className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
