import React, { useState } from 'react';
import { User, HelpCircle, Globe, ChevronDown, X, Send, ShoppingCart, Trash2 } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface NavbarProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'create-case') => void;
  currentPage: 'landing' | 'auth' | 'dashboard' | 'create-case';
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
  helpSubject: string;
  setHelpSubject: (subject: string) => void;
  cart: {id: string, label: string, units: number, price: number}[];
  setCart: React.Dispatch<React.SetStateAction<{id: string, label: string, units: number, price: number}[]>>;
  onCheckout: (units: number) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  currentPage, 
  showHelpModal, 
  setShowHelpModal,
  helpSubject,
  setHelpSubject,
  cart,
  setCart,
  onCheckout,
  isAuthenticated,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCartMenu, setShowCartMenu] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendHelp = () => {
    if (!helpMessage.trim() || !helpSubject.trim() || (!isAuthenticated && !userEmail.trim())) return;
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      setHelpSubject('');
      setHelpMessage('');
      setUserEmail('');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setShowHelpModal(false);
      }, 3000);
    }, 1000);
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
      >
        <div className="text-[#0066B2] group-hover:scale-110 transition-transform">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3.5c-4.5 0-7 2.5-7 6 0 4 2 7.5 3 9.5.5 1 1 2 2.5 2 1.5 0 1.5-1.5 1.5-1.5s0 1.5 1.5 1.5c1.5 0 2-1 2.5-2 1-2 3-5.5 3-9.5 0-3.5-2.5-6-7-6z" />
          </svg>
        </div>
        <div className="flex items-baseline text-2xl font-bold tracking-tight">
          <span className="text-[#2D3748]">Dental</span>
          <span className="text-red-600">3</span>
          <span className="text-[#0066B2]">Design</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        {isAuthenticated && (
          <div className="hidden md:flex items-center bg-slate-50 p-1 rounded-xl border border-gray-100">
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'dashboard' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-slate-900'
              }`}
            >
              {t('dashboard')}
            </button>
            <button 
              onClick={() => onNavigate('create-case')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'create-case' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-slate-900'
              }`}
            >
              {t('createNewCase')}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-lg">{languages.find(l => l.code === language)?.flag}</span>
            <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showLangMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLangMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      language === lang.code ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowCartMenu(!showCartMenu)}
            className={`p-2 rounded-lg transition-colors relative ${showCartMenu ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShoppingCart size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {showCartMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowCartMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="p-4 border-b border-gray-50 bg-slate-50/50">
                  <h4 className="font-black text-slate-900 tracking-tight">{t('cartTitle')}</h4>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                        <ShoppingCart size={24} />
                      </div>
                      <p className="text-sm text-slate-400 font-medium">{t('emptyCart')}</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.label}</p>
                            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">{item.units} Units • {item.price.toFixed(2)}€</p>
                          </div>
                          <button 
                            onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-50 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('totalCost')}</span>
                      <span className="text-lg font-black text-slate-900">
                        {cart.reduce((acc, item) => acc + item.price, 0).toFixed(2)}€
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        const totalUnits = cart.reduce((acc, item) => acc + item.units, 0);
                        onCheckout(totalUnits);
                        setCart([]);
                        setShowCartMenu(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                      {t('checkout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>


        <button 
          onClick={() => setShowHelpModal(!showHelpModal)}
          className={`p-2 rounded-lg transition-colors ${showHelpModal ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <HelpCircle size={18} />
        </button>
        
        {showHelpModal && (
          <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300" onClick={() => setShowHelpModal(false)}></div>
            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
              <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{t('helpTitle')}</h3>
                    {!showSuccess && (
                      <p className="text-sm text-gray-500 mt-1">
                        {t('helpDescription')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setShowHelpModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                {showSuccess ? (
                  <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      {t('messageSent').split('.')[0]}.
                    </h4>
                    <p className="text-sm text-gray-500 max-w-[280px]">
                      {t('messageSent').split('.')[1] || t('messageSent')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {!isAuthenticated && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            {t('email')}
                          </label>
                          <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="w-full p-3 text-sm border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 transition-all"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          {t('subjectLabel')}
                        </label>
                        <input
                          type="text"
                          value={helpSubject}
                          onChange={(e) => setHelpSubject(e.target.value)}
                          placeholder={t('subjectPlaceholder')}
                          className="w-full p-3 text-sm border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Message
                        </label>
                        <textarea
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          placeholder={t('messagePlaceholder')}
                          className="w-full h-40 p-3 text-sm border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50 transition-all"
                        ></textarea>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={handleSendHelp}
                        disabled={isSending || !helpMessage.trim() || !helpSubject.trim() || (!isAuthenticated && !userEmail.trim())}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                      >
                        {isSending ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Send size={16} />
                        )}
                        {t('sendMessage')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        
        <div className="h-6 w-px bg-gray-200 mx-1"></div>
        
        {isAuthenticated ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg transition-colors group ${showProfileMenu ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none mb-0.5">John Lab</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-none">Premium Plan</p>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-sm group-hover:bg-slate-200 transition-colors">
                JL
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 sm:hidden">
                    <p className="text-sm font-bold text-slate-800">John Lab</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Premium Plan</p>
                  </div>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={16} />
                    </div>
                    <span className="font-medium">{t('manageAccount')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <X size={16} />
                    </div>
                    <span className="font-medium">{t('logout')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            {t('login')}
          </button>
        )}
      </div>
    </nav>
  );
};
