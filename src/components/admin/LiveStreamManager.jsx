import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Radio,
  Users,
  Play,
  Square,
  Monitor,
  Camera,
  CameraOff,
  AlertCircle,
  CheckCircle,
  X,
  Smartphone,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { convertToEmbedUrl, validateStreamUrl, getStreamPlatform } from '../../utils/streamUtils';

const LiveStreamManager = () => {
  const [streamTitle, setStreamTitle] = useState('Live depuis El Nadhour');
  const [streamUrl, setStreamUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [urlValidation, setUrlValidation] = useState(null);
  /** Sur téléphone : caméra arrière (cuisine) plutôt que selfie */
  const [preferBackCamera, setPreferBackCamera] = useState(false);

  const videoRef = useRef(null);
  const queryClient = useQueryClient();

  // Get live status
  const { data: liveStatus } = useQuery(
    'live-status',
    () => api.get('/live/status').then(res => res.data),
    {
      refetchInterval: 5000, // Refresh every 5 seconds
      staleTime: 0
    }
  );

  // Start live stream mutation
  const startLiveMutation = useMutation(
    (data) => api.post('/live/start', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('live-status');
        toast.success('Live stream démarré !');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors du démarrage');
      }
    }
  );

  // End live stream mutation
  const endLiveMutation = useMutation(
    () => api.post('/live/end'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('live-status');
        toast.success('Live stream terminé');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de l\'arrêt');
      }
    }
  );

  const handleStartCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Caméra non supportée sur ce navigateur');
      return;
    }

    const facing = preferBackCamera ? { ideal: 'environment' } : { ideal: 'user' };
    const constraintSets = [
      { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: facing }, audio: true },
      { video: { facingMode: facing }, audio: true },
      { video: true, audio: true },
    ];

    for (let i = 0; i < constraintSets.length; i += 1) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraintSets[i]);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setShowCamera(true);
        toast.success('Caméra activée');
        return;
      } catch (error) {
        if (i === constraintSets.length - 1) {
          let errorMessage = "Impossible d'accéder à la caméra";
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Permission refusée — autorisez caméra et micro dans la barre du navigateur';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'Aucune caméra trouvée';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'Caméra déjà utilisée (fermez l’autre appareil ou onglet)';
          }
          toast.error(errorMessage);
        }
      }
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setIsRecording(false);
    toast.success('Caméra arrêtée');
  };

  // Validate URL when it changes
  useEffect(() => {
    if (streamUrl.trim()) {
      const validation = validateStreamUrl(streamUrl);
      setUrlValidation(validation);
    } else {
      setUrlValidation(null);
    }
  }, [streamUrl]);

  const handleStartLive = () => {
    if (!streamTitle.trim()) {
      toast.error('Veuillez entrer un titre pour le live');
      return;
    }

    // Check if we have a valid stream source
    if (!showCamera && !streamUrl.trim()) {
      toast.error('Activez la caméra ou ajoutez une URL de stream');
      return;
    }

    // Validate URL if provided
    if (streamUrl.trim()) {
      const validation = validateStreamUrl(streamUrl);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }

    if (showCamera && !streamUrl.trim()) {
      toast(
        'Les visiteurs ne voient pas la caméra du navigateur. Pour filmer avec le téléphone et diffuser à tous, utilisez l’app YouTube ou Twitch (live), puis collez le lien ci-dessous.',
        { duration: 8000, icon: 'ℹ️' }
      );
    }

    if (showCamera) {
      setIsRecording(true);
    }

    const finalStreamUrl = streamUrl.trim() ? convertToEmbedUrl(streamUrl) : showCamera ? 'camera-live' : '';

    startLiveMutation.mutate({
      title: streamTitle,
      stream_url: finalStreamUrl
    });
  };

  const handleEndLive = () => {
    setIsRecording(false);
    endLiveMutation.mutate();
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const isActive = liveStatus?.isLive;
  const currentStream = liveStatus?.stream;

  return (
    <div className="overflow-hidden rounded-2xl border border-cafe-200/90 bg-white shadow-sm">
      <div className="border-b border-cafe-100 bg-cafe-50/90 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'bg-cafe-200 text-cafe-800'
              }`}
            >
              <Radio className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-cafe-900">Live</h2>
              <p className="text-sm text-cafe-600">
                {isActive ? 'Diffusion en cours' : 'Prêt à démarrer'}
              </p>
            </div>
          </div>
          <div
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              isActive ? 'bg-red-600 text-white' : 'bg-cafe-200 text-cafe-800'
            }`}
          >
            {isActive ? 'En direct' : 'Hors ligne'}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
      {/* Live depuis téléphone — vraie solution pour filmer et être vu */}
      {!isActive && (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-900">
            <Smartphone className="h-5 w-5 shrink-0" />
            <h3 className="font-semibold">Live avec la caméra du téléphone</h3>
          </div>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-emerald-950/90">
            <li>
              Ouvrez l’app <strong>YouTube</strong> (ou <strong>Twitch</strong>) sur votre téléphone.
            </li>
            <li>
              Lancez un <strong>live</strong> / « En direct » (film avec la caméra du téléphone).
            </li>
            <li>
              Copiez le <strong>lien du live</strong> (ou de la chaîne Twitch), puis collez-le dans « URL Stream »
              ci-dessous sur cet écran admin (ordinateur ou mobile).
            </li>
            <li>
              Cliquez sur <strong>Démarrer le Live</strong> : les clients verront la vidéo sur votre site.
            </li>
          </ol>
          <p className="mt-3 text-xs text-emerald-900/80">
            La caméra du navigateur ci-dessous sert surtout à <strong>tester</strong> ; elle n’envoie pas la vidéo
            aux visiteurs sans passer par YouTube/Twitch.
          </p>
        </div>
      )}

      {/* Current Live Info */}
      {isActive && currentStream && (
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-red-950">{currentStream.title}</h3>
              <p className="text-sm text-red-800/90">
                Démarré le {new Date(currentStream.started_at).toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-red-800">
              <Users className="h-4 w-4" />
              <span className="text-sm font-semibold">{currentStream.viewer_count || 0} spectateurs</span>
            </div>
          </div>
        </div>
      )}

      {/* Camera Section */}
      {!isActive && (
        <div className="rounded-xl border border-cafe-200 bg-cafe-50/60 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cafe-700">Test caméra navigateur</h3>
            {!showCamera ? (
              <button
                type="button"
                onClick={handleStartCamera}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cafe-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cafe-800"
              >
                <Camera className="h-4 w-4" />
                Activer la caméra
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopCamera}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <CameraOff className="h-4 w-4" />
                Arrêter
              </button>
            )}
          </div>

          {!showCamera && (
            <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-cafe-800">
              <input
                type="checkbox"
                checked={preferBackCamera}
                onChange={(e) => setPreferBackCamera(e.target.checked)}
                className="rounded border-cafe-300 text-cafe-900 focus:ring-cafe-500"
              />
              Caméra arrière (téléphone / tablette)
            </label>
          )}

          {/* Camera Preview */}
          {showCamera && (
            <div className="bg-black rounded-lg overflow-hidden mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              )}
              {!isRecording && (
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  PREVIEW
                </div>
              )}
              <div className="absolute bottom-4 right-4 rounded bg-black/60 px-2 py-1 text-xs text-white">
                {isRecording ? 'Live actif (mode caméra)' : 'Aperçu local'}
              </div>

              {isRecording && (
                <div className="absolute bottom-4 left-4 max-w-[14rem] rounded bg-amber-500/95 px-2 py-1.5 text-[11px] font-medium leading-snug text-amber-950">
                  Sans URL YouTube/Twitch, les clients ne voient pas cette caméra — seulement une page test.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {!isActive ? (
        <div className="space-y-4">
          {/* Stream Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du live
            </label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-600 focus:border-transparent"
              placeholder="Live depuis El Nadhour"
            />
          </div>

          {/* Stream Options */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div
              className={`rounded-xl border-2 p-4 transition-colors ${
                showCamera ? 'border-cafe-600 bg-cafe-100' : 'border-cafe-200 hover:border-cafe-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Caméra Live</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {showCamera ? 'Caméra active' : 'Utiliser votre caméra'}
              </p>
            </div>
            
            <div
              className={`rounded-xl border-2 p-4 ${
                streamUrl && urlValidation?.isValid
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : streamUrl && !urlValidation?.isValid
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-cafe-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">URL Stream</span>
                </div>
                {urlValidation && (
                  urlValidation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )
                )}
              </div>
              
              <div className="relative">
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    urlValidation && !urlValidation.isValid ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://youtube.com/watch?v=... ou https://twitch.tv/..."
                />
                {streamUrl && (
                  <button
                    onClick={() => setStreamUrl('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {urlValidation && !urlValidation.isValid && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-600 font-medium">{urlValidation.error}</p>
                  {(streamUrl.includes('facebook.com') || streamUrl.includes('instagram.com')) && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-700 font-medium">💡 Alternatives recommandées :</p>
                      <p className="text-xs text-gray-600">• Utilisez la caméra intégrée ci-dessus</p>
                      <p className="text-xs text-gray-600">• Créez un live YouTube à la place</p>
                      <p className="text-xs text-gray-600">• Utilisez OBS avec Twitch</p>
                    </div>
                  )}
                </div>
              )}

              {urlValidation && urlValidation.isValid && urlValidation.warning && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700 font-medium">ℹ️ {urlValidation.warning}</p>
                  {(urlValidation.platform === 'facebook' || urlValidation.platform === 'instagram') && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-blue-600">
                        ✅ Les visiteurs ouvrent directement {urlValidation.platform === 'facebook' ? 'Facebook' : 'Instagram'} (nouvel onglet), sans page sur ce site.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {streamUrl && urlValidation?.isValid && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className={`text-xs ${
                    urlValidation.requiresWorkaround ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    ✓ {getStreamPlatform(streamUrl)} stream detected
                    {urlValidation.requiresWorkaround && ' (with redirect)'}
                  </span>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                <p className="font-medium mb-2 text-gray-700">✅ Plateformes supportées :</p>
                <div className="space-y-1">
                  <p className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>YouTube Live:</strong> youtube.com/watch?v=ABC123</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>Twitch:</strong> twitch.tv/nomdelachaine</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>Facebook / Instagram :</strong> lien du live → ouverture directe</span>
                  </p>
                </div>
                
                <p className="font-medium mt-3 mb-2 text-amber-800">📱 Facebook & Instagram :</p>
                <p className="text-xs text-amber-900 mb-2">
                  Pas de lecteur intégré — redirection vers l’app ou le site officiel (comportement normal).
                </p>
                <p className="font-medium mt-3 mb-2 text-red-700">❌ Non supporté :</p>
                <div className="space-y-1 text-red-600">
                  <p>• TikTok Live (pas d’embed fiable)</p>
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium text-xs mb-2">💡 Besoin d'aide ?</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.open('https://studio.youtube.com/channel/UC/livestreaming', '_blank')}
                      className="w-full text-left text-xs text-blue-700 hover:text-blue-900 bg-white px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      📺 Créer un YouTube Live
                    </button>
                    <button
                      onClick={() => window.open('https://www.twitch.tv/broadcast/dashboard/streammanager', '_blank')}
                      className="w-full text-left text-xs text-blue-700 hover:text-blue-900 bg-white px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      🎮 Aller sur Twitch Creator Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartLive}
            disabled={startLiveMutation.isLoading || (!showCamera && !streamUrl)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            <Play className="h-5 w-5" />
            <span>
              {startLiveMutation.isLoading ? 'Démarrage...' : 'Démarrer le Live'}
            </span>
          </button>
          
          {!showCamera && !streamUrl && (
            <p className="text-sm text-gray-500 text-center">
              Activez la caméra ou ajoutez une URL pour démarrer
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Live Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-cafe-200 bg-cafe-50/80 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-cafe-700" />
              <p className="text-2xl font-bold text-cafe-900">{currentStream?.viewer_count || 0}</p>
              <p className="text-xs text-cafe-600">Spectateurs</p>
            </div>
            <div className="rounded-xl border border-cafe-200 bg-cafe-50/80 p-4 text-center">
              <Monitor className="mx-auto mb-2 h-8 w-8 text-cafe-700" />
              <p className="text-sm font-semibold text-cafe-900">Flux actif</p>
              <p className="text-xs text-cafe-600">Popup + page /en-direct</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEndLive}
            disabled={endLiveMutation.isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cafe-300 bg-white py-3.5 text-sm font-bold text-cafe-900 transition hover:bg-cafe-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Square className="h-5 w-5" />
            <span>
              {endLiveMutation.isLoading ? 'Arrêt...' : 'Arrêter le Live'}
            </span>
          </button>
        </div>
      )}

      <div className="rounded-xl border border-cafe-200 bg-cafe-50/90 p-4 text-sm text-cafe-800">
        <h4 className="mb-2 font-semibold text-cafe-900">Résumé</h4>
        <ul className="list-inside list-disc space-y-1 text-cafe-700">
          <li>URL YouTube ou Twitch = les clients voient le live sur le site.</li>
          <li>Caméra du navigateur = test local uniquement.</li>
          <li>Popup sur l’accueil + page dédiée /en-direct.</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default LiveStreamManager;