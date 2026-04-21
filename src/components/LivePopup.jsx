import React, { useState, useEffect } from 'react';
import { X, Users, Radio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { getStreamPlatform, isExternalOnlyLiveUrl } from '../utils/streamUtils';

const LivePopup = () => {
  const [liveData, setLiveData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check live status every 10 seconds
  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const response = await api.get('/live/status');
        const { isLive, stream } = response.data;
        
        if (isLive && stream) {
          setLiveData(stream);
          setIsVisible(true);
        } else {
          setLiveData(null);
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error checking live status:', error);
      }
    };

    // Check immediately
    checkLiveStatus();

    // Then check every 10 seconds
    const interval = setInterval(checkLiveStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinLive = async () => {
    const url = liveData?.stream_url;
    if (!url) return;

    if (isExternalOnlyLiveUrl(url)) {
      try {
        await api.post(`/live/${liveData.id}/view`);
      } catch {
        /* ignore */
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      setIsVisible(false);
      return;
    }

    navigate('/en-direct');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !liveData) return null;
  /* Page live plein écran : pas de toast redondant */
  if (location.pathname === '/en-direct' || location.pathname === '/live') return null;
  /* Administration : pas de bandeau « rejoindre le live » */
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Modern Notification Style Popup — au-dessus de la navbar (z-50) */}
      <div className="fixed top-6 right-6 z-[100] animate-live-popup-in max-w-xs max-sm:left-4 max-sm:right-4 max-sm:max-w-none">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-600">LIVE</span>
              <span className="text-xs text-gray-500">
                • {liveData.viewer_count ?? 0}{' '}
                {Number(liveData.viewer_count) === 1 ? 'spectateur' : 'spectateurs'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <div className="flex items-start space-x-3">
              {/* Logo / aperçu : fond clair pour que /icon.png (souvent foncé) reste lisible */}
              <div className="relative mt-1 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-cafe-600/25">
                {liveData.stream_url === 'camera-live' ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
                    <Radio className="h-4 w-4 animate-pulse text-white" />
                  </div>
                ) : getStreamPlatform(liveData.stream_url) === 'facebook' ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                ) : getStreamPlatform(liveData.stream_url) === 'instagram' ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-orange-400">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src="/icon.png"
                    alt=""
                    className="h-9 w-9 object-contain p-0.5"
                    width={36}
                    height={36}
                    decoding="async"
                  />
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    El Nadhour is live
                  </h3>
                  {liveData.stream_url === 'camera-live' ? (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      📹 CAMERA
                    </span>
                  ) : getStreamPlatform(liveData.stream_url) === 'facebook' ? (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      📘 FACEBOOK
                    </span>
                  ) : getStreamPlatform(liveData.stream_url) === 'instagram' ? (
                    <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      📷 INSTAGRAM
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">
                  {liveData.title || 'Live depuis notre restaurant'}
                </p>
                
                {/* Action */}
                <button
                  onClick={handleJoinLive}
                  className={`w-full font-medium py-2 px-3 rounded-lg transition-colors text-xs ${
                    getStreamPlatform(liveData.stream_url) === 'facebook'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : getStreamPlatform(liveData.stream_url) === 'instagram'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white'
                      : 'bg-[#1F5A6B] hover:bg-[#164550] text-white'
                  }`}
                >
                  {liveData.stream_url === 'camera-live' 
                    ? 'Voir le live'
                    : getStreamPlatform(liveData.stream_url) === 'facebook'
                    ? 'Ouvrir sur Facebook'
                    : getStreamPlatform(liveData.stream_url) === 'instagram'
                    ? 'Ouvrir sur Instagram'
                    : 'Voir le live'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default LivePopup;