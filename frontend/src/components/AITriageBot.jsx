import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, AlertCircle, Activity } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AITriageBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTriage = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/ai/triage', { symptoms });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setResult(null);
    setSymptoms('');
    setError('');
  };

  const getUrgencyColor = (urgency) => {
    if (!urgency) return 'bg-blue-100 text-blue-800 border-blue-200';
    const lower = urgency.toLowerCase();
    if (lower.includes('high')) return 'bg-red-100 text-red-800 border-red-200';
    if (lower.includes('medium')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4 rounded-full shadow-2xl z-50 hover:shadow-teal-500/30 flex items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={28} className="group-hover:animate-pulse" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-semibold text-sm group-hover:ml-2">
          AI Triage Assistant
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">AI Triage Assistant</h3>
                  <p className="text-xs text-teal-50">Powered by Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 max-h-96 overflow-y-auto bg-slate-50/50">
              {!result && !loading && (
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl rounded-tl-sm text-sm border border-blue-100 shadow-sm inline-block">
                    Hello! I'm your AI Medical Assistant. Please describe your symptoms in detail, and I'll help determine the urgency and the right specialist for you.
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center space-x-2 text-teal-600 mt-4">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm font-medium ml-2 text-slate-500">Analyzing symptoms...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start space-x-3 border border-red-100">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl rounded-tr-sm text-sm inline-block self-end ml-auto max-w-[85%] border border-slate-200">
                    "{symptoms}"
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                    <div className="absolute -top-3 -left-2 bg-teal-500 text-white p-1.5 rounded-full shadow-md">
                      <Bot size={16} />
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Analysis</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.analysis}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended</h4>
                        <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium border border-indigo-100">
                          {result.recommendedSpecialist}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency</h4>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getUrgencyColor(result.urgency)}`}>
                          {result.urgency}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                       <button 
                        onClick={() => { setIsOpen(false); navigate('/booking'); }}
                        className="w-full bg-slate-900 text-white text-sm py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                      >
                        Book {result.recommendedSpecialist}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button onClick={resetChat} className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline">
                      Start new analysis
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleTriage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g., Severe headache and nausea..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={loading || result}
                className="flex-1 bg-slate-100 border-none px-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 disabled:opacity-50 transition-all"
              />
              <button 
                type="submit" 
                disabled={!symptoms.trim() || loading || result}
                className="bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:hover:bg-teal-500 shadow-md shadow-teal-500/20"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
