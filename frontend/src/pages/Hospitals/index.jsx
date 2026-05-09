import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Bell, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SPECIALTIES = [
  { id: 'Cardiology', label: 'Cardiology' },
  { id: 'Oncology', label: 'Oncology' },
  { id: 'Neurology', label: 'Neurology' },
  { id: 'Pediatrics', label: 'Pediatrics' },
  { id: 'Orthopedics', label: 'Orthopedics' },
  { id: 'Emergency', label: 'Emergency' }
];

export default function HospitalsList() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [distanceRange, setDistanceRange] = useState(50);
  const [nearMe, setNearMe] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, [search, selectedSpecialties, distanceRange, location, nearMe]);

  const getUserLocation = (e) => {
    const isChecked = e.target.checked;
    setNearMe(isChecked);
    
    if (isChecked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              // Reverse geocode to get city name
              fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`, {
                headers: { 'Accept-Language': 'en' }
              })
              .then(res => res.json())
              .then(data => {
                if (data && data.address) {
                  const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "Your Location";
                  setLocationName(city);
                }
              })
              .catch(err => console.error("Reverse geocoding failed", err));
            },
            (error) => {
              console.error("Location access denied", error);
              setNearMe(false);
              alert("Please allow location access to find nearby hospitals.");
            }
          );
      } else {
        alert("Geolocation is not supported by your browser");
        setNearMe(false);
      }
    } else {
      setLocation(null);
      setLocationName('');
    }
  };

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (nearMe) params.append('nearMe', 'true');
      params.append('maxDistance', distanceRange.toString());
      
      if (location) {
        params.append('lat', location.lat);
        params.append('lng', location.lng);
      }

      if (selectedSpecialties.length > 0) {
        params.append('service', selectedSpecialties.join(','));
      }

      const response = await api.get(`/hospitals?${params.toString()}`);
      setHospitals(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (id) => {
    setSelectedSpecialties(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header / Search Nav */}
      <div className="bg-[#F8FAFC] px-8 pt-12 pb-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[#0A192F] mb-4">Hospitals Directory</h1>
              <p className="text-slate-600 text-lg max-w-2xl">Find top-rated hospitals and medical centers for your checkup. Book specialized health packages directly through our portal.</p>
            </div>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-6 shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 tracking-wide">FILTERS</h3>
                <button className="text-blue-600 text-xs font-bold hover:underline">Clear All</button>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Location</h4>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search City..." 
                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg transition-colors ${nearMe ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <MapPin size={20} />
                    </div>
                    <span className="text-slate-700 font-bold group-hover:text-slate-900 transition-colors">Use My Current Location</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${nearMe ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={nearMe} 
                      onChange={getUserLocation} 
                    />
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${nearMe ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </label>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Filter by Specialty</h3>
              <div className="space-y-4">
                {SPECIALTIES.map(s => (
                  <label key={s.id} className="flex items-center space-x-3 cursor-pointer group">
                    <div 
                      onClick={() => toggleSpecialty(s.id)}
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${selectedSpecialties.includes(s.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-blue-400'}`}
                    >
                      {selectedSpecialties.includes(s.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${selectedSpecialties.includes(s.id) ? 'text-slate-900' : 'text-slate-500'}`}>{s.label}</span>
                  </label>
                ))}
              </div>

              {nearMe && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-700 mb-4">Max Distance</h4>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0A192F]"
                    value={distanceRange}
                    onChange={(e) => setDistanceRange(e.target.value)}
                  />
                  <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                    <span>1 km</span>
                    <span>{distanceRange} km</span>
                    <span>100 km</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={fetchHospitals}
                className="w-full mt-8 py-3 bg-[#0A192F] text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>

            {/* Promo Card */}
            <div className="bg-gradient-to-br from-[#0A192F] to-slate-800 rounded-2xl overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
              <div className="p-8 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Premium Care for Families</h3>
                <p className="text-slate-300 text-sm mb-6">Up to 20% off on full body checkups</p>
                <button className="text-white text-sm font-bold flex items-center hover:text-blue-300 transition-colors">
                  Learn More <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(n => <div key={n} className="h-64 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <h3 className="text-xl font-bold text-slate-500">No hospitals found matching your criteria.</h3>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {hospitals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((hospital, idx) => (
                    <motion.div
                      key={hospital._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col md:flex-row group"
                    >
                      <div className="p-6 flex flex-col flex-grow relative w-full">
                        {idx === 0 && (
                          <div className="inline-block bg-[#0A192F]/90 backdrop-blur-sm px-3 py-1 rounded text-white text-xs font-bold w-max mb-3">
                            Featured
                          </div>
                        )}
                        {/* Floating Star Badge Top Right */}
                        <div className="absolute top-6 right-6 bg-orange-100 px-3 py-1.5 rounded-lg flex items-center space-x-1 border border-orange-200">
                          <Star className="text-orange-500 fill-orange-500" size={14} />
                          <span className="text-xs font-bold text-orange-900">{hospital.rating} <span className="font-medium">({hospital.numReviews > 1000 ? `${(hospital.numReviews/1000).toFixed(1)}k` : hospital.numReviews} Reviews)</span></span>
                        </div>

                        <h3 className="text-xl font-bold text-[#0A192F] group-hover:text-blue-600 transition-colors pr-32 mb-3">{hospital.name}</h3>
                        
                        <p className="text-slate-600 text-sm mb-6 flex items-start">
                          <MapPin size={16} className="mr-2 text-blue-500 shrink-0 mt-0.5" />
                          {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipcode}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {hospital.services.slice(0, 4).map(s => (
                            <span key={s} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md capitalize">{s}</span>
                          ))}
                          {hospital.services.length > 4 && (
                            <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-semibold rounded-md">+{hospital.services.length - 4}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <button 
                            onClick={() => navigate(`/hospitals/${hospital._id}`)}
                            className="py-3 bg-[#0A192F] text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-sm shadow-md"
                          >
                            View Packages
                          </button>
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}`)}`, '_blank')}
                            className="py-3 border border-slate-300 bg-white text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all text-sm"
                          >
                            Directions
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {hospitals.length > itemsPerPage && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    
                    {[...Array(Math.ceil(hospitals.length / itemsPerPage))].map((_, i) => {
                      // Show limited pagination pages to match design `1 2 3 ... 12`
                      if (i === 0 || i === 1 || i === 2 || i === Math.ceil(hospitals.length / itemsPerPage) - 1 || i === currentPage - 1) {
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
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(hospitals.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(hospitals.length / itemsPerPage)}
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
