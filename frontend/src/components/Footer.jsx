import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0A192F] text-slate-300 py-16 mt-auto">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-700/50 pb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">CarePulse</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Providing seamless healthcare booking and management solutions for a healthier tomorrow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/hospitals" className="hover:text-white transition-colors text-sm">Hospitals</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition-colors text-sm">Specialized Doctors</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors text-sm">Health Packages</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors text-sm">Emergency Services</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors text-sm">FAQs</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter / Legal */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6">Newsletter</h3>
            <p className="text-slate-400 text-xs mb-4">Stay updated with health tips and portal updates.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-l-lg w-full outline-none focus:border-blue-500 text-sm"
              />
              <button className="bg-blue-600 px-4 py-3 rounded-r-lg hover:bg-blue-500 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} CarePulse Health. All rights reserved. ISO 27001 Certified.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/" className="hover:text-white">Privacy Policy</Link>
            <Link to="/" className="hover:text-white">Terms</Link>
            <Link to="/" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
