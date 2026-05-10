import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Phone, Mail, Navigation, ArrowLeft, CheckCircle2, User, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchHospital();
    // Ask for location to calculate distance for directions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.log("Location not enabled for directions")
      );
    }
  }, [id]);

  const fetchHospital = async () => {
    try {
      const response = await api.get(`/hospitals/${id}`);
      setHospital(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDirections = () => {
    // Prioritize the name and address for a better visual experience in Google Maps
    let destinationText = '';
    
    if (hospital?.name && hospital?.address && hospital?.city) {
      destinationText = `${hospital.name}, ${hospital.address}, ${hospital.city}`;
    } else if (hospital?.name && hospital?.city) {
      destinationText = `${hospital.name}, ${hospital.city}`;
    } else if (hospital?.location?.coordinates?.length === 2) {
      // Fallback to coordinates if no address string
      const lng = hospital.location.coordinates[0];
      const lat = hospital.location.coordinates[1];
      destinationText = `${lat},${lng}`;
    } else {
      destinationText = hospital?.name || 'Hospital';
    }

    const encodedDestination = encodeURIComponent(destinationText);
    
    // Using "My Location" as origin forces Google Maps to use the user's current GPS on their device
    let url = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodedDestination}`;
    
    window.open(url, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!hospital) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Hospital not found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-6 py-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Hospitals</span>
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-[400px] lg:h-auto">
              <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-12 flex flex-col justify-center">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Hospital Profile</div>
                <div className="flex items-center space-x-1.5">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span className="text-sm font-bold text-slate-700">{hospital.rating} ({hospital.numReviews > 1000 ? `${(hospital.numReviews/1000).toFixed(1)}k` : hospital.numReviews} reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl font-black text-[#1E293B] mb-4">{hospital.name}</h1>
              <p className="text-lg text-slate-500 mb-8 flex items-start">
                <MapPin className="mr-3 text-blue-600 shrink-0 mt-1" size={20} />
                {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipcode}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600"><Clock size={24} /></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timing</p><p className="font-bold text-slate-800">{hospital.workingHours}</p></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600"><Phone size={24} /></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency</p><p className="font-bold text-slate-800">{hospital.phone}</p></div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button onClick={getDirections} className="flex-grow py-4 bg-[#1E293B] text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-3">
                  <Navigation size={20} />
                  <span>Get Directions</span>
                </button>
                <button onClick={() => navigate(`/doctors?hospital=${hospital._id}&hname=${encodeURIComponent(hospital.name)}&hcity=${encodeURIComponent(hospital.city)}`)} className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-3">
                  <Calendar size={20} />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-12 bg-[#FBFDFF] border-t border-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
                    Specialties & Departments
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(hospital.departments?.length ? hospital.departments : hospital.services)?.map(dept => (
                      <div key={dept} className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <CheckCircle2 className="text-blue-600" size={20} />
                        <span className="font-bold text-slate-700">{dept}</span>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section>
                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Note on OpenStreetMap Data</h3>
                    <p className="text-sm text-blue-700">This hospital information is dynamically fetched from OpenStreetMap. Certain details such as patient reviews and extensive department lists may be limited compared to premium databases.</p>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-6">Contact Info</h3>
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-3"><Phone size={18} className="text-blue-600" /><span>{hospital.phone}</span></div>
                    {hospital.website && (
                      <div className="flex items-center space-x-3"><Navigation size={18} className="text-blue-600" />
                        <a href={hospital.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Visit Website</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
