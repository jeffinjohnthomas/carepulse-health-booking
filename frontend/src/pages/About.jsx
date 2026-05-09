import { motion } from 'framer-motion';
import { HeartPulse, Shield, Users, Award, ShieldCheck, Activity, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Mission Section */}
      <section className="pt-32 pb-20 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                Our Mission
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[#0A192F] leading-tight mb-6 tracking-tight">
                Democratizing World-Class Healthcare for Everyone.
              </h1>
              <p className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed">
                At CarePulse, we believe that quality healthcare isn't a privilege — it's a fundamental right. We are bridging the gap between medical expertise and patients through seamless digital integration.
              </p>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-700 font-bold">
                  <ShieldCheck className="text-blue-600" size={20} />
                  <span>ISO 27001 Certified</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-bold">
                  <Shield className="text-blue-600" size={20} />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" 
                  alt="Hospital Corridor" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Specializations Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="rounded-[2rem] overflow-hidden shadow-xl border-8 border-slate-50">
                <img 
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" 
                  alt="Medical Care" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-black text-[#0A192F] mb-6">Our Core Specializations</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Founded with a focus on comprehensive care, CarePulse connects patients with top-tier specialists across multiple disciplines including Cardiology, Neurology, and Orthopedics. Navigating complex healthcare systems is now as simple as a few clicks, without compromising on clinical integrity.
              </p>
              <p className="text-slate-500 mb-10 leading-relaxed">
                Today, our platform facilitates thousands of checkups daily. We don't just book appointments; we manage the entire lifecycle of a patient's diagnostic journey, ensuring every touchpoint is intuitive and efficient.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-3xl font-black text-blue-600 mb-1">500k+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patients Trusted</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-3xl font-black text-blue-600 mb-1">50+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Partner Hospitals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Top Specialists */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0A192F] mb-4">Our Top Specialists</h2>
            <p className="text-slate-500">Guided by industry veterans in specialized medical fields, ensuring clinical excellence across all partner hospitals.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 group">
              <div className="h-64 overflow-hidden bg-slate-100">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" alt="Dr. Sarah Chen" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-black text-[#0A192F] mb-1">Dr. Sarah Chen</h3>
                <p className="text-blue-600 text-sm font-bold mb-4 uppercase tracking-wider">Cardiology</p>
                <p className="text-sm text-slate-500 leading-relaxed">Leading our mission to integrate advanced cardiac care with digital accessibility.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 group">
              <div className="h-64 overflow-hidden bg-slate-100">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600" alt="Dr. Michael Ross" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-black text-[#0A192F] mb-1">Dr. Michael Ross</h3>
                <p className="text-blue-600 text-sm font-bold mb-4 uppercase tracking-wider">Neurology</p>
                <p className="text-sm text-slate-500 leading-relaxed">Pioneering remote neurological consultations and specialized health checkups.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 group">
              <div className="h-64 overflow-hidden bg-slate-100">
                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600" alt="Dr. James Wilson" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-black text-[#0A192F] mb-1">Dr. James Wilson</h3>
                <p className="text-blue-600 text-sm font-bold mb-4 uppercase tracking-wider">Pediatrics</p>
                <p className="text-sm text-slate-500 leading-relaxed">Dedicated to providing world-class pediatric care through our partner network.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility */}
      <section className="py-24 bg-[#0A192F] text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Trust & Credibility</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We maintain the highest global standards for healthcare data privacy and clinical operations.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center mb-4 text-blue-400">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <span className="text-sm text-slate-300 font-bold tracking-widest uppercase">ISO 27001</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center mb-4 text-blue-400">
                <Award size={32} strokeWidth={1.5} />
              </div>
              <span className="text-sm text-slate-300 font-bold tracking-widest uppercase">Joint Commission</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center mb-4 text-blue-400">
                <Shield size={32} strokeWidth={1.5} />
              </div>
              <span className="text-sm text-slate-300 font-bold tracking-widest uppercase">GDPR Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center mb-4 text-blue-400">
                <HeartPulse size={32} strokeWidth={1.5} />
              </div>
              <span className="text-sm text-slate-300 font-bold tracking-widest uppercase">HIPAA Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-10">In Partnership With Top Health Networks</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl font-black font-serif italic tracking-tight">KMC Hospital</span>
            <span className="text-2xl font-black font-serif italic tracking-tight">Father Muller</span>
            <span className="text-2xl font-black font-serif italic tracking-tight">Yenepoya Medical</span>
            <span className="text-2xl font-black font-serif italic tracking-tight">A.J. Hospital</span>
          </div>
        </div>
      </section>
    </div>
  );
}
