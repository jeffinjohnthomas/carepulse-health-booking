import { useState } from 'react';
import { Bot } from 'lucide-react';
import api from '../../services/api';

export default function AITab() {
  const [aiFile, setAiFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const handleAiAnalyze = async (e) => {
    e.preventDefault();
    if (!aiFile) return alert('Please select a file to analyze');
    
    const formData = new FormData();
    formData.append('file', aiFile);

    try {
      setAiLoading(true);
      setAiResult('');
      const res = await api.post('/ai/parse-record', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiResult(res.data.analysis);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to analyze document');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-3xl shadow-sm border border-teal-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-teal-900 flex items-center mb-3">
            <Bot size={28} className="mr-3 text-teal-600" />
            Instant AI Medical Analysis
          </h2>
          <p className="text-teal-700 mb-8 max-w-2xl text-lg">
            Upload a blood test report, prescription, or medical document (PDF, JPG, PNG). Our AI will extract the key metrics and summarize it for you instantly without saving it permanently to your records.
          </p>
          
          <form onSubmit={handleAiAnalyze} className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="file" 
              accept=".pdf,image/jpeg,image/png,image/webp,text/plain"
              onChange={(e) => setAiFile(e.target.files[0])} 
              className="w-full sm:flex-1 p-3.5 rounded-xl border border-teal-200 bg-white/70 backdrop-blur-sm file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 transition-colors" 
            />
            <button 
              type="submit" 
              disabled={aiLoading || !aiFile} 
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-teal-500/30 hover:-translate-y-0.5"
            >
              {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </form>

          {aiResult && (
            <div className="mt-8 bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-teal-100 shadow-xl shadow-teal-900/5">
              <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 flex items-center">
                <Bot size={18} className="mr-2" />
                AI Summary
              </h4>
              <div className="prose prose-teal max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {aiResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
