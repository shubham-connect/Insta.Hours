import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { demoStore } from '../utils/demoStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Hello! I am your InstaHours AI Hiring & Support Assistant. I can answer support questions or guide you step-by-step to post a new job! Try typing: "Post a job" or "I want to hire"'
    }
  ]);
  const [input, setInput] = useState('');
  
  // Conversational Hiring State Machine
  const [hiringState, setHiringState] = useState({
    active: false,
    step: 0, // 1: title, 2: type, 3: pay, 4: location, 5: skills
    data: { title: '', type: 'Gig', pay: '', location: 'Remote', skills: [] }
  });

  const { addToast } = useToast();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(async () => {
      let aiText = '';
      const lower = userText.toLowerCase();

      // Check if user is in an active conversational hiring flow
      if (hiringState.active) {
        if (hiringState.step === 1) {
          // Step 1: Title received -> Ask Type & Compensation
          setHiringState(prev => ({
            ...prev,
            step: 2,
            data: { ...prev.data, title: userText }
          }));
          aiText = `Got it! "${userText}". Is this a Gig, Internship, or Full Job? And what is the pay/payout rate? (e.g. "Gig, ₹500/reel")`;
        } else if (hiringState.step === 2) {
          // Step 2: Type & Pay received -> Ask Location & Duration
          const isIntern = lower.includes('intern');
          const isJob = lower.includes('job');
          const type = isIntern ? 'Internship' : isJob ? 'Job' : 'Gig';

          setHiringState(prev => ({
            ...prev,
            step: 3,
            data: { ...prev.data, type, pay: userText }
          }));
          aiText = `Awesome! What is the work location or duration? (e.g. "Remote" or "On-Site in Bengaluru")`;
        } else if (hiringState.step === 3) {
          // Step 3: Location received -> Ask Required Skills
          setHiringState(prev => ({
            ...prev,
            step: 4,
            data: { ...prev.data, location: userText }
          }));
          aiText = `Perfect! Lastly, what are the top required skills candidates should have? (e.g. "React, Video Editing")`;
        } else if (hiringState.step === 4) {
          // Step 4: Skills received -> Create Posting in BOTH Firestore & demoStore!
          const finalJob = {
            id: `ai_job_${Date.now()}`,
            title: hiringState.data.title,
            type: hiringState.data.type,
            pay: hiringState.data.pay,
            location: hiringState.data.location,
            workMode: hiringState.data.location,
            skills: userText.split(',').map(s => s.trim()),
            description: `Hired via AI Assistant for ${hiringState.data.title}`,
            employerId: 'employer_demo_1',
            isActive: true,
            createdAt: new Date().toISOString()
          };

          // Save to local demo store
          demoStore.addJob(finalJob);

          // Save to Firestore Database
          if (isFirebaseConfigured && db) {
            try {
              await addDoc(collection(db, 'jobs'), {
                ...finalJob,
                createdAt: serverTimestamp()
              });
            } catch (err) {
              console.warn("Firestore AI posting error:", err);
            }
          }

          setHiringState({ active: false, step: 0, data: {} });

          aiText = `🎉 All details collected! I have created your new ${finalJob.type} posting: "${finalJob.title}" at ${finalJob.pay}! It is now instantly live on the Worker Portal & Postings tab!`;
          addToast('New Posting Created via AI Assistant!', 'success');
        }
      } else {
        // Trigger conversational hiring flow if user asks to post
        if (lower.includes('post') || lower.includes('create') || lower.includes('hire') || lower.includes('gig') || lower.includes('job')) {
          setHiringState({
            active: true,
            step: 1,
            data: {}
          });
          aiText = '🚀 Let\'s create your job posting together step-by-step! First question: What is the Job Title or Role name you want to hire for? (e.g. "Video Editor" or "Sales Rep")';
        } else if (lower.includes('payment') || lower.includes('balance') || lower.includes('billing')) {
          aiText = '💳 Billing Support: Outstanding balances can be paid via UPI or Card under the Billing tab. Platform fee is 10% on verified candidate payouts.';
        } else {
          aiText = '🤖 Thanks for reaching out! Need to post a job or have support questions? Type "Post a job" to start AI Hiring!';
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 hover:scale-105 transition-all ring-4 ring-purple-100"
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="font-extrabold text-xs sm:text-sm pr-1">AI Assistant & Support</span>
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white border border-purple-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-scale-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5B21B6] to-[#6D28D9] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1">
                  InstaHours AI Assistant <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                </h3>
                <p className="text-[10px] text-purple-200 font-semibold">24/7 Employer Support & Step-by-Step AI Job Creator</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F7FC] text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl font-semibold leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#6D28D9] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-purple-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Suggestion Buttons */}
          <div className="p-2 bg-white border-t border-purple-50 flex gap-1.5 overflow-x-auto text-[11px] font-extrabold">
            <button
              onClick={() => setInput('Post a job')}
              className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full whitespace-nowrap hover:bg-purple-100 border border-purple-100"
            >
              ⚡ Start Step-by-Step AI Job Creator
            </button>
            <button
              onClick={() => setInput('How to pay balance?')}
              className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full whitespace-nowrap hover:bg-orange-100 border border-orange-100"
            >
              💳 Billing Support
            </button>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-purple-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask support or type 'Post a job'..."
              className="flex-1 bg-purple-50/50 border border-purple-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
            />
            <button
              type="submit"
              className="p-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl shadow-md transition-all flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
