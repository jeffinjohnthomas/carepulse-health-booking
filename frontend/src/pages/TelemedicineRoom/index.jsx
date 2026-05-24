import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Send, MessageSquare, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const SOCKET_URL = import.meta.env.MODE === 'production' ? '/' : 'http://localhost:5000';

export default function TelemedicineRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [appointment, setAppointment] = useState(null);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  };

  const requestMedia = async () => {
    setMediaLoading(true);
    setMediaError(false);
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
    } catch (err) {
      console.warn("Failed to get both video and audio. Trying fallbacks...", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setStream(audioStream);
        setIsVideoOff(true);
      } catch (audioErr) {
        console.warn("Failed to get audio. Trying video only...", audioErr);
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(videoStream);
          setIsMuted(true);
        } catch (videoErr) {
          console.error("Completely failed to get any media:", videoErr);
          setMediaError(true);
        }
      }
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    requestMedia();

    socketRef.current.emit('join-room', appointmentId);

    socketRef.current.on('chat-history', (history) => {
      setMessages(history);
    });

    socketRef.current.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('video-offer', (data) => {
      setReceivingCall(true);
      setCallerSignal(data.signal);
    });

    socketRef.current.on('call-ended', () => {
      setCallEnded(true);
      if (connectionRef.current) connectionRef.current.destroy();
    });

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (connectionRef.current) connectionRef.current.destroy();
      socketRef.current.disconnect();
    };
  }, [appointmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream && userVideo.current) {
      console.log("Setting remote stream to video element:", remoteStream.getTracks());
      userVideo.current.srcObject = remoteStream;
      userVideo.current.play().catch(err => console.warn("Failed to auto-play remote video:", err));
    }
  }, [remoteStream, callAccepted]);

  const callUser = () => {
    try {
      const peerOpts = {
        initiator: true,
        trickle: false,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        }
      };
      if (stream) peerOpts.stream = stream;

      const peer = new Peer(peerOpts);

      peer.on('signal', (data) => {
        socketRef.current.emit('video-offer', {
          roomId: appointmentId,
          signal: data,
          from: user._id
        });
      });
      
      // Ring the other user
      socketRef.current.emit('ring-room', {
        roomId: appointmentId,
        callerId: user._id,
        callerName: user.name
      });

      peer.on('stream', (currentStream) => {
        setRemoteStream(currentStream);
      });

      socketRef.current.on('video-answer', (data) => {
        setCallAccepted(true);
        peer.signal(data.signal);
      });

      connectionRef.current = peer;
    } catch (err) {
      console.error("Failed to start call:", err);
      setErrorMessage("Failed to start call: " + err.message);
    }
  };

  const answerCall = () => {
    try {
      setCallAccepted(true);
      const peerOpts = {
        initiator: false,
        trickle: false,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        }
      };
      if (stream) peerOpts.stream = stream;

      const peer = new Peer(peerOpts);

      peer.on('signal', (data) => {
        socketRef.current.emit('video-answer', { signal: data, roomId: appointmentId });
      });

      peer.on('stream', (currentStream) => {
        setRemoteStream(currentStream);
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    } catch (err) {
      console.error("Failed to answer call:", err);
      setErrorMessage("Failed to answer call: " + err.message);
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    socketRef.current.emit('end-call', appointmentId);
    if (connectionRef.current) connectionRef.current.destroy();
    navigate('/dashboard');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    socketRef.current.emit('send-message', {
      roomId: appointmentId,
      senderId: user._id,
      text: newMessage
    });
    setNewMessage('');
  };

  const toggleMute = () => {
    if (stream && stream.getAudioTracks().length > 0) {
      stream.getAudioTracks()[0].enabled = isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (stream && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
    }
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-900 flex flex-col md:flex-row overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 relative flex flex-col">
        <div className="p-4 bg-slate-800 flex justify-between items-center shadow-md z-10">
          <h2 className="text-white font-bold text-xl flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></span>
            Telemedicine Consultation
          </h2>
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition">Exit Room</button>
        </div>

        <div className="flex-1 relative bg-black flex items-center justify-center p-4">
          {/* Main Video (Remote) */}
          {callAccepted && !callEnded ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-contain rounded-2xl bg-slate-900" />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Video size={40} className="text-teal-400" />
              </div>
              <h3 className="text-2xl text-white font-semibold">Waiting for connection...</h3>
              <p className="text-slate-400 mt-2">
                {user.role === 'doctor' ? 'Click "Start Call" when you are ready.' : 'Wait for the doctor to start the call.'}
              </p>
            </div>
          )}

          {/* Picture-in-Picture (Local) */}
          <div className={`absolute bottom-6 right-6 w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 z-20 transition-transform hover:scale-105 ${!stream && !mediaError ? 'hidden' : ''}`}>
            {mediaError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-800 text-center px-2">
                <VideoOff className="text-rose-500 mb-1" size={24} />
                <span className="text-[10px] text-slate-300">Camera Blocked</span>
              </div>
            )}
            
            <video playsInline muted ref={myVideo} autoPlay className={`w-full h-full object-cover transform -scale-x-100 ${isVideoOff || mediaError ? 'hidden' : ''}`} />
            
            {isVideoOff && !mediaError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800">
                <VideoOff className="text-slate-500" size={32} />
              </div>
            )}
          </div>

          {/* Call Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl z-30">
            {mediaLoading ? (
              <div className="px-6 py-4 bg-slate-700 text-white font-bold rounded-full shadow-lg flex items-center opacity-70">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Loading Media...
              </div>
            ) : (
              <>
                {mediaError && (
                  <button onClick={requestMedia} className="p-4 bg-amber-500 text-white rounded-full hover:bg-amber-400 transition shadow-lg shadow-amber-500/30" title="Retry Camera/Mic">
                    <RefreshCw size={24} />
                  </button>
                )}
                
                <button onClick={toggleMute} className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
                
                {callAccepted && !callEnded ? (
                  <button onClick={leaveCall} className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg shadow-red-600/30">
                    <PhoneOff size={24} />
                  </button>
                ) : (
                  user.role === 'doctor' ? (
                    <button onClick={callUser} className="px-6 py-4 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-500 transition shadow-lg shadow-teal-600/30 flex items-center">
                      <Video size={20} className="mr-2" /> Start Call
                    </button>
                  ) : receivingCall && !callAccepted ? (
                    <button onClick={answerCall} className="px-6 py-4 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/30 flex items-center animate-pulse">
                      <Video size={20} className="mr-2" /> Accept Call
                    </button>
                  ) : null
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full md:w-96 bg-white flex flex-col border-l border-slate-200">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
          <MessageSquare size={20} className="text-teal-600 mr-2" />
          <h3 className="font-bold text-slate-800">Live Chat</h3>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
          {messages.map((msg, index) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-1 ml-1 font-medium uppercase tracking-wider">
                  {isMe ? 'You' : msg.sender?.name || 'User'}
                </span>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex items-center gap-2 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 p-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 p-2 text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-50 transition">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Custom Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-rose-500 font-bold text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Permission Needed</h2>
            <p className="text-slate-500 mb-6">{errorMessage}</p>
            <button 
              onClick={() => setErrorMessage('')}
              className="w-full py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-semibold transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
