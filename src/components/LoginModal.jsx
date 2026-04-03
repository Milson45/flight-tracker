import React from 'react';
import useFlightStore from '../store/flightStore';
import { auth, provider, signInWithPopup } from '../services/firebase';

export default function LoginModal({ onClose }) {
  const setUser = useFlightStore((s) => s.setUser);

  const handleGoogleSignIn = async () => {
    try {
      if (!auth) {
        alert("Firebase is not configured! Please add your API keys to the .env file.");
        return;
      }
      
      const result = await signInWithPopup(auth, provider);
      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
      onClose();
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Failed to sign in. " + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#1e293b', width: '400px', borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden',
        border: '1px solid #334155'
      }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Sign in to GM radar
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
            Unlock global aircraft bookmarks, custom filters, and advanced 3D playback.
          </p>

          <button 
            onClick={handleGoogleSignIn}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              backgroundColor: 'white', color: '#0f172a', border: 'none', padding: '12px',
              borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              marginTop: '16px', transition: 'background 0.2s'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.5.7 4.8 1.9l3.5-3.5C18.2 1.3 15.3 0 12 0 7.3 0 3.2 2.7 1 6.6l4.2 3.2C6.3 6.9 8.9 4.8 12 4.8z"/>
              <path fill="#4285F4" d="M23.5 12c0-.8-.1-1.6-.2-2.4H12v4.6h6.5c-.3 1.5-1.1 2.8-2.3 3.7l4.1 3.2c2.4-2.2 3.8-5.5 3.8-9.1z"/>
              <path fill="#FBBC05" d="M5.3 13.9c-.3-.9-.4-1.8-.4-2.8 0-1 .1-1.9.4-2.8L1.1 5.1c-.8 1.6-1.1 3.4-1.1 5.2 0 1.9.4 3.7 1.1 5.4l4.2-3.2z"/>
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8.1-2.9l-4.1-3.2c-1.1.8-2.5 1.3-4 1.3-3.1 0-5.8-2.1-6.7-5H1.1v3.3C3.2 21.3 7.3 24 12 24z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
