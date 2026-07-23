import React from 'react';
import Modal from './Modal';
import { Send, CheckCircle2, MapPin, Laptop, Layers } from 'lucide-react';

export default function JobDetailModal({ job, isOpen, onClose, onApply, applied }) {
  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="text-white p-2">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
              {job.type}
            </span>
            {job.roleCategory && (
              <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium border border-white/10 flex items-center gap-1">
                <Layers className="w-3 h-3 text-orange-400" /> {job.roleCategory}
              </span>
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-3">{job.title}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="text-orange-400 font-bold text-lg">{job.pay}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-gray-300">
              <MapPin className="w-4 h-4 text-purple-400" /> {job.location || 'Remote'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-gray-300">
              <Laptop className="w-4 h-4 text-orange-400" /> {job.workMode || 'Remote'}
            </span>
          </div>
        </div>

        {/* Required Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-purple-600/30 text-purple-200 border border-purple-500/30 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">Description & Responsibilities</h3>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
            {job.description}
          </p>
        </div>

        {job.hiringProcess && job.hiringProcess.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-6 text-gray-200">Hiring Process Pipeline</h3>
            <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-700 -z-10 -translate-y-1/2"></div>
              {job.hiringProcess.map((stage, index) => (
                <div key={index} className="flex flex-col items-center relative z-10 bg-[#1a1025] px-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-sm font-bold border-2 border-[#1a1025] shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    {index + 1}
                  </div>
                  <span className="text-xs text-gray-400 mt-2 text-center max-w-[80px] leading-tight">
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          {applied ? (
            <button 
              disabled
              className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium py-3.5 rounded-xl flex items-center justify-center cursor-not-allowed text-sm"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Already Applied
            </button>
          ) : (
            <button 
              onClick={onApply}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] text-sm"
            >
              Apply Now
              <Send className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
