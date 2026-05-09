import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cartSlice';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle, Search } from 'lucide-react';

const MOCK_PACKAGES = [
  { id: 1, name: 'Comprehensive Full Body Checkup', price: 299, category: 'Full Body', tests: ['CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Profile', 'Blood Sugar'] },
  { id: 2, name: 'Advanced Cardiac Care', price: 199, category: 'Heart', tests: ['ECG', 'Lipid Profile', 'TMT', 'Echocardiography'] },
  { id: 3, name: 'Diabetic Screening Package', price: 149, category: 'Diabetes', tests: ['HbA1c', 'Fasting Blood Sugar', 'Kidney Function', 'Urine Routine'] },
  { id: 4, name: 'Senior Citizen Health Check', price: 349, category: 'Seniors', tests: ['Bone Densitometry', 'Vitamin D & B12', 'Arthritis Profile', 'Eye Checkup'] },
  { id: 5, name: 'Women\'s Wellness Profile', price: 249, category: 'Women', tests: ['Thyroid', 'Iron Profile', 'Calcium', 'Hormone Panel'] },
];

export default function PackagesList() {
  const dispatch = useDispatch();

  const handleAddToCart = (pkg) => {
    dispatch(addToCart(pkg));
    alert(`${pkg.name} added to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Health Checkup Packages</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Choose from our curated health packages tailored to give you comprehensive insights into your health.</p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl">
          <input type="text" placeholder="Search packages (e.g., Full Body, Cardiac)..." className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_PACKAGES.map((pkg, idx) => (
          <motion.div 
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1 rounded-bl-xl">
              {pkg.category}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 mt-4">{pkg.name}</h3>
            <div className="text-3xl font-extrabold text-teal-600 mb-6">${pkg.price}</div>
            
            <div className="flex-grow mb-8">
              <h4 className="font-semibold text-slate-700 mb-3">Includes {pkg.tests.length} Parameters:</h4>
              <ul className="space-y-2">
                {pkg.tests.map(test => (
                  <li key={test} className="flex items-center text-slate-600">
                    <CheckCircle size={16} className="text-teal-500 mr-2" /> {test}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => handleAddToCart(pkg)}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold flex justify-center items-center hover:bg-blue-600 transition-colors mt-auto"
            >
              <ShoppingCart size={18} className="mr-2" /> Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
