import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { PhoneIncoming, X, Phone } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const IncomingCallListener = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-personal-room', user._id);
    });

    newSocket.on('incoming-call', (data) => {
      // data: { roomId, callerName }
      setIncomingCall(data);
      // Play a ringing sound if desired
      try {
        const audio = new Audio('/ringtone.mp3');
        audio.play().catch(() => {}); // ignore autoplay errors
      } catch (e) {}
    });

    return () => newSocket.close();
  }, [user]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <PhoneIncoming size={32} className="text-teal-600 animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Incoming Call</h2>
        <p className="text-slate-500 mb-8">
          <span className="font-semibold text-slate-700">{incomingCall.callerName}</span> is calling you for a consultation.
        </p>

        <div className="flex w-full gap-4">
          <button 
            onClick={() => setIncomingCall(null)}
            className="flex-1 py-3 px-4 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl font-semibold flex items-center justify-center transition-colors"
          >
            <X size={20} className="mr-2" /> Decline
          </button>
          
          <button 
            onClick={() => {
              navigate(`/telemedicine/${incomingCall.roomId}`);
              setIncomingCall(null);
            }}
            className="flex-1 py-3 px-4 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-semibold flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
          >
            <Phone size={20} className="mr-2" /> Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallListener;
