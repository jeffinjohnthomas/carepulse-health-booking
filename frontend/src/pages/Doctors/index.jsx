import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Calendar, Filter, User as UserIcon, ShieldCheck, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const INSURANCES = ['All', 'BlueCross', 'Aetna', 'Cigna', 'Medicare', 'UnitedHealthcare'];
const GENDERS = ['All', 'Male', 'Female'];

export default function AppointmentsSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialSpecialty = urlParams.get('specialty') || '';
  const hnameFallback = urlParams.get('hname') || 'Affiliated Hospital';
  const hcityFallback = urlParams.get('hcity') || '';

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialSpecialty);
  const [locationQuery, setLocationQuery] = useState('');
  
  // Filters state
  const [selectedInsurance, setSelectedInsurance] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('Availability');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // Read hospital from URL query params
    const params = new URLSearchParams(location.search);
    if (location.state?.hospitalId && !params.has('hospital')) {
      params.append('hospital', location.state.hospitalId);
    }
    if (hnameFallback !== 'Affiliated Hospital') {
      params.append('hospitalName', hnameFallback);
    }
    fetchDoctors(params);
  }, [location.search, location.state]);

  useEffect(() => {
    const specialty = new URLSearchParams(location.search).get('specialty');
    if (specialty) {
      setSearchQuery(specialty);
    }
  }, [location.search]);

  useEffect(() => {
    applyFilters();
  }, [doctors, searchQuery, locationQuery, selectedInsurance, selectedGender, availabilityFilter]);

  const fetchDoctors = async (params = new URLSearchParams()) => {
    try {
      setLoading(true);
      const response = await api.get(`/doctors?${params.toString()}`);
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = doctors;

    // Search Query (Name, Specialty, Symptoms)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.specialty.toLowerCase().includes(q) ||
        (d.symptomsTreated && d.symptomsTreated.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Location Query (City, State, Zip)
    if (locationQuery) {
      const q = locationQuery.toLowerCase();
      result = result.filter(d => {
        if (typeof d.hospital === 'object' && d.hospital !== null) {
          return (
            (d.hospital.city && d.hospital.city.toLowerCase().includes(q)) ||
            (d.hospital.state && d.hospital.state.toLowerCase().includes(q)) ||
            (d.hospital.address && d.hospital.address.toLowerCase().includes(q))
          );
        }
        return false;
      });
    }

    // Gender Filter
    if (selectedGender !== 'All') {
      result = result.filter(d => d.gender === selectedGender);
    }

    // Insurance Filter
    if (selectedInsurance !== 'All') {
      result = result.filter(d => d.insuranceAccepted.includes(selectedInsurance));
    }

    // Availability Filter
    if (availabilityFilter === 'Today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(d => d.availability.some(a => a.date === today && a.slots.length > 0));
    } else if (availabilityFilter === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      result = result.filter(d => d.availability.some(a => a.date === tomorrowStr && a.slots.length > 0));
    }

    setFilteredDoctors(result);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Search Area */}
      <div className="bg-[#F8FAFC] px-8 pt-12 pb-6 border-b border-slate-100">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-[#0A192F] mb-4">Find Your Specialist</h1>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl">Access world-class healthcare professionals tailored to your specific medical needs. Verified expertise for your peace of mind.</p>
          
          <div className="flex flex-col lg:flex-row gap-4 bg-white p-3 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by doctor name, specialty, or condition..." 
                className="w-full bg-transparent border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-48">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm text-slate-700 outline-none appearance-none focus:border-blue-500"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="Availability">Availability</option>
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              
              <button className="bg-[#0A192F] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors w-full sm:w-auto">
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Results Grid - Now taking full width since sidebar is removed */}
          <div className="flex-grow w-full">
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-96 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <h3 className="text-xl font-bold text-slate-500">No doctors match your criteria.</h3>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doctor, idx) => (
                    <motion.div
                      key={doctor._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-[2rem] overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col group"
                    >
                      <div className="p-6 flex-grow flex flex-col relative">
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <h3 className="text-xl font-bold text-[#0A192F] group-hover:text-blue-600 transition-colors">{doctor.name}</h3>
                            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">{doctor.specialty}</p>
                          </div>
                          <div className="bg-slate-100 px-2 py-1 rounded flex items-center space-x-1 shrink-0">
                            <Star size={12} className="fill-orange-500 text-orange-500" />
                            <span className="text-xs font-bold text-slate-800">{doctor.rating}</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-slate-600">
                            <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            {doctor.experience} Years Experience
                          </div>
                          <div className="flex items-center text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                            <Calendar size={16} className="mr-3 text-blue-600" />
                            Next available: {doctor.nextAvailable || 'Tomorrow, 09:00 AM'}
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <button 
                            onClick={() => {
                              const hName = doctor.hospitalName || (typeof doctor.hospital === 'object' ? doctor.hospital.name : 'Selected Hospital');
                              const hId = typeof doctor.hospital === 'object' ? doctor.hospital._id : doctor.hospital;
                              navigate(`/booking`, { state: { doctor, hospitalId: hId, hospitalName: hName } });
                            }}
                            className="w-full py-3.5 bg-[#006699] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors text-sm shadow-md flex items-center justify-center gap-2"
                          >
                            Book Consultation <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {filteredDoctors.length > itemsPerPage && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    
                    {[...Array(Math.ceil(filteredDoctors.length / itemsPerPage))].map((_, i) => {
                      if (i === 0 || i === 1 || i === 2 || i === Math.ceil(filteredDoctors.length / itemsPerPage) - 1 || i === currentPage - 1) {
                        return (
                          <button 
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#0A192F] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            {i + 1}
                          </button>
                        )
                      }
                      if (i === 3) return <span key={i} className="px-2 text-slate-400">...</span>;
                      return null;
                    })}

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDoctors.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filteredDoctors.length / itemsPerPage)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
