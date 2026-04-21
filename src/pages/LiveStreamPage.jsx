import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { ArrowLeft, Users, Radio, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getStreamPlatform, isExternalOnlyLiveUrl, getLiveIframeSrc } from '../utils/streamUtils';
import CameraLiveStream from '../components/CameraLiveStream';

const LiveStreamPage = () => {
  const navigate = useNavigate();
  const [hasJoined, setHasJoined] = useState(false);
  const externalRedirectStarted = useRef(false);

  // Get live status
  const { data: liveStatus, isLoading } = useQuery(
    'live-status',
    () => api.get('/live/status').then(res => res.data),
    {
      refetchInterval: 5000,
      staleTime: 0
    }
  );

  // Join live stream (increment viewer count)
  const handleJoinLive = async () => {
    if (!liveStatus?.stream || hasJoined) return;

    try {
      await api.post(`/live/${liveStatus.stream.id}/view`);
      setHasJoined(true);
    } catch (error) {
      console.error('Error joining live:', error);
    }
  };

  useEffect(() => {
    if (liveStatus?.isLive && !hasJoined) {
      const url = liveStatus?.stream?.stream_url;
      if (isExternalOnlyLiveUrl(url)) return;
      handleJoinLive();
    }
  }, [liveStatus?.isLive]);

  // Facebook / Instagram : ouverture directe, sans page intermédiaire
  useEffect(() => {
    if (!liveStatus?.isLive || !liveStatus.stream || externalRedirectStarted.current) return;
    const { stream_url, id } = liveStatus.stream;
    if (!isExternalOnlyLiveUrl(stream_url)) return;

    externalRedirectStarted.current = true;
    (async () => {
      try {
        await api.post(`/live/${id}/view`);
      } catch {
        /* ignore */
      }
      window.location.replace(stream_url);
    })();
  }, [liveStatus?.isLive, liveStatus?.stream]);

  // Redirect if no live stream
  useEffect(() => {
    if (!isLoading && !liveStatus?.isLive) {
      navigate('/');
    }
  }, [liveStatus?.isLive, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du live...</p>
        </div>
      </div>
    );
  }

  if (!liveStatus?.isLive) {
    return null; // Will redirect
  }

  const stream = liveStatus.stream;
  const iframeSrc = getLiveIframeSrc(stream.stream_url);

  if (isExternalOnlyLiveUrl(stream.stream_url)) {
    const label = getStreamPlatform(stream.stream_url) === 'instagram' ? 'Instagram' : 'Facebook';
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="animate-pulse w-12 h-12 rounded-full bg-cafe-600 mb-4" />
        <p className="text-cafe-900 font-medium text-center">Ouverture de {label}…</p>
        <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
          Si rien ne se passe,{' '}
          <a href={stream.stream_url} className="text-cafe-700 underline font-medium">
            cliquez ici
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <Radio className="h-4 w-4 animate-pulse" />
                <span className="font-bold text-sm">LIVE</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm font-semibold">{stream.viewer_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Live Stream Video */}
              <div className="relative bg-black aspect-video">
                {stream.stream_url === 'camera-live' ? (
                  <div className="relative h-full w-full">
                    <CameraLiveStream title={stream.title} />
                    <p className="absolute bottom-14 left-2 right-2 rounded bg-black/70 px-2 py-1.5 text-center text-[11px] text-amber-100">
                      Aperçu caméra locale (test). Pour un vrai live public, utilisez une URL{' '}
                      <strong>YouTube</strong> ou <strong>Twitch</strong> dans l’admin.
                    </p>
                  </div>
                ) : iframeSrc ? (
                  <iframe
                    key={iframeSrc}
                    src={iframeSrc}
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    title={`${getStreamPlatform(stream.stream_url)} Live Stream`}
                    loading="eager"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  // Placeholder
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Radio className="h-10 w-10 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Live depuis El Nadhour</h3>
                      <p className="text-gray-300 mb-4">Découvrez ce qui se passe en direct dans notre cuisine</p>
                    </div>
                  </div>
                )}
                
                {/* Live Indicator Overlay - Only for non-camera streams */}
                {stream.stream_url !== 'camera-live' && iframeSrc && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>EN DIRECT</span>
                  </div>
                )}
                
                {/* Platform Badge */}
                {iframeSrc && stream.stream_url !== 'camera-live' && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    via {getStreamPlatform(stream.stream_url)}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {stream.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Démarré le {new Date(stream.started_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{stream.viewer_count || 0} spectateurs</span>
                  </div>
                </div>
                {iframeSrc && getStreamPlatform(stream.stream_url) === 'youtube' && (
                  <p className="mt-3 text-xs text-gray-500">
                    La lecture auto démarre souvent <strong>muette</strong> — cliquez sur l’icône volume dans le lecteur YouTube pour activer le son.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">À propos du live</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <img src="/icon.png" alt="El Nadhour" className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">El Nadhour</h4>
                    <p className="text-sm text-gray-600">Restaurant & Café de qualité</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  Rejoignez-nous en direct depuis notre cuisine pour découvrir comment nous préparons 
                  vos plats préférés avec passion et savoir-faire.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/carte')}
                  className="w-full bg-[#1F5A6B] hover:bg-[#164550] text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Voir notre menu
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stream.viewer_count || 0}</div>
                  <div className="text-sm text-gray-600">Spectateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 60000)}
                  </div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPage;