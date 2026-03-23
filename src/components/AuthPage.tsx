import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Lock, UserPlus, LogIn, Building2, FileText, MapPin, User, Phone, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
  initialMode?: 'login' | 'signup';
  onShowCGV: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, initialMode = 'login', onShowCGV }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [error, setError] = useState<string | null>(null);
  const [cgvAccepted, setCgvAccepted] = useState(false);

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

  // Personal fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (!cgvAccepted) {
        setError('Vous devez accepter les CGV pour vous inscrire.');
        return;
      }
      if (email !== emailConfirm) {
        setError('Les adresses email ne correspondent pas.');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    // Simulate authentication
    onLogin();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'} bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transition-all duration-300`}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="text-[#0066B2]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5c-4.5 0-7 2.5-7 6 0 4 2 7.5 3 9.5.5 1 1 2 2.5 2 1.5 0 1.5-1.5 1.5-1.5s0 1.5 1.5 1.5c1.5 0 2-1 2.5-2 1-2 3-5.5 3-9.5 0-3.5-2.5-6-7-6z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? t('login') : 'Inscription'}
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {isLogin ? 'Bon retour parmi nous !' : 'Rejoignez Dental3Design dès aujourd\'hui'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type d'entreprise */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Type d'établissement</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBusinessType('cabinet')}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${businessType === 'cabinet' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                  >
                    Cabinet
                  </button>
                  <button
                    type="button"
                    onClick={() => setBusinessType('laboratoire')}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${businessType === 'laboratoire' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                  >
                    Laboratoire
                  </button>
                </div>
              </div>

              {/* Entreprise & SIRET */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nom de l'entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nom de votre structure"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">SIRET</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required value={siret} onChange={(e) => setSiret(e.target.value)}
                    placeholder="14 chiffres"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Adresse de facturation */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Adresse de facturation</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    required value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Adresse complète"
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* Nom & Prénom */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="06 00 00 00 00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${!isLogin ? 'md:grid-cols-2' : ''} gap-6`}>
            {/* Email & Confirmation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirmer l'email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" required value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Password & Confirmation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 mt-4">
              <div className="flex items-center h-5">
                <input
                  id="cgv"
                  name="cgv"
                  type="checkbox"
                  required
                  checked={cgvAccepted}
                  onChange={(e) => setCgvAccepted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 transition-all cursor-pointer"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="cgv" className="font-medium text-slate-600 cursor-pointer">
                  J'ai lu et j'accepte les{' '}
                  <button
                    type="button"
                    onClick={onShowCGV}
                    className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-2"
                  >
                    CGV
                  </button>
                </label>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={!isLogin && !cgvAccepted}
            className={`w-full ${!isLogin && !cgvAccepted ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] mt-6`}
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? t('login') : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

