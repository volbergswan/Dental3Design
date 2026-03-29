import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import {
  Mail, Lock, UserPlus, LogIn, Building2, FileText,
  MapPin, User, Phone, AlertCircle, Loader2
} from 'lucide-react';
import { loginLab, signupLab } from '../lib/authService';
import type { Lab } from '../lib/supabase';

interface AuthPageProps {
  onLogin: (lab: Lab) => void;
  initialMode?: 'login' | 'signup';
  onShowCGV: () => void;
  onModeChange?: (mode: 'login' | 'signup') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin, initialMode = 'login', onShowCGV, onModeChange
}) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cgvAccepted, setCgvAccepted] = useState(false);

  useEffect(() => { setIsLogin(initialMode === 'login'); }, [initialMode]);

  // Auth fields
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Business fields
  const [businessType, setBusinessType] = useState<'cabinet' | 'laboratoire'>('cabinet');
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (!cgvAccepted) { setError('Vous devez accepter les CGV pour vous inscrire.'); return; }
      if (email !== emailConfirm) { setError('Les adresses email ne correspondent pas.'); return; }
      if (password !== passwordConfirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { lab } = await loginLab(email, password);
        onLogin(lab);
      } else {
        const lab = await signupLab({
          email,
          password,
          name: companyName || `${firstName} ${lastName}`,
          phone: phoneNumber,
        });
        onLogin(lab);
      }
    } catch (err: any) {
      const msg = err.message ?? '';
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('already registered')) {
        setError('Cet email est déjà utilisé. Connectez-vous.');
      } else if (msg.includes('désactivé')) {
        setError(msg);
      } else {
        setError(msg || 'Une erreur est survenue. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'} bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 transition-all duration-300`}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="text-[#0066B2] dark:text-blue-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5c-4.5 0-7 2.5-7 6 0 4 2 7.5 3 9.5.5 1 1 2 2.5 2 1.5 0 1.5-1.5 1.5-1.5s0 1.5 1.5 1.5c1.5 0 2-1 2.5-2 1-2 3-5.5 3-9.5 0-3.5-2.5-6-7-6z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isLogin ? t('login') : 'Inscription'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isLogin ? 'Bon retour parmi nous !' : 'Rejoignez Dental3Design dès aujourd\'hui'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type d'établissement */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Type d'établissement
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(['cabinet', 'laboratoire'] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setBusinessType(type)}
                      className={`py-3 rounded-xl border-2 font-bold text-sm transition-all capitalize ${businessType === type ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                    >{type}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Nom de l'entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nom de votre structure"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">SIRET</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="14 chiffres"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Adresse de facturation</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Votre adresse complète"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Nom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Votre nom"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="06 00 00 00 00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${!isLogin ? 'md:grid-cols-2' : ''} gap-6`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100 disabled:opacity-60" />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Confirmer l'email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" required value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100 disabled:opacity-60" />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-slate-100" />
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 mt-4">
              <input id="cgv" type="checkbox" required checked={cgvAccepted} onChange={(e) => setCgvAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-blue-600 border-slate-200 dark:border-slate-700 rounded focus:ring-blue-500 cursor-pointer bg-white dark:bg-slate-800" />
              <label htmlFor="cgv" className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                J'ai lu et j'accepte les{' '}
                <button type="button" onClick={onShowCGV} className="text-blue-600 dark:text-blue-400 font-bold underline">CGV</button>
              </label>
            </div>
          )}

          <button type="submit" disabled={loading || (!isLogin && !cgvAccepted)}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-6 ${
              loading || (!isLogin && !cgvAccepted)
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Connexion...' : isLogin ? t('login') : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
          <button onClick={() => {
            const newMode = isLogin ? 'signup' : 'login';
            setIsLogin(!isLogin);
            setError(null);
            if (onModeChange) onModeChange(newMode);
          }} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
