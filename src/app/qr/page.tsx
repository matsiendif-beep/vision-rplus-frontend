'use client';
import { useEffect } from 'react';

// Page de redirection rapide pour les QR codes et liens courts
// Usage : visionrplus.com/qr → redirige vers visionrplus.com avec tracking

export default function QRRedirect() {
  useEffect(() => {
    // Redirection immédiate vers la landing page
    window.location.replace('/?ref=qr');
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">R+</div>
        <p className="text-white text-lg font-medium">Vision R+</p>
        <p className="text-white/50 text-sm mt-2">Redirection en cours...</p>
      </div>
    </div>
  );
}
