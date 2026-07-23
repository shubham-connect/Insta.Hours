import React from 'react';
import CandidateCard from './CandidateCard';

const KanbanColumn = ({ title, candidates = [], onAction, hiringProcess, color = 'bg-purple-500' }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-full min-h-[500px] overflow-hidden flex-shrink-0 w-80">
      {/* Top Accent Line */}
      <div className={`h-1 w-full ${color}`}></div>
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
        <h3 className="font-semibold text-white text-sm uppercase tracking-wider">{title}</h3>
        <span className="bg-white/10 text-gray-300 text-xs py-1 px-2.5 rounded-full font-medium">
          {candidates.length}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        {candidates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-xl">
            <p className="text-sm text-gray-500">No candidates in this stage</p>
          </div>
        ) : (
          candidates.map((app) => (
            <CandidateCard 
              key={app.applicationId} 
              application={app} 
              onAction={onAction}
              hiringProcess={hiringProcess}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
