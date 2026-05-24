import { useState } from 'react';
import { FileText, Upload, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function RecordsTab({ records, fetchRecords }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');
  const [loading, setLoading] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert('Please provide a file and title');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);

    try {
      setLoading(true);
      await api.post('/records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setFile(null);
      fetchRecords();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
      setRecordToDelete(null);
    } catch (error) {
      alert('Failed to delete record');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-100/50"
      >
        <h2 className="text-xl font-bold text-slate-800 flex items-center mb-6"><Upload size={22} className="mr-3 text-blue-600" /> Upload New Record</h2>
        <form onSubmit={handleUpload} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="e.g. Blood Test" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
              <option>Lab Report</option>
              <option>X-Ray</option>
              <option>Prescription</option>
              <option>Other</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">File</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required className="w-full p-2.5 rounded-xl border border-slate-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={loading} className="w-full p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100">
              {loading ? 'Uploading...' : 'Upload Record'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Records List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100/50 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center"><FileText size={22} className="mr-3 text-blue-600" /> My Health Records</h2>
        </div>
        <div className="divide-y divide-slate-100/50">
          {records.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <FileText size={48} className="mb-4 text-slate-300" />
              <p>No medical records uploaded yet.</p>
            </div>
          ) : (
            <AnimatePresence>
              {records.map((record, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, padding: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={record._id} 
                  className="p-6 flex items-center justify-between hover:bg-blue-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{record.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{record.type} • <span className="text-slate-400">Uploaded on {new Date(record.date).toLocaleDateString()}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={(() => {
                      if (!record.fileUrl) return '';
                      if (!record.fileUrl.startsWith('http')) return `http://localhost:5000${record.fileUrl}`;
                      if (record.fileUrl.includes('cloudinary.com') && record.fileUrl.includes('/image/upload/')) {
                        return record.fileUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
                      }
                      return record.fileUrl;
                    })()} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-blue-600 shadow hover:shadow-md hover:bg-blue-600 hover:text-white rounded-xl transition-all" title="Download">
                      <Download size={20} />
                    </a>
                    <button onClick={() => setRecordToDelete(record._id)} className="p-2.5 bg-white text-rose-500 shadow hover:shadow-md hover:bg-rose-500 hover:text-white rounded-xl transition-all" title="Delete">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {recordToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Delete Record?</h3>
              <p className="text-slate-500 text-center mb-8">Are you sure you want to delete this record? This action cannot be undone.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setRecordToDelete(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(recordToDelete)}
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
