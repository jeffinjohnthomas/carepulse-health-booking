import { useState } from 'react';
import { FileText, Upload, Trash2, Download } from 'lucide-react';
import api from '../../services/api';

export default function RecordsTab({ records, fetchRecords }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');
  const [loading, setLoading] = useState(false);

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
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (error) {
      alert('Failed to delete record');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6"><Upload size={20} className="mr-2 text-blue-600" /> Upload New Record</h2>
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
            <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Uploading...' : 'Upload Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center"><FileText size={20} className="mr-2 text-blue-600" /> My Health Records</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {records.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No medical records uploaded yet.</div>
          ) : (
            records.map(record => (
              <div key={record._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{record.title}</h3>
                    <p className="text-sm text-slate-500">{record.type} • Uploaded on {new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`http://localhost:5000${record.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                    <Download size={20} />
                  </a>
                  <button onClick={() => handleDelete(record._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
