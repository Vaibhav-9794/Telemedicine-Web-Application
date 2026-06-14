'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { initSocket, getSocket } from '@/services/socket';
import { Phone, PhoneOff, Video, X } from 'lucide-react';

const CallContext = createContext(null);

export const useCall = () => useContext(CallContext);

// STUN/TURN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function CallProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Call state
  const [callStatus, setCallStatus] = useState('idle');
  // idle | outgoing-ringing | incoming-ringing | connecting | in-call
  const [callerInfo, setCallerInfo] = useState(null);
  const [callTarget, setCallTarget] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Stream state — stored in state so useEffect can re-attach when video elements mount
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Refs
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const ringingTimerRef = useRef(null);
  const callStatusRef = useRef('idle'); // mirror for socket handlers

  // Keep callStatusRef in sync
  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  // ── Attach local stream to video element whenever either changes ──────────
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('[Call] Attached local stream to video element');
    }
  }, [localStream, callStatus]); // re-run when callStatus changes (video element mounts/unmounts)

  // ── Attach remote stream to video element whenever either changes ─────────
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('[Call] Attached remote stream to video element');
    }
  }, [remoteStream, callStatus]);

  // ── Socket setup: join room + listen for call events ──────────────────────
  useEffect(() => {
    if (!user?._id) return;

    const socket = initSocket(user._id);

    // INCOMING CALL
    socket.on('incomingCall', (data) => {
      console.log('[Call] Incoming call from:', data.callerName, data.from);
      if (callStatusRef.current !== 'idle') {
        console.log('[Call] Already busy, auto-rejecting');
        socket.emit('rejectCall', { to: data.from, reason: 'busy' });
        return;
      }
      setCallerInfo({
        from: data.from,
        callerName: data.callerName,
        signal: data.signal,
      });
      setCallStatus('incoming-ringing');
    });

    // CALL ACCEPTED — remote peer sent their answer
    socket.on('callAccepted', async (data) => {
      console.log('[Call] Call accepted, setting remote description');
      try {
        const pc = peerConnectionRef.current;
        if (pc && data.signal) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          // Process queued ICE candidates
          for (const candidate of iceCandidateQueueRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          iceCandidateQueueRef.current = [];
          setCallStatus('in-call');
          clearTimeout(ringingTimerRef.current);
          addToast('Video consultation connected!', 'success');
        }
      } catch (e) {
        console.error('[Call] Error setting remote description:', e);
      }
    });

    // CALL REJECTED
    socket.on('callRejected', (data) => {
      console.log('[Call] Call rejected:', data?.reason);
      addToast(`Call ${data?.reason === 'busy' ? 'rejected — user is busy' : 'declined'}.`, 'info');
      cleanupCall();
    });

    // CALL ENDED
    socket.on('callEnded', () => {
      console.log('[Call] Remote party ended call');
      addToast('Call ended by the other party.', 'info');
      cleanupCall();
    });

    // ICE CANDIDATE from remote peer
    socket.on('iceCandidate', async (data) => {
      console.log('[Call] Received ICE candidate');
      try {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          iceCandidateQueueRef.current.push(data.candidate);
        }
      } catch (e) {
        console.error('[Call] Error adding ICE candidate:', e);
      }
    });

    return () => {
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callRejected');
      socket.off('callEnded');
      socket.off('iceCandidate');
    };
  }, [user?._id]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      console.log('[Call] Got local media stream, tracks:', stream.getTracks().length);
      return stream;
    } catch (err) {
      console.error('[Call] Media access error:', err);
      addToast('Camera/microphone access denied. Please allow permissions.', 'error');
      return null;
    }
  }, [addToast]);

  const createPeerConnection = useCallback((remoteUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[Call] Sending ICE candidate to:', remoteUserId);
        const socket = getSocket();
        socket?.emit('iceCandidate', {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[Call] Received remote track, streams:', event.streams.length);
      if (event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[Call] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('[Call] ICE connected — media should be flowing');
      }
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        addToast('Connection lost. Call ended.', 'warning');
        cleanupCall();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[Call] Connection state:', pc.connectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [addToast]);

  const cleanupCall = useCallback(() => {
    console.log('[Call] Cleaning up call state');
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    iceCandidateQueueRef.current = [];
    clearTimeout(ringingTimerRef.current);
    setCallStatus('idle');
    setCallerInfo(null);
    setCallTarget(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  }, [localStream]);

  // ── Public API ────────────────────────────────────────────────────────────

  /** Start a call to a contact */
  const startCall = useCallback(async (contact) => {
    if (!contact?._id || callStatusRef.current !== 'idle') return;

    console.log('[Call] Starting call to:', contact.name, contact._id);
    setCallTarget(contact);
    setCallStatus('outgoing-ringing');

    const stream = await getLocalMedia();
    if (!stream) {
      cleanupCall();
      return;
    }

    const pc = createPeerConnection(contact._id);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = getSocket();
      socket?.emit('callUser', {
        userToCall: contact._id,
        signalData: offer,
        from: user._id,
        callerName: user.name,
      });

      console.log('[Call] Sent offer to:', contact._id);

      // Timeout: if no answer in 30 seconds, cancel
      ringingTimerRef.current = setTimeout(() => {
        if (callStatusRef.current === 'outgoing-ringing') {
          addToast('No answer. Call timed out.', 'info');
          endCall();
        }
      }, 30000);
    } catch (err) {
      console.error('[Call] Failed to create offer:', err);
      addToast('Failed to initiate call.', 'error');
      cleanupCall();
    }
  }, [user, getLocalMedia, createPeerConnection, cleanupCall, addToast]);

  /** Accept an incoming call */
  const acceptCall = useCallback(async () => {
    if (!callerInfo) return;

    console.log('[Call] Accepting call from:', callerInfo.callerName);
    setCallStatus('connecting');

    const stream = await getLocalMedia();
    if (!stream) {
      cleanupCall();
      return;
    }

    const pc = createPeerConnection(callerInfo.from);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(callerInfo.signal));

      // Process queued ICE candidates
      for (const candidate of iceCandidateQueueRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      iceCandidateQueueRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = getSocket();
      socket?.emit('answerCall', {
        to: callerInfo.from,
        signal: answer,
      });

      setCallStatus('in-call');
      console.log('[Call] Sent answer to:', callerInfo.from);
    } catch (err) {
      console.error('[Call] Failed to answer call:', err);
      addToast('Failed to connect call.', 'error');
      cleanupCall();
    }
  }, [callerInfo, getLocalMedia, createPeerConnection, cleanupCall, addToast]);

  /** Reject an incoming call */
  const rejectCall = useCallback(() => {
    if (!callerInfo) return;
    console.log('[Call] Rejecting call from:', callerInfo.from);
    const socket = getSocket();
    socket?.emit('rejectCall', { to: callerInfo.from, reason: 'declined' });
    cleanupCall();
  }, [callerInfo, cleanupCall]);

  /** End current call */
  const endCall = useCallback(() => {
    const targetId = callTarget?._id || callerInfo?.from;
    if (targetId) {
      const socket = getSocket();
      socket?.emit('endCall', { to: targetId });
      console.log('[Call] Sent endCall to:', targetId);
    }
    cleanupCall();
  }, [callTarget, callerInfo, cleanupCall]);

  /** Toggle video */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  /** Toggle audio */
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Determine if we should show the video call UI
  const showVideoUI = callStatus === 'in-call' || callStatus === 'connecting' || callStatus === 'outgoing-ringing';

  const contextValue = {
    callStatus,
    callerInfo,
    callTarget,
    isVideoEnabled,
    isAudioEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}

      {/* ═══ GLOBAL INCOMING CALL MODAL — visible on ALL pages ═══ */}
      {callStatus === 'incoming-ringing' && callerInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 w-[340px] text-center space-y-5 border border-slate-200 dark:border-slate-700 animate-slideInRight">
            {/* Avatar */}
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl font-bold text-white uppercase animate-pulse">
                {callerInfo.callerName?.charAt(0) || '?'}
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary-400/40 animate-ping" />
            </div>

            {/* Info */}
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                {callerInfo.callerName || 'Unknown'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Incoming video consultation...</p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={rejectCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
                title="Decline"
              >
                <PhoneOff size={22} />
              </button>
              <button
                onClick={acceptCall}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-500/30 animate-bounce"
                title="Accept"
              >
                <Phone size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIDEO CALL OVERLAY — outgoing ringing + connecting + in-call ═══ */}
      {showVideoUI && (
        <div className="fixed inset-0 z-[9998] bg-slate-950/95 flex flex-col items-center justify-center gap-6 p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Remote video — full frame */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Ringing / Connecting overlay */}
            {callStatus !== 'in-call' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-3">
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl font-bold uppercase animate-pulse">
                    {(callTarget?.name || callerInfo?.callerName)?.charAt(0) || '?'}
                  </div>
                  {callStatus === 'outgoing-ringing' && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary-400/30 animate-ping" />
                  )}
                </div>
                <p className="text-base font-bold">
                  {callStatus === 'outgoing-ringing'
                    ? `Calling ${callTarget?.name}...`
                    : 'Connecting...'}
                </p>
                <p className="text-xs text-slate-400">
                  {callStatus === 'outgoing-ringing'
                    ? 'Waiting for response'
                    : 'Establishing secure connection'}
                </p>
              </div>
            )}

            {/* Live badge */}
            {callStatus === 'in-call' && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-primary-600/80 backdrop-blur rounded-full text-white text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live Consultation
              </div>
            )}

            {/* Local video PIP — always visible during call */}
            <div className="absolute bottom-4 right-4 w-40 h-30 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-[10px]">
                  Camera loading...
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${
                isAudioEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-red-500/20 text-red-400 border-red-500/50'
              }`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5.166"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              )}
            </button>

            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
              title="End Call"
            >
              <PhoneOff size={20} />
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${
                isVideoEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-red-500/20 text-red-400 border-red-500/50'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video size={18} /> : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              )}
            </button>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}
