import { motion } from 'framer-motion';
import { Shield, Clock, ArrowRight, HeartPulse, Microscope, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="group relative bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(14,165,233,0.12)] transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
    <div className="relative z-10">
      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg transition-all duration-500">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </motion.div>
);

export default function Home() {
  const partners = [
    "KMC Hospital", "Father Muller", "A.J. Hospital", "Yenepoya Medical", "Mangala Hospital", "Omega Hospital"
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-300/30 to-teal-200/30 rounded-full blur-3xl -z-10 opacity-70" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-teal-200/30 to-blue-300/30 rounded-full blur-3xl -z-10 opacity-70" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full text-blue-600 font-bold mb-8 shadow-sm border border-slate-100"
              >
                <HeartPulse size={18} className="animate-pulse text-red-500" />
                <span className="text-sm tracking-wide">Next-Gen Healthcare SaaS</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]"
              >
                Skip the line. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  Book Top Doctors.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-slate-500 mb-10 font-medium max-w-lg leading-relaxed"
              >
                Connect instantly with certified specialists across premium hospitals. View live availability, book appointments, and manage your health records in one unified dashboard.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link to="/doctors" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2">
                  <span>Find a Doctor</span>
                  <ArrowRight size={20} />
                </Link>
                <Link to="/hospitals" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 flex items-center justify-center">
                  View Hospitals
                </Link>
              </motion.div>
            </div>

            {/* Right Image Composition */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1000" 
                  alt="Online Health Consultation" 
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                
                {/* Floating UI Elements */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Status</p>
                    <p className="font-bold text-slate-900 text-sm">24/7 Appointments Available</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee for Hospitals */}
      <section className="py-10 border-y border-slate-200 bg-white overflow-hidden flex">
        <div className="flex w-[200%] animate-marquee space-x-12 items-center">
          {[...partners, ...partners, ...partners].map((partner, idx) => (
            <div key={idx} className="flex items-center space-x-3 shrink-0">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-xl font-black text-slate-300 uppercase tracking-widest">{partner}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#F8FAFC] relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Built for the Modern Patient</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Experience healthcare that revolves around your convenience. No more waiting rooms, no more lost records.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={Clock} 
              title="Real-Time Scheduling" 
              desc="View live doctor availability and lock in your preferred time slot instantly, bypassing front-desk friction."
              delay={0.1}
            />
            <FeatureCard 
              icon={Shield} 
              title="Bank-Grade Security" 
              desc="Your digital medical records and appointment history are encrypted and locked behind strict access controls."
              delay={0.2}
            />
            <FeatureCard 
              icon={Microscope} 
              title="Verified Providers" 
              desc="Every hospital and specialist on our network is manually vetted to ensure you receive world-class care."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Specialized Care Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-[#0A192F] mb-6 tracking-tight">Specialized Care for Every Need</h2>
              <p className="text-lg text-slate-500 font-medium">Our platform connects you with leading experts across multiple medical disciplines. Find exactly the care you need, when you need it.</p>
            </div>
            <Link to="/services" className="mt-8 md:mt-0 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center space-x-2">
              <span>View All Specialties</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Cardiology', desc: 'Heart health and cardiovascular treatments', img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400' },
              { title: 'Neurology', desc: 'Brain, spinal cord, and nervous system care', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400' },
              { title: 'Pediatrics', desc: 'Comprehensive care for infants and children', img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=400' },
              { title: 'Orthopedics', desc: 'Bone, joint, and muscle treatments', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400' },
            ].map((spec, i) => (
              <Link to="/doctors" key={i} className="group relative h-80 rounded-3xl overflow-hidden shadow-md">
                <img src={spec.img} alt={spec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/90 via-[#0A192F]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-2">{spec.title}</h3>
                  <p className="text-slate-300 text-sm font-medium">{spec.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Custom styles for marquee animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}} />
    </div>
  );
}
