import { motion } from 'framer-motion';
import { Activity, Brain, Stethoscope, Baby, Eye, Bone, Heart, ActivitySquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  { icon: Heart, name: "Cardiology", desc: "Expert heart care from diagnosis to complex surgery. Book leading cardiologists directly.", img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600" },
  { icon: Brain, name: "Neurology", desc: "Advanced treatment for brain and nervous system disorders from specialized neuro-surgeons.", img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600" },
  { icon: Bone, name: "Orthopedics", desc: "Comprehensive care for bones, joints, and muscles. From sports injuries to joint replacement.", img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600" },
  { icon: Baby, name: "Pediatrics", desc: "Specialized healthcare for infants, children, and adolescents ensuring a healthy future.", img: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=600" },
  { icon: Eye, name: "Ophthalmology", desc: "Complete eye care including laser surgeries and comprehensive vision correction.", img: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&q=80&w=600" },
  { icon: Stethoscope, name: "General Medicine", desc: "Primary care, routine health checkups, and comprehensive diagnostics.", img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=600" },
  { icon: Activity, name: "Diagnostic Center", desc: "State-of-the-art lab testing, MRI, CT scans, and advanced imaging technologies.", img: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=600" },
  { icon: ActivitySquare, name: "Emergency Care", desc: "24/7 immediate trauma and emergency response across our hospital network.", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="pt-32 pb-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-[#0A192F] mb-6 tracking-tight">Our Specialties</h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              Explore our comprehensive range of medical specializations. We partner with the finest hospitals to bring you world-class treatments and verified doctors.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link to={`/doctors?specialty=${service.name}`} key={idx} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-xl transition-all duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img src={service.img} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                      <Icon size={24} />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-[#0A192F] mb-3 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{service.desc}</p>
                    <div className="flex items-center text-blue-600 font-bold text-sm mt-auto">
                      <span>Find Doctors</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0A192F] relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Need Immediate Care?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Skip the wait times and book your consultation directly at our partner hospitals across the city.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/hospitals" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
              Browse Hospitals
            </Link>
            <Link to="/doctors" className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors">
              Search All Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
