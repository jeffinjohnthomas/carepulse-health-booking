import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your virtual health assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, isBot: false }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      let botReply = "I can assist you with booking a doctor or scheduling lab tests. You can go to 'Find Doctors' from the top menu!";
      if (input.toLowerCase().includes('payment') || input.toLowerCase().includes('pay')) {
        botReply = "We accept secure payments via GPay, PhonePe, and Credit Cards directly during the booking process.";
      } else if (input.toLowerCase().includes('status') || input.toLowerCase().includes('approve')) {
        botReply = "You can view your appointment status by clicking on your name in the top right and visiting the Dashboard.";
      }
      
      setMessages([...newMessages, { text: botReply, isBot: true }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 hover:shadow-xl transition-all z-40"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot size={20} />
                <span className="font-semibold">Health Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isBot ? 'bg-white text-slate-700 shadow-sm rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="ml-2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
