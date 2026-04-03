const { useState, useRef, useEffect, useCallback } = require('react');
const {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} = require('react-native-webrtc');
const { ref, set, onValue, remove, push } = require('firebase/database');
const { rtdb } = require('../firebase/firebaseConfig');
const { WEBRTC_SIGNAL_PATH } = require('../constants');

/**
 * Configuration ICE — serveurs STUN publics gratuits
 * Permettent la traversée NAT (connexion même via 4G)
 */
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/**
 * Hook côté PROPRIO — reçoit le flux vidéo/audio de la tablette vendeur
 * @param {string} cartId - identifiant du cart à surveiller
 */
const useWebRTCViewer = (cartId) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connected, setConnected]       = useState(false);
  const [connecting, setConnecting]     = useState(false);
  const pcRef = useRef(null);

  const signalRef = cartId
    ? ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}`)
    : null;

  const connect = useCallback(async () => {
    if (!cartId || !signalRef) return;
    setConnecting(true);

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Quand on reçoit le flux distant (caméra tablette)
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setConnected(true);
        setConnecting(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed') {
        setConnected(false);
        setConnecting(false);
      }
    };

    // Envoyer nos ICE candidates à la tablette via Realtime DB
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        push(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/viewer-candidates`), {
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Écouter l'offre SDP de la tablette
    onValue(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/offer`), async (snap) => {
      const offer = snap.val();
      if (!offer || pc.currentRemoteDescription) return;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Envoyer notre réponse à la tablette
      await set(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/answer`), {
        type: answer.type,
        sdp: answer.sdp,
      });
    });

    // Écouter les ICE candidates de la tablette
    onValue(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/host-candidates`), (snap) => {
      const candidates = snap.val();
      if (!candidates) return;
      Object.values(candidates).forEach(async (c) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c.candidate));
        } catch (e) {
          console.warn('[WebRTC] addIceCandidate viewer:', e.message);
        }
      });
    });
  }, [cartId]);

  const disconnect = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (signalRef) remove(signalRef);
    setRemoteStream(null);
    setConnected(false);
    setConnecting(false);
  }, [cartId]);

  useEffect(() => {
    return () => disconnect();
  }, []);

  return { remoteStream, connected, connecting, connect, disconnect };
};

/**
 * Hook côté TABLETTE VENDEUR — diffuse la caméra vers le proprio
 * La caméra capture en arrière-plan, aucun aperçu affiché
 * @param {string} cartId
 */
const useWebRTCBroadcaster = (cartId) => {
  const [broadcasting, setBroadcasting] = useState(false);
  const pcRef         = useRef(null);
  const localStreamRef = useRef(null);

  const startBroadcast = useCallback(async () => {
    if (!cartId) return;

    try {
      // Capturer caméra arrière + audio — invisible sur la tablette
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'environment', // caméra arrière
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24 },
        },
      });

      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Ajouter les pistes au peer connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Envoyer ICE candidates au proprio via Realtime DB
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          push(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/host-candidates`), {
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Créer l'offre SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Publier l'offre pour le proprio
      await set(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/offer`), {
        type: offer.type,
        sdp: offer.sdp,
      });

      // Écouter la réponse du proprio
      onValue(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/answer`), async (snap) => {
        const answer = snap.val();
        if (!answer || pc.currentRemoteDescription) return;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setBroadcasting(true);
      });

      // Écouter les ICE candidates du proprio
      onValue(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}/viewer-candidates`), (snap) => {
        const candidates = snap.val();
        if (!candidates) return;
        Object.values(candidates).forEach(async (c) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c.candidate));
          } catch (e) {
            console.warn('[WebRTC] addIceCandidate host:', e.message);
          }
        });
      });

    } catch (e) {
      console.error('[WebRTC] startBroadcast:', e.message);
    }
  }, [cartId]);

  const stopBroadcast = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remove(ref(rtdb, `${WEBRTC_SIGNAL_PATH}/${cartId}`));
    setBroadcasting(false);
  }, [cartId]);

  useEffect(() => {
    return () => stopBroadcast();
  }, []);

  return { broadcasting, startBroadcast, stopBroadcast };
};

module.exports = { useWebRTCViewer, useWebRTCBroadcaster };
