import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { ArrowRight, LogIn, Mail } from 'lucide-react';
import { PromoVideo } from './PromoVideo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onContact: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onContact }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-white to-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="text-[#0066B2] scale-150">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5c-4.5 0-7 2.5-7 6 0 4 2 7.5 3 9.5.5 1 1 2 2.5 2 1.5 0 1.5-1.5 1.5-1.5s0 1.5 1.5 1.5c1.5 0 2-1 2.5-2 1-2 3-5.5 3-9.5 0-3.5-2.5-6-7-6z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          <span className="text-[#2D3748]">Dental</span>
          <span className="text-red-600">3</span>
          <span className="text-[#0066B2]">Design</span>
        </h1>

        <PromoVideo />

        <div className="space-y-6 mb-12">
          {t('landingDescription').split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {t('getStarted')}
            <ArrowRight size={20} />
          </button>
          
          <button
            onClick={onLogin}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <LogIn size={20} />
            {t('login')}
          </button>

          <button
            onClick={onContact}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Mail size={20} />
            {t('contactUs')}
          </button>
        </div>
      </motion.div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Qualité Garantie</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Des conceptions réalisées par des experts pour un résultat optimal.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Rapidité</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Vos fichiers traités dans les meilleurs délais pour votre production.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Rentabilité</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Un service à coût maîtrisé pour optimiser votre cabinet ou laboratoire.</p>
        </div>
      </div>
    </div>
  );
};
