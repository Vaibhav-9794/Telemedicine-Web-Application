'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCall } from '@/context/CallContext';
import { initSocket, getSocket } from '@/services/socket';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import {
  Send, Video, MessageSquare, User
} from 'lucide-react';

export default function ChatPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const callCtx = useCall();
  const startCall = callCtx?.startCall;
  const callStatus = callCtx?.callStatus || 'idle';
  const router = useRouter();

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection for chat messages
  useEffect(() => {
    if (!user) return;

    const socket = initSocket(user._id);

    socket.on('messageReceived', (msg) => {
      setMessages(prev => {
        // Prevent duplicate append
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
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
    };
  }, [user]);

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
      addToast('Not connected to socket server', 'error');
      return;
    }

    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: activeContact._id,
      message: newMessage.trim()
    });

    // Optimistically add to UI
    const optimisticMsg = {
      _id: Date.now().toString(),
      senderId: user._id,
      receiverId: activeContact._id,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
  };

  const handleStartCall = () => {
    if (!activeContact || !startCall) return;
    startCall(activeContact);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Chat & Consultations</h2>
          <p className="text-xs text-slate-400 font-medium">Consult in real-time with text messaging and WebRTC video feeds</p>
        </div>

        <div className="flex h-[calc(100vh-210px)] min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm overflow-hidden">
          {/* Contacts Panel (Left) */}
          <div className="w-72 shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/40">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500">Conversations</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingContacts ? (
                <div className="flex h-32 items-center justify-center">
                  <Spinner size="sm" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 leading-relaxed">
                  <MessageSquare size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-655" />
                  No contacts found. Please book an appointment to initialize a console channel.
                </div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-slate-50 dark:border-slate-850/50 ${
                      activeContact?._id === contact._id
                        ? 'bg-primary-500/10 dark:bg-primary-500/5 border-r-4 border-primary-500'
                        : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-sm uppercase shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">
                        {contact.role === 'doctor' ? 'Dr. ' : ''}{contact.name}
                      </p>
                      <p className="text-[10px] text-primary-500 font-semibold capitalize truncate mt-0.5">
                        {contact.specialization || contact.role}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Console (Right) */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
            {activeContact ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-sm uppercase">
                      {activeContact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-100">
                        {activeContact.role === 'doctor' ? 'Dr. ' : ''}{activeContact.name}
                      </p>
                      <p className="text-[10px] text-primary-500 font-semibold capitalize">
                        {activeContact.specialization || activeContact.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartCall}
                    disabled={callStatus !== 'idle'}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary-500/10"
                  >
                    <Video size={14} />
                    Consult Video
                  </button>
                </div>

                {/* Messages Screen */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Spinner size="md" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-slate-400 text-xs gap-2">
                      <MessageSquare size={32} className="text-slate-300 dark:text-slate-700" />
                      <p>Start your clinical consultation. Send a message below.</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user._id;
                      return (
                        <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm ${
                            isMine
                              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-150 border border-slate-205/60 dark:border-slate-750 rounded-bl-none'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <p className={`text-[9px] text-right mt-1.5 font-medium ${isMine ? 'text-primary-100' : 'text-slate-400'}`}>
                              {formatTime(msg.timestamp || msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Form Input */}
                <form onSubmit={sendMessage} className="flex items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a clinical inquiry or update..."
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-900 text-white rounded-xl transition-all shadow-sm"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <MessageSquare size={44} className="text-slate-200 dark:text-slate-800" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Select consultation channel</p>
                <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed">
                  Choose an active contact member from the sidebar directory list to initiate consultation history logs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
