import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Smartphone, X, Loader, ArrowRight } from 'lucide-react';
import { removeFromCart, clearCart } from '../../features/cartSlice';

export default function Cart() {
  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemove = (item) => {
    dispatch(removeFromCart(item));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return alert("Cart is empty");
    setShowPayment(true);
  };

  const handlePayment = (method) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPayment(false);
      dispatch(clearCart());
      alert(`Payment of $${totalAmount} via ${method} successful!`);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Your Cart</h1>
        <p className="text-slate-500">Review your selected health packages and proceed to checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 size={32} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Browse our comprehensive health packages and add them to your cart.</p>
          <Link to="/packages" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            <span>Explore Packages</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between"
                >
                  <div className="flex items-center space-x-6 w-full sm:w-auto">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center text-xs text-center p-2">
                      {item.category}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{item.tests?.length || 0} Parameters Included</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end">
                    <div className="text-2xl font-bold text-slate-900">${item.price}</div>
                    <button 
                      onClick={() => handleRemove(item)}
                      className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-slate-900">${totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes</span>
                  <span className="font-medium text-slate-900">$0</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-extrabold text-blue-600">${totalAmount}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative"
            >
              <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Select Payment Method</h3>
                <p className="text-slate-500 mt-1">Amount to pay: <span className="font-bold text-slate-900">${totalAmount}</span></p>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="animate-spin text-teal-600 mb-4" size={40} />
                  <p className="text-slate-600 font-medium">Processing payment securely...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => handlePayment('GPay')}
                    className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6 object-contain" />
                  </button>
                  <button 
                    onClick={() => handlePayment('PhonePe')}
                    className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 hover:shadow-sm transition-all"
                  >
                    <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" className="h-8 object-contain" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
