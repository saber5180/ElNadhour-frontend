import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, Loader } from 'lucide-react';

const CameraLiveStream = ({ title = "Live depuis El Nadhour" }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setLoading(true);
        
        // Try to get camera stream for viewing
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setStream(mediaStream);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Impossible d\'accéder à la caméra pour le live');
        setLoading(false);
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Connexion à la caméra...</p>
          <p className="text-sm text-gray-300 mt-2">Veuillez autoriser l'accès à la caméra</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Caméra non disponible</h3>
          <p className="text-gray-300 text-sm mb-4">{error}</p>
          <div className="bg-yellow-500/20 text-yellow-200 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">💡 Solutions :</p>
            <ul className="text-left space-y-1">
              <li>• Actualisez la page et autorisez la caméra</li>
              <li>• Vérifiez que la caméra n'est pas utilisée ailleurs</li>
              <li>• Utilisez Chrome ou Firefox pour une meilleure compatibilité</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
      />
      
      {/* Live Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <Camera className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
};

export default CameraLiveStream;