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
    if (index === 0) return;
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
      demoStore.addJob({
        employerId: 'employer_demo_1',
        title: formData.title,
        type: formData.type,
        pay: formData.pay,
        location: formData.location,
        workMode: formData.workMode,
        roleCategory: formData.roleCategory,
        skills: formData.skillsText ? formData.skillsText.split(',').map(s => s.trim()) : [],
        description: formData.description,
        hiringProcess,
        isActive: true
      });
      addToast('Job posted successfully!', 'success');
      navigate('/employer/postings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-purple-100">
          <h1 className="text-2xl sm:text-4xl font-black text-[#5B21B6]">Create New Job Posting</h1>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">Define role details, location, compensation, and hiring evaluation pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="app-card bg-white border border-purple-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. React Frontend Developer / Social Media Intern"
              className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
            />
            {errors.title && <p className="text-red-500 text-xs font-bold mt-1">{errors.title}</p>}
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Opportunity Type</label>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { type: 'Gig', icon: Clock, desc: 'Short term / Hourly' },
                { type: 'Internship', icon: GraduationCap, desc: '1-6 Months stipend' },
                { type: 'Job', icon: Briefcase, desc: 'Full time position' }
              ].map(({ type, icon: Icon, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                    formData.type === type 
                      ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm' 
                      : 'border-purple-100 bg-purple-50/30 text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${formData.type === type ? 'text-purple-700' : 'text-gray-400'}`} />
                  <span className="text-sm font-extrabold">{type}</span>
                  <span className="text-[10px] font-semibold text-gray-400">{desc}</span>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red-500 text-xs font-bold mt-1">{errors.type}</p>}
          </div>

          {/* Location & Work Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" /> City / Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                {LOCATIONS.filter(l => l !== 'All Locations').map(loc => (
                  <option key={loc} value={loc} className="bg-white text-gray-900">{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-orange-500" /> Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                {WORK_MODES.filter(m => m !== 'All Modes').map(mode => (
                  <option key={mode} value={mode} className="bg-white text-gray-900">{mode}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Category & Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" /> Role Category
              </label>
              <select
                value={formData.roleCategory}
                onChange={(e) => setFormData({...formData, roleCategory: e.target.value})}
                className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                {ROLE_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                  <option key={cat} value={cat} className="bg-white text-gray-900">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-orange-500" /> Compensation / Pay
              </label>
              <input
                type="text"
                value={formData.pay}
                onChange={(e) => setFormData({...formData, pay: e.target.value})}
                placeholder="e.g. ₹800/hr or ₹20,000/month"
                className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
              />
              {errors.pay && <p className="text-red-500 text-xs font-bold mt-1">{errors.pay}</p>}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-purple-600" /> Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={formData.skillsText}
              onChange={(e) => setFormData({...formData, skillsText: e.target.value})}
              placeholder="e.g. React, Node.js, Python, Tailwind"
              className="w-full bg-purple-50/50 border border-purple-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description & Responsibilities</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the role, expectations, and requirements..."
              className="w-full p-4 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600 resize-none"
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description}</p>}
          </div>

          {/* Hiring Process Pipeline */}
          <div className="border-t border-purple-100 pt-6">
            <h3 className="text-base font-extrabold text-[#5B21B6] mb-3">Hiring Evaluation Pipeline</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.stages)}
                  className={`p-3 rounded-xl border text-xs font-extrabold transition-all ${
                    !customMode && JSON.stringify(hiringProcess) === JSON.stringify(tpl.stages)
                      ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                      : 'border-purple-100 bg-purple-50/30 text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className={`p-3 rounded-xl border text-xs font-extrabold transition-all ${
                  customMode
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-purple-100 bg-purple-50/30 text-gray-600 hover:bg-purple-50'
                }`}
              >
                Custom Pipeline
              </button>
            </div>

            {customMode ? (
              <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                {hiringProcess.map((stage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-purple-400 cursor-move" />
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => handleStageChange(index, e.target.value)}
                      readOnly={index === 0}
                      className={`flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-600 ${index === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="mt-2 flex items-center text-xs text-purple-700 hover:text-purple-900 font-extrabold"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Stage
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between relative px-6 py-4 bg-purple-50/40 rounded-2xl border border-purple-100">
                {hiringProcess.map((stage, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#6D28D9] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold text-purple-900 mt-1.5">{stage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center transition-all mt-6"
          >
            {isSubmitting ? 'Publishing...' : (
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
