import React, { useState } from 'react';
import { Play, Youtube } from 'lucide-react';
import { motion } from 'motion/react';

export const PromoVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Configurable via variable d'environnement ou hardcodé quand la vidéo sera prête
  const youtubeVideoId = import.meta.env.VITE_YOUTUBE_VIDEO_ID || '';

  // Si pas encore de vidéo YouTube configurée, afficher un placeholder
  if (!youtubeVideoId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto my-12 overflow-hidden rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 aspect-video flex flex-col items-center justify-center gap-4"
      >
        <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-slate-700/80 flex items-center justify-center shadow-lg">
          <Youtube size={36} className="text-red-500" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
          Vidéo de présentation
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs">
          Bientôt disponible
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto my-12 overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-900 aspect-video relative group"
    >
      {!isPlaying ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white group cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border border-white/20">
            <Play size={36} className="ml-1" />
          </div>
          <p className="text-white/60 font-bold text-sm uppercase tracking-widest">
            Voir la vidéo
          </p>
        </button>
      ) : (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
          title="Dental3Design — Présentation"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </motion.div>
  );
};
