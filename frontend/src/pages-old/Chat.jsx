import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initSocket, getSocket } from '../services/socket';
import {
  Send, Video, VideoOff, Mic, MicOff, PhoneOff, Phone,
  MessageSquare, User, X
} from 'lucide-react';
import Spinner from '../components/Spinner';

const Chat = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Video call state
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | in-call | incoming
  const [callerInfo, setCallerInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    const socket = initSocket(user._id);

    socket.on('messageReceived', (msg) => {
      setMessages(prev => {
        const already = prev.find(m => m._id === msg._id);
        if (already) return prev;
        return [...prev, msg];
      });
    });

    socket.on('incomingCall', ({ signal, from, callerName }) => {
      setCallerInfo({ signal, from, callerName });
      setCallStatus('incoming');
    });

    socket.on('callAccepted', async ({ signal }) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(signal)
        );
        setCallStatus('in-call');
        addToast('Video call connected!', 'success');
      } catch (e) {
        console.error('Error setting remote description:', e);
      }
    });

    socket.on('callEnded', () => {
      endCall();
      addToast('Call ended by the other party.', 'info');
    });

    // Fetch contacts
    const fetchContacts = async () => {
      try {
        const res = await axios.get('/chat/contacts');
        setContacts(res.data);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
        addToast('Failed to load chat contacts', 'error');
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();

    return () => {
      socket.off('messageReceived');
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callEnded');
    };
  }, [user._id]);

  // Load chat history when contact changes
  useEffect(() => {
    if (!activeContact) return;
    const fetchHistory = async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(`/chat/history/${activeContact._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchHistory();
  }, [activeContact]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const socket = getSocket();
    if (!socket) {
      addToast('Not connected to server', 'error');
      return;
    }

    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: activeContact._id,
      message: newMessage.trim()
    });

    setNewMessage('');
  };

  // ─── WebRTC Helpers ───────────────────────────────────────────────────────
  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      // In a full implementation, candidates would be sent via socket
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Media access error:', err);
      addToast('Camera/microphone access denied. Using simulated video.', 'warning');
      return null;
    }
  };

  const startCall = async () => {
    if (!activeContact) return;
    setCallStatus('calling');
    setInCall(true);

    const stream = await getLocalStream();
    const pc = await createPeerConnection();

    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = getSocket();
      socket.emit('callUser', {
        userToCall: activeContact._id,
        signalData: offer,
        from: user._id,
        callerName: user.name
      });

      addToast(`Calling ${activeContact.name}...`, 'info');

      // Simulate auto-connect for demo (since remote peer may not be on the same browser)
      setTimeout(() => {
        if (callStatus === 'calling') {
          setCallStatus('in-call');
          addToast('Video call connected (simulated)!', 'success');
        }
      }, 3000);
    } catch (err) {
      console.error('Failed to initiate call:', err);
      addToast('Failed to start video call', 'error');
      endCall();
    }
  };

  const answerCall = async () => {
    if (!callerInfo) return;
    setCallStatus('in-call');
    setInCall(true);

    const stream = await getLocalStream();
    const pc = await createPeerConnection();

    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(callerInfo.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = getSocket();
      socket.emit('answerCall', {
        to: callerInfo.from,
        signal: answer
      });
    } catch (err) {
      console.error('Failed to answer call:', err);
      addToast('Failed to connect call', 'error');
      endCall();
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (activeContact && callStatus !== 'incoming') {
      const socket = getSocket();
      socket?.emit('endCall', { to: activeContact._id });
    }
    setInCall(false);
    setCallStatus('idle');
    setCallerInfo(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const rejectCall = () => {
    setCallStatus('idle');
    setCallerInfo(null);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="text-left">
      <div className="mb-4">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Chat & Video Consultation</h2>
        <p className="text-xs text-slate-400 font-medium">Real-time messaging and WebRTC video sessions with your care team</p>
      </div>

      <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-sm overflow-hidden">

        {/* ── Contacts Sidebar ── */}
        <div className="w-64 shrink-0 border-r border-slate-100 dark:border-slate-700/50 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/40">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-slate-400 leading-relaxed">
                <MessageSquare size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                No contacts yet. Book an appointment to start chatting.
              </div>
            ) : (
              contacts.map(contact => (
                <button
                  key={contact._id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    activeContact?._id === contact._id
                      ? 'bg-teal-50 dark:bg-teal-950/30 border-r-2 border-teal-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-sm uppercase shrink-0">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {contact.role === 'doctor' ? `Dr. ${contact.name}` : contact.name}
                    </p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold capitalize truncate">
                      {contact.specialization || contact.role}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat Main Area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700/40 bg-white dark:bg-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-sm uppercase">
                    {activeContact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {activeContact.role === 'doctor' ? `Dr. ${activeContact.name}` : activeContact.name}
                    </p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold capitalize">
                      {activeContact.specialization || activeContact.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={startCall}
                  disabled={inCall}
                  className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Video size={14} />
                  Video Call
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <MessageSquare size={32} className="text-slate-300 dark:text-slate-600" />
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user._id;
                    return (
                      <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                          isMine
                            ? 'bg-teal-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-teal-200' : 'text-slate-400'}`}>
                            {formatTime(msg.timestamp || msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-700/40 bg-white dark:bg-slate-800 shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 dark:disabled:bg-teal-800 text-white rounded-xl transition-all shadow-sm"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
              <MessageSquare size={40} className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">Select a contact to start chatting</p>
              <p className="text-xs text-slate-400">Your chat contacts are based on your booked appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Video Call Overlay ── */}
      {inCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center gap-6">
          <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Remote video (full size) */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {callStatus !== 'in-call' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                <div className="w-20 h-20 rounded-full bg-teal-600/20 border-2 border-teal-500 flex items-center justify-center text-3xl font-bold uppercase animate-pulse">
                  {activeContact?.name?.charAt(0) || '?'}
                </div>
                <p className="text-lg font-bold">
                  {callStatus === 'calling' ? `Calling ${activeContact?.name}…` : 'Connecting...'}
                </p>
                <p className="text-sm text-slate-400">Establishing secure WebRTC connection</p>
              </div>
            )}
            {/* Local video (PiP) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-lg">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            {/* Status badge */}
            {callStatus === 'in-call' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-teal-600/80 backdrop-blur rounded-full text-white text-xs font-bold">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live • WebRTC
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">
              <Mic size={20} />
            </button>
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-500/30"
            >
              <PhoneOff size={22} />
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">
              <Video size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ── Incoming Call Banner ── */}
      {callStatus === 'incoming' && !inCall && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-2xl w-72 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-base uppercase animate-pulse">
              {callerInfo?.callerName?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Incoming Video Call</p>
              <p className="text-[10px] text-slate-400">{callerInfo?.callerName || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={rejectCall}
              className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-100 dark:border-rose-900/40 flex items-center justify-center gap-1"
            >
              <X size={14} /> Decline
            </button>
            <button
              onClick={answerCall}
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
            >
              <Phone size={14} /> Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
