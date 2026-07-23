import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { demoStore } from '../../utils/demoStore';
import { LOCATIONS, WORK_MODES, ROLE_CATEGORIES } from '../../utils/mockData';
import { Briefcase, Clock, GraduationCap, DollarSign, Rocket, Plus, X, GripVertical, MapPin, Laptop, Layers, Code } from 'lucide-react';

export default function CreateJob() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Gig', // 'Gig', 'Internship', 'Job'
    pay: '',
    location: 'Remote',
    workMode: 'Remote',
    roleCategory: 'Software Engineering',
    skillsText: 'React, Node.js',
    description: ''
  });

  const [hiringProcess, setHiringProcess] = useState(['Application', 'Interview', 'Hired']);
  const [customMode, setCustomMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const templates = [
    { name: 'Direct Hire', stages: ['Application', 'Hired'] },
    { name: '1-Round Interview', stages: ['Application', 'Interview', 'Hired'] },
    { name: '2-Round Interview', stages: ['Application', 'Technical Round', 'Interview', 'Hired'] }
  ];

  const handleApplyTemplate = (stages) => {
    setHiringProcess([...stages]);
    setCustomMode(false);
  };

  const handleAddStage = () => {
    const newProcess = [...hiringProcess];
    newProcess.splice(newProcess.length - 1, 0, 'New Stage');
    setHiringProcess(newProcess);
  };

  const handleRemoveStage = (index) => {
    if (index === 0) return; // Cannot remove 'Application'
    const newProcess = [...hiringProcess];
    newProcess.splice(index, 1);
    setHiringProcess(newProcess);
  };

  const handleStageChange = (index, value) => {
    const newProcess = [...hiringProcess];
    newProcess[index] = value;
    setHiringProcess(newProcess);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.type) newErrors.type = 'Please select a job type';
    if (!formData.pay.trim()) newErrors.pay = 'Please specify compensation';
    if (!formData.description.trim() || formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (hiringProcess.length < 2) newErrors.process = 'Hiring process must have at least 2 stages';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const parsedSkills = formData.skillsText
        ? formData.skillsText.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const newJobData = {
        employerId: user?.uid || 'employer_demo_1',
        title: formData.title,
        type: formData.type,
        pay: formData.pay,
        location: formData.location,
        workMode: formData.workMode,
        roleCategory: formData.roleCategory,
        skills: parsedSkills,
        description: formData.description,
        hiringProcess,
        isActive: true
      };

      if (!isFirebaseConfigured) {
        demoStore.addJob(newJobData);
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...newJobData,
          createdAt: serverTimestamp()
        });
      }
      
      addToast('Job posted successfully!', 'success');
      navigate('/employer/postings');
    } catch (error) {
      console.error(error);
      addToast('Failed to post job.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0B1A] text-white p-4 md:p-8 pt-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Job Posting</h1>
          <p className="text-gray-400">Define role details, location, compensation, and hiring pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. React Frontend Developer / Social Media Intern"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Opportunity Type</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: 'Gig', icon: Clock, desc: 'Short term / Hourly' },
                { type: 'Internship', icon: GraduationCap, desc: '1-6 Months stipend' },
                { type: 'Job', icon: Briefcase, desc: 'Full time position' }
              ].map(({ type, icon: Icon, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    formData.type === type 
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-sm font-bold">{type}</span>
                  <span className="text-[10px] text-gray-400">{desc}</span>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* Location & Work Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-400" /> City / Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {LOCATIONS.filter(l => l !== 'All Locations').map(loc => (
                  <option key={loc} value={loc} className="bg-gray-900 text-white">{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-orange-400" /> Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {WORK_MODES.filter(m => m !== 'All Modes').map(mode => (
                  <option key={mode} value={mode} className="bg-gray-900 text-white">{mode}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Category & Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> Role Category
              </label>
              <select
                value={formData.roleCategory}
                onChange={(e) => setFormData({...formData, roleCategory: e.target.value})}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {ROLE_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-orange-400" /> Compensation / Pay
              </label>
              <input
                type="text"
                value={formData.pay}
                onChange={(e) => setFormData({...formData, pay: e.target.value})}
                placeholder="e.g. ₹800/hr or ₹20,000/month"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
              {errors.pay && <p className="text-red-400 text-xs mt-1">{errors.pay}</p>}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-purple-400" /> Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={formData.skillsText}
              onChange={(e) => setFormData({...formData, skillsText: e.target.value})}
              placeholder="e.g. React, Node.js, Python, Tailwind"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description & Responsibilities</label>
            <textarea
              rows="5"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the role, expectations, and requirements..."
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            ></textarea>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Hiring Process Pipeline */}
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-bold mb-4">Hiring Process Pipeline</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.stages)}
                  className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                    !customMode && JSON.stringify(hiringProcess) === JSON.stringify(tpl.stages)
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                  customMode
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Custom
              </button>
            </div>

            {customMode ? (
              <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                {hiringProcess.map((stage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-600 cursor-move" />
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => handleStageChange(index, e.target.value)}
                      readOnly={index === 0}
                      className={`flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 ${index === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="mt-3 flex items-center text-sm text-purple-400 hover:text-purple-300 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Stage
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between relative px-8 py-6">
                <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-700 -z-10 -translate-y-1/2"></div>
                {hiringProcess.map((stage, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10 bg-[#0F0B1A] px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-sm font-bold border-2 border-[#0F0B1A]">
                      {index + 1}
                    </div>
                    <span className="text-xs text-gray-300 mt-2 font-medium">{stage}</span>
                  </div>
                ))}
              </div>
            )}
            {errors.process && <p className="text-red-500 text-sm mt-1">{errors.process}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors mt-8 shadow-lg shadow-purple-500/20"
          >
            {isSubmitting ? 'Posting Job...' : (
              <>
                Publish Job Posting <Rocket className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
