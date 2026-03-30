import React, { useState } from 'react';
import { User, Globe, ChevronDown, X, Send, ShoppingCart, Trash2, Plus, Minus, Moon, Sun, MessagesSquare, Menu, LayoutGrid } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onNavigate: (page: 'landing' | 'auth' | 'dashboard' | 'create-case' | 'manage-account') => void;
  currentPage: 'landing' | 'auth' | 'dashboard' | 'create-case' | 'view-pending-case' | 'view-completed-case' | 'view-inprogress-case' | 'manage-account';
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
  helpSubject: string;
  setHelpSubject: (subject: string) => void;
  cart: {id: string, label: string, units: number, price: number, quantity: number}[];
  setCart: React.Dispatch<React.SetStateAction<{id: string, label: string, units: number, price: number, quantity: number}[]>>;
  onCheckout: (units: number) => void;
  onOpenChat: (type?: 'bot' | 'admin') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    siret: string;
    billingAddress: string;
    businessType: 'cabinet' | 'laboratoire';
  };
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
  onOpenChat,
  isAuthenticated,
  onLogout,
  userData,
  darkMode,
  setDarkMode
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCartMenu, setShowCartMenu] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 py-2 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
      >
        <div className="text-[#0066B2] dark:text-blue-400 group-hover:scale-110 transition-transform">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3.5c-4.5 0-7 2.5-7 6 0 4 2 7.5 3 9.5.5 1 1 2 2.5 2 1.5 0 1.5-1.5 1.5-1.5s0 1.5 1.5 1.5c1.5 0 2-1 2.5-2 1-2 3-5.5 3-9.5 0-3.5-2.5-6-7-6z" />
          </svg>
        </div>
        <div className="flex items-baseline text-2xl font-bold tracking-tight">
          <span className="text-[#2D3748] dark:text-slate-200">Dental</span>
          <span className="text-red-600">3</span>
          <span className="text-[#0066B2] dark:text-blue-400">Design</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        {isAuthenticated && (
          <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'dashboard' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('dashboard')}
            </button>
            <button 
              onClick={() => onNavigate('create-case')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentPage === 'create-case' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('createNewCase')}
            </button>
          </div>
        )}
        {isAuthenticated && (
          <div className="md:hidden">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={darkMode ? "Mode clair" : "Mode sombre"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
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

        {currentPage !== 'landing' && (
          <div className="relative">
            <button 
              onClick={() => setShowCartMenu(!showCartMenu)}
              className={`p-2 rounded-lg transition-colors relative ${showCartMenu ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            {showCartMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowCartMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="p-4 border-b border-gray-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <h4 className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('cartTitle')}</h4>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-3">
                          <ShoppingCart size={24} />
                        </div>
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{t('emptyCart')}</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
                              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">{item.units * item.quantity} Units • {(item.price * item.quantity).toFixed(2)}€</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCart(prev => prev.map(i => 
                                      i.id === item.id 
                                        ? { ...i, quantity: Math.max(1, i.quantity - 1) } 
                                        : i
                                    ));
                                  }}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCart(prev => prev.map(i => 
                                      i.id === item.id 
                                        ? { ...i, quantity: i.quantity + 1 } 
                                        : i
                                    ));
                                  }}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <button 
                                onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                                className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-4 border-t border-gray-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('totalCost')}</span>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}€
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          const totalUnits = cart.reduce((acc, item) => acc + (item.units * item.quantity), 0);
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
        )}


        {showHelpModal && (
          <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300" onClick={() => setShowHelpModal(false)}></div>
            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('helpTitle')}</h3>
                    {!showSuccess && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {t('helpDescription')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setShowHelpModal(false)} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                {showSuccess ? (
                  <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {t('messageSent').split('.')[0]}.
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 max-w-[280px]">
                      {t('messageSent').split('.')[1] || t('messageSent')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {!isAuthenticated && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            {t('email')}
                          </label>
                          <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="w-full p-3 text-sm border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800 transition-all dark:text-slate-100"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          {t('subjectLabel')}
                        </label>
                        <input
                          type="text"
                          value={helpSubject}
                          onChange={(e) => setHelpSubject(e.target.value)}
                          placeholder={t('subjectPlaceholder')}
                          className="w-full p-3 text-sm border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800 transition-all dark:text-slate-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Message
                        </label>
                        <textarea
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          placeholder={t('messagePlaceholder')}
                          className="w-full h-40 p-3 text-sm border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-slate-50 dark:bg-slate-800 transition-all dark:text-slate-100"
                        ></textarea>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={handleSendHelp}
                        disabled={isSending || !helpMessage.trim() || !helpSubject.trim() || (!isAuthenticated && !userEmail.trim())}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
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
              className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg transition-colors group ${showProfileMenu ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none mb-0.5">{userData.firstName} {userData.lastName}</p>
              </div>
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                {userData.firstName[0]}{userData.lastName[0]}
              </div>
              <ChevronDown size={14} className={`text-gray-400 dark:text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 sm:hidden">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{userData.firstName} {userData.lastName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigate('manage-account');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <User size={16} />
                    </div>
                    <span className="font-medium">{t('manageAccount')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[60] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-slate-100 tracking-tight">Menu</h3>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => {
                    onNavigate('dashboard');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    currentPage === 'dashboard' 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutGrid size={18} />
                  {t('dashboard')}
                </button>
                <button 
                  onClick={() => {
                    onNavigate('create-case');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    currentPage === 'create-case' 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Plus size={18} />
                  {t('createNewCase')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
