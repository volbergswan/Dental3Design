import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Play, Loader2, Key, AlertCircle, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const PromoVideo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [showYoutube, setShowYoutube] = useState(false);

  // ID de votre vidéo YouTube (à configurer si vous souhaitez garder l'option)
  const youtubeVideoId = "dQw4w9WgXcQ"; 

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const generateVideo = async () => {
    setIsGenerating(true);
    setError(null);
    setStatus('Initialisation de la génération...');

    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const prompt = `A professional 3D promotional video for Dental3Design. The video shows high-quality digital dental designs (crowns, bridges, implants) being created on a modern computer screen. It features a clean, high-tech dental laboratory environment. Dynamic text overlays in motion (French): "votre cabinet est équipés en FAO? ou votre laboratoire manque de temps? Dental3Design s'occupe de vos conception numérique! inscrivez vous et déposé vos fichier depuis votre scanner intra oral ou depuis notre plateforme clair, simple et intuitive. et votre cas sera prêt a être traité dans des délais et coût maitrisé pour l'optimisation et la rentabilité de votre cabinet ou laboratoire tout en vous proposant un services de qualité. votre temps est précieux. Avec Dental3Design concentrez vous sur l'essentiel vos patient et la production. rendez vous sur Dental3design.com". Cinematic lighting, smooth camera movements, professional aesthetic.`;

      setStatus('Envoi de la requête à Veo (cela peut prendre quelques minutes)...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Génération en cours... Nous préparons votre vidéo publicitaire.');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setStatus('Génération en cours... Encore un petit moment, le résultat sera exceptionnel.');
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        setStatus('Téléchargement de la vidéo...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': (process.env as any).API_KEY,
          },
        });
        
        if (!response.ok) throw new Error('Erreur lors du téléchargement de la vidéo');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsGenerating(false);
      } else {
        throw new Error('Aucun lien de téléchargement reçu');
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("La clé API semble invalide ou a expiré. Veuillez la sélectionner à nouveau.");
      } else {
        setError("Une erreur est survenue lors de la génération. Veuillez réessayer.");
      }
      setIsGenerating(false);
    }
  };

  if (showYoutube) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto my-12 overflow-hidden rounded-[2.5rem] shadow-2xl border-8 border-white bg-slate-200 aspect-video relative group"
      >
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
          title="Dental3Design Promotional Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
        <button 
          onClick={() => setShowYoutube(false)}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold transition-all opacity-0 group-hover:opacity-100 pointer-events-auto"
        >
          Retour à l'IA Veo
        </button>
      </motion.div>
    );
  }

  if (!hasKey) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 p-8 bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200 text-center">
        <Key className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-black text-slate-900 mb-2">Générer la vidéo publicitaire</h3>
        <p className="text-slate-600 mb-6 text-sm">
          Pour générer la vidéo promotionnelle avec Veo, vous devez sélectionner une clé API Google Cloud payante.
          <br />
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            En savoir plus sur la facturation
          </a>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleOpenKey}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
          >
            Sélectionner une clé API
          </button>
          <button
            onClick={() => setShowYoutube(true)}
            className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3"
          >
            <Youtube size={20} className="text-red-600" />
            Voir la vidéo YouTube
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 p-12 bg-white rounded-3xl border border-slate-100 shadow-xl text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-black text-slate-900 mb-4">Génération de votre vidéo</h3>
        <div className="space-y-4">
          <p className="text-blue-600 font-bold animate-pulse">{status}</p>
          <p className="text-slate-400 text-xs">
            Cette opération utilise l'intelligence artificielle Veo pour créer une vidéo unique. 
            Cela peut prendre entre 2 et 5 minutes.
          </p>
        </div>
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 overflow-hidden rounded-3xl shadow-2xl border border-slate-100 bg-black group relative">
        <video 
          src={videoUrl} 
          controls 
          autoPlay 
          className="w-full aspect-video"
        />
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => setVideoUrl(null)}
            className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            Générer une nouvelle version
          </button>
          <button 
            onClick={() => setShowYoutube(true)}
            className="bg-red-600/80 hover:bg-red-600 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Youtube size={14} />
            Passer sur YouTube
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-lg text-center">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6">
        <Play size={40} fill="currentColor" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-2">Prêt à générer votre pub ?</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Cliquez ci-dessous pour créer une vidéo promotionnelle de 30 secondes personnalisée pour Dental3Design avec l'IA Veo.
      </p>
      <div className="flex flex-col gap-4">
        <button
          onClick={generateVideo}
          className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 mx-auto"
        >
          Lancer la génération Veo
        </button>
        <button
          onClick={() => setShowYoutube(true)}
          className="text-slate-400 hover:text-red-600 text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <Youtube size={16} />
          Ou regarder la vidéo YouTube
        </button>
      </div>
    </div>
  );
};


