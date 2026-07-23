import React, { useState } from 'react';
import { ChevronDown, ChevronUp, XCircle, ArrowRight, CheckCircle } from 'lucide-react';

const CandidateCard = ({ application, onAction, hiringProcess = [] }) => {
  const [expanded, setExpanded] = useState(false);
  
  const { 
    applicationId, 
    workerName = 'Unknown', 
    workerBio = '', 
    workerSkillScore = 0, 
    workerSkills = {}, 
    status,
    timestamp
  } = application;

  const isRejected = status === 'Rejected';
  const isHired = status === 'Hired';
  
  const currentStageIndex = hiringProcess.indexOf(status);
  const isAtLastStage = currentStageIndex === hiringProcess.length - 2; // Assuming Hired is the actual last logical outcome
  // We'll consider it last stage if it's the element right before 'Hired' or just the end of the array if 'Hired' isn't in it.
  const isBeforeHired = hiringProcess.length > 0 && currentStageIndex === hiringProcess.length - 1;

  const getScoreColor = (score) => {
    if (score < 40) return 'border-red-500 text-red-500';
    if (score < 70) return 'border-orange-500 text-orange-500';
    return 'border-emerald-500 text-emerald-500';
  };

  const getScoreBgColor = (score) => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleAction = (e, newStatus) => {
    e.stopPropagation();
    if (onAction) {
      onAction(applicationId, newStatus);
    }
  };

  const getNextStage = () => {
    if (currentStageIndex >= 0 && currentStageIndex < hiringProcess.length - 1) {
      return hiringProcess[currentStageIndex + 1];
    }
    return 'Hired'; // Fallback
  };

  return (
    <div 
      className="bg-white/5 border border-white/10 rounded-xl mb-3 overflow-hidden cursor-pointer hover:bg-white/[0.08] transition-all shadow-sm"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getScoreColor(workerSkillScore)} bg-black/40`}>
            {workerSkillScore}
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">{workerName}</h4>
            <p className="text-xs text-gray-500">Applied {formatDate(timestamp)}</p>
          </div>
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`px-4 transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="pt-2 border-t border-white/10">
          <p className="text-sm text-gray-300 mb-4 line-clamp-3">
            {workerBio || 'No bio provided.'}
          </p>
          
          {Object.keys(workerSkills).length > 0 && (
            <div className="mb-4 space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills</span>
              {Object.entries(workerSkills).map(([skill, score]) => (
                <div key={skill} className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 w-24 truncate">{skill}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getScoreBgColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{score}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-5">
            {isRejected ? (
              <div className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-center rounded-lg text-sm font-medium">
                Rejected
              </div>
            ) : isHired ? (
              <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-lg text-sm font-medium">
                Hired
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => handleAction(e, 'Rejected')}
                  className="flex-1 py-2 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                
                {isBeforeHired || isAtLastStage ? (
                  <button
                    onClick={(e) => handleAction(e, 'Hired')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Hire
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAction(e, getNextStage())}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
