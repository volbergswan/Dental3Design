import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { DentalChart } from './components/DentalChart';
import { ProsthesisSelector } from './components/ProsthesisSelector';
import { CaseSummary } from './components/CaseSummary';
import { FileUpload } from './components/FileUpload';
import {
  X, Check, AlertCircle, ChevronRight, Plus, ShoppingCart,
  Minus, CreditCard, MessageSquare, Send, Bot
} from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { PROSTHESIS_BASE_DATA } from './constants';
import { motion, AnimatePresence } from 'motion/react';

// ─── Services ─────────────────────────────────────────────────
import { clientLogin, clientSignUp, clientLogout, getClientSession, refreshClientProfile, getAdminProfile } from './lib/authService';
import { getClientCases, createCase, uploadCaseFile } from './lib/caseService';
import { sendMessage, getConversation, subscribeToMessages, markMessagesAsRead } from './lib/messageService';
import { askMrDent, saveChatHistory, loadChatHistory, type MrDentMessage } from './lib/mrDentService';
import { createCheckoutSession, handleStripeReturn, UNIT_PACKS } from './lib/stripeService';
import type { Profile, Case, Message } from './lib/supabase';

// ─── Types ────────────────────────────────────────────────────
type Page = 'landing' | 'auth' | 'dashboard' | 'new-case' | 'messaging' | 'buy-units';

export default function App() {
  const { t } = useLanguage();

  // ─── AUTH STATE ───────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isLoading, setIsLoading] = useState(true);

  // ─── CASES STATE ─────────────────────────────────────────────
  const [cases, setCases] = useState<Case[]>([]);

  // ─── NEW CASE STATE ───────────────────────────────────────────
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [activeTeeth, setActiveTeeth] = useState<number[]>([]);
  const [toothSelections, setToothSelections] = useState<Record<number, string[]>>({});
  const [invalidTeeth, setInvalidTeeth] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [instructions, setInstructions] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── MODALS STATE ─────────────────────────────────────────────
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientUnitsModal, setShowInsufficientUnitsModal] = useState(false);
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentUnits, setPaymentUnits] = useState(0);

  // ─── MESSAGING STATE ─────────────────────────────────────────
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // ─── MR. DENT STATE ───────────────────────────────────────────
  const [showMrDent, setShowMrDent] = useState(false);
  const [mrDentMessages, setMrDentMessages] = useState<MrDentMessage[]>([]);
  const [mrDentInput, setMrDentInput] = useState('');
  const [mrDentLoading, setMrDentLoading] = useState(false);

  // ─── STRIPE STATE ─────────────────────────────────────────────
  const [stripeLoading, setStripeLoading] = useState<string | null>(null);

  // ─── INIT ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // Vérifier retour Stripe
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const paymentUnitsParam = params.get('units');

        // Vérifier session
        const sessionProfile = await getClientSession();

        if (sessionProfile) {
          setProfile(sessionProfile);
          setIsAuthenticated(true);

          // Charger les données
          await loadData(sessionProfile.id);

          // Charger Mr. Dent history
          setMrDentMessages(loadChatHistory(sessionProfile.id));

          // Admin pour messagerie
          const admin = await getAdminProfile();
          setAdminProfile(admin);

          // Gérer retour Stripe
          if (paymentStatus === 'success' && paymentUnitsParam) {
            const units = parseInt(paymentUnitsParam);
            const result = await handleStripeReturn(params.get('session_id') || '');
            if (result.success) {
              const refreshed = await refreshClientProfile(sessionProfile.id);
              setProfile(refreshed);
            }  
            setPaymentUnits(units);
            setShowPaymentSuccessModal(true);
          }

          setCurrentPage('dashboard');
        } else {
          setCurrentPage('landing');
        }
      } catch (err) {
        console.error('Init error:', err);
        setCurrentPage('landing');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ─── REALTIME MESSAGES ────────────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;
    const unsub = subscribeToMessages(profile.id, (msg) => {
      if (currentPage === 'messaging' && adminProfile?.id === msg.sender_id) {
        setMessages(prev => [...prev, msg]);
        markMessagesAsRead(profile.id, msg.sender_id);
      } else {
        setUnreadCount(prev => prev + 1);
      }
    });
    return unsub;
  }, [profile?.id, currentPage, adminProfile?.id]);

  // ─── CHARGER DONNÉES ─────────────────────────────────────────
  const loadData = useCallback(async (clientId: string) => {
    const clientCases = await getClientCases(clientId);
    setCases(clientCases);
  }, []);

  // ─── CHARGER MESSAGES ─────────────────────────────────────────
  useEffect(() => {
    if (currentPage !== 'messaging' || !profile?.id || !adminProfile?.id) return;
    (async () => {
      const msgs = await getConversation(profile.id, adminProfile.id);
      setMessages(msgs);
      await markMessagesAsRead(profile.id, adminProfile.id);
      setUnreadCount(0);
    })();
  }, [currentPage, profile?.id, adminProfile?.id]);

  // ─── TOTAL COST CALCULATION ───────────────────────────────────
  const totalCost = React.useMemo(() => {
    return selectedTeeth.reduce((acc, tooth) => {
      const prostheses = toothSelections[tooth] || [];
      return acc + prostheses.reduce((pAcc, id) => {
        const p = PROSTHESIS_BASE_DATA.find(x => x.id === id);
        return pAcc + (p?.cost || 0);
      }, 0);
    }, 0);
  }, [selectedTeeth, toothSelections]);

  // ─── HANDLERS AUTH ────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    const p = await clientLogin(email, password);
    setProfile(p);
    setIsAuthenticated(true);
    await loadData(p.id);
    setMrDentMessages(loadChatHistory(p.id));
    const admin = await getAdminProfile();
    setAdminProfile(admin);
    setCurrentPage('dashboard');
  };

  const handleSignUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const p = await clientSignUp({ email, password, fullName, phone });
    setProfile(p);
    setIsAuthenticated(true);
    const admin = await getAdminProfile();
    setAdminProfile(admin);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    if (profile?.id) saveChatHistory(profile.id, mrDentMessages);
    await clientLogout();
    setProfile(null);
    setIsAuthenticated(false);
    setCases([]);
    setMessages([]);
    setCurrentPage('landing');
  };

  // ─── HANDLERS TOOTH ──────────────────────────────────────────
  const handleToggleTooth = (number: number, event: React.MouseEvent) => {
    const isShift = event.shiftKey;
    if (isShift) {
      setActiveTeeth(prev =>
        prev.includes(number) ? prev.filter(t => t !== number) : [...prev, number]
      );
      setSelectedTeeth(prev =>
        prev.includes(number) ? prev : [...prev, number]
      );
    } else {
      setActiveTeeth([number]);
      setSelectedTeeth(prev =>
        prev.includes(number) ? prev : [...prev, number]
      );
    }
  };

  const handleProsthesisToggle = (id: string) => {
    const teeth = activeTeeth.length > 0 ? activeTeeth : selectedTeeth;
    setToothSelections(prev => {
      const updated = { ...prev };
      teeth.forEach(tooth => {
        const current = updated[tooth] || [];
        updated[tooth] = current.includes(id)
          ? current.filter(x => x !== id)
          : [...current, id];
      });
      return updated;
    });
  };

  // ─── SOUMETTRE UN CAS ────────────────────────────────────────
  const handleSubmitCase = async () => {
    if (!profile || selectedTeeth.length === 0 || !patientName.trim()) return;

    if (profile.units < totalCost) {
      setShowInsufficientUnitsModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const type = Object.entries(toothSelections)
        .flatMap(([, ids]) => ids)
        .map(id => PROSTHESIS_BASE_DATA.find(p => p.id === id)?.id || id)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');

      const newCase = await createCase({
        clientId: profile.id,
        patientName: patientName.trim(),
        type,
        teeth: selectedTeeth.sort((a, b) => a - b).join(', '),
        units: totalCost,
        instructions: instructions.trim(),
      });

      // Uploader les fichiers
      for (const file of uploadedFiles) {
        await uploadCaseFile({
          caseId: newCase.id,
          file,
          uploadedBy: profile.id,
          isFromAdmin: false,
        });
      }

      // Mettre à jour la liste des cas
      setCases(prev => [newCase, ...prev]);

      // Reset formulaire
      setSelectedTeeth([]);
      setActiveTeeth([]);
      setToothSelections({});
      setInvalidTeeth([]);
      setUploadedFiles([]);
      setInstructions('');
      setPatientName('');

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Erreur soumission cas:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── STRIPE CHECKOUT ─────────────────────────────────────────
  const handleBuyUnits = async (priceId: string, units: number) => {
    if (!profile) return;
    setStripeLoading(priceId);
    try {
      const { url } = await createCheckoutSession({
        priceId,
        units,
        clientId: profile.id,
        stripeCustomerId: profile.stripe_customer_id,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error('Stripe error:', err);
      alert('Erreur lors de la redirection vers le paiement. Veuillez réessayer.');
    } finally {
      setStripeLoading(null);
    }
  };

  // ─── MR. DENT ─────────────────────────────────────────────────
  const handleMrDentSend = async () => {
    if (!mrDentInput.trim() || mrDentLoading) return;
    const userMsg = mrDentInput.trim();
    setMrDentInput('');

    const newUserMsg: MrDentMessage = { role: 'user', content: userMsg };
    const updatedHistory = [...mrDentMessages, newUserMsg];
    setMrDentMessages(updatedHistory);
    setMrDentLoading(true);

    try {
      const response = await askMrDent(mrDentMessages, userMsg);
      const assistantMsg: MrDentMessage = { role: 'assistant', content: response };
      const finalHistory = [...updatedHistory, assistantMsg];
      setMrDentMessages(finalHistory);
      if (profile?.id) saveChatHistory(profile.id, finalHistory);

      // Sauvegarder le message Mr. Dent en base si admin connecté
      if (profile?.id && adminProfile?.id) {
        await sendMessage({
          senderId: profile.id,
          receiverId: adminProfile.id,
          content: `[Mr. Dent] Q: ${userMsg}\nR: ${response}`,
          isMrDent: true,
        });
      }
    } catch (err: any) {
      const errMsg: MrDentMessage = {
        role: 'assistant',
        content: 'Je suis temporairement indisponible. Veuillez réessayer ou contacter l\'équipe directement.',
      };
      setMrDentMessages(prev => [...prev, errMsg]);
    } finally {
      setMrDentLoading(false);
    }
  };

  // ─── MESSAGERIE ───────────────────────────────────────────────
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !profile?.id || !adminProfile?.id) return;
    const text = newMessage;
    setNewMessage('');
    try {
      const msg = await sendMessage({
        senderId: profile.id,
        receiverId: adminProfile.id,
        content: text,
      });
      setMessages(prev => [...prev, msg]);
    } catch {
      setNewMessage(text);
    }
  };

  // ─── LOADING SCREEN ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER CONTENT ───────────────────────────────────────────
  const renderContent = () => {
    if (!isAuthenticated) {
      if (currentPage === 'auth') {
        return (
          <AuthPage
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            onBack={() => setCurrentPage('landing')}
          />
        );
      }
      return (
        <LandingPage
          onGetStarted={() => setCurrentPage('auth')}
          onLogin={() => setCurrentPage('auth')}
          onContact={() => setCurrentPage('auth')}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            cases={cases}
            profile={profile!}
            onNavigate={(page: any) => setCurrentPage(page)}
            onCaseClick={(c: any) => console.log(c)}
          />
        );

      case 'new-case':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {t('createNewCase')}
              </h1>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-bold transition-colors"
              >
                ← {t('backToDashboard')}
              </button>
            </div>

            {/* Nom du patient */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                {t('patientNameLabel') || 'Nom du patient'}
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder={t('patientNamePlaceholder') || 'M. Jean Dupont'}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                {/* Schéma dentaire */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                    {t('selectTeeth')}
                  </h2>
                  <DentalChart
                    selectedTeeth={selectedTeeth}
                    activeTeeth={activeTeeth}
                    invalidTeeth={invalidTeeth}
                    toothSelections={toothSelections}
                    onToggleTooth={handleToggleTooth}
                  />
                </div>

                {/* Sélecteur prothèses */}
                {activeTeeth.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                      {t('selectProsthesisType')}
                    </h2>
                    <ProsthesisSelector
                      activeTeeth={activeTeeth}
                      toothSelections={toothSelections}
                      onToggle={handleProsthesisToggle}
                    />
                  </div>
                )}

                {/* Upload fichiers */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                    {t('uploadStl') || 'Fichiers STL/DICOM'}
                  </h2>
                  <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
                </div>

                {/* Instructions */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                    {t('caseInstructions')}
                  </h2>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t('placeholderInstructions') || t('instructionsPlaceholder') || ''}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-100 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Sidebar: résumé + soumettre */}
              <div className="space-y-6">
                <CaseSummary
                  selectedTeeth={selectedTeeth}
                  toothSelections={toothSelections}
                  invalidTeeth={invalidTeeth}
                />

                {/* Solde */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500">{t('unitsAvailable')}</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{profile?.units || 0}</span>
                  </div>
                  <div className={`text-xs font-bold ${(profile?.units || 0) >= totalCost ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(profile?.units || 0) >= totalCost ? '✓ Solde suffisant' : `⚠ Solde insuffisant (manque ${totalCost - (profile?.units || 0)} unités)`}
                  </div>
                </div>

                <button
                  onClick={handleSubmitCase}
                  disabled={isSubmitting || selectedTeeth.length === 0 || !patientName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                  {t('submitCase')}
                </button>
              </div>
            </div>
          </div>
        );

      case 'messaging':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                D3
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dental3Design</h2>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">En ligne</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === profile?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm border ${
                      isMe
                        ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                        : msg.is_mr_dent
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-900/30 rounded-tl-none'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.is_mr_dent && (
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">🦷 Mr. Dent</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] mt-2 block ${isMe ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {messages.length === 0 && (
                <div className="text-center text-slate-400 italic text-sm py-12">
                  Démarrez la conversation avec l'équipe Dental3Design
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('messagePlaceholder')}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {isAuthenticated && (
        <Navbar
          onNavigate={(page: any) => setCurrentPage(page)}
          currentPage={currentPage as any}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          unreadMessages={unreadCount}
          units={profile?.units || 0}
          onBuyUnits={() => setShowBuyUnitsModal(true)}
          onNewCase={() => setCurrentPage('new-case')}
        />
      )}

      <main className={`${isAuthenticated ? 'max-w-7xl mx-auto px-6 py-8' : ''}`}>
        {renderContent()}
      </main>

      {isAuthenticated && (
        <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-400 dark:text-slate-600 text-sm">
          <p>{t('footerCopyright') || '© 2026 Dental3Design. Tous droits réservés.'}</p>
        </footer>
      )}

      {/* ─── MR. DENT CHATBOT ──────────────────────────────────── */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <AnimatePresence>
            {showMrDent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg">🦷</div>
                    <div>
                      <p className="text-white font-black text-sm">Mr. Dent</p>
                      <p className="text-blue-200 text-[10px] font-bold uppercase">Assistant Dental3Design</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMrDent(false)} className="text-white/70 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="h-72 overflow-y-auto p-4 space-y-3">
                  {mrDentMessages.length === 0 && (
                    <div className="text-center text-slate-400 text-xs italic py-8">
                      Bonjour ! Je suis Mr. Dent 🦷<br />
                      Posez-moi vos questions sur Dental3Design
                    </div>
                  )}
                  {mrDentMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {mrDentLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-50 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={mrDentInput}
                    onChange={(e) => setMrDentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMrDentSend()}
                    placeholder="Posez votre question..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-slate-100"
                  />
                  <button
                    onClick={handleMrDentSend}
                    disabled={!mrDentInput.trim() || mrDentLoading}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 active:scale-95 transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowMrDent(!showMrDent)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center text-2xl active:scale-95 transition-all"
          >
            🦷
          </button>
        </div>
      )}

      {/* ─── MODAL ACHAT UNITÉS ──────────────────────────────── */}
      <AnimatePresence>
        {showBuyUnitsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-[200]"
              onClick={() => setShowBuyUnitsModal(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[210] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('buyUnitsTitle') || 'Acheter des unités'}</h3>
                  <button onClick={() => setShowBuyUnitsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{t('currentBalance') || 'Solde actuel'}</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{profile?.units || 0} <span className="text-sm">units</span></span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {UNIT_PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => handleBuyUnits(pack.priceId, pack.units)}
                      disabled={!!stripeLoading}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                        pack.popular
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 bg-white dark:bg-slate-900'
                      } disabled:opacity-50`}
                    >
                      {pack.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Populaire
                        </span>
                      )}
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">{pack.label}</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{pack.price}€</p>
                      {stripeLoading === pack.priceId ? (
                        <div className="mt-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                          {(pack.price / pack.units).toFixed(0)}€/unit
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-400 text-center mt-4 font-medium">
                  Paiement sécurisé via Stripe · Les unités sont créditées instantanément
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MODAL SUCCÈS SOUMISSION ─────────────────────────── */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[210] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl text-center border border-slate-100 dark:border-slate-800"
              >
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  {t('caseSentTitle') || 'Cas envoyé !'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                  {t('caseSentMessage') || 'Votre cas a bien été envoyé et est en cours de traitement.'}
                </p>
                <button
                  onClick={() => { setShowSuccessModal(false); setCurrentPage('dashboard'); }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {t('backToDashboard')}
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MODAL UNITÉS INSUFFISANTES ──────────────────────── */}
      <AnimatePresence>
        {showInsufficientUnitsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[210] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl text-center border border-slate-100 dark:border-slate-800"
              >
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  {t('insufficientUnitsTitle')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                  {t('insufficientUnitsMessage')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInsufficientUnitsModal(false)}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowInsufficientUnitsModal(false);
                      setShowBuyUnitsModal(true);
                    }}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    {t('buyMoreUnits')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MODAL PAIEMENT RÉUSSI ────────────────────────────── */}
      <AnimatePresence>
        {showPaymentSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[210] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl text-center border border-slate-100 dark:border-slate-800"
              >
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  Paiement réussi !
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{paymentUnits}</span> unités ont été ajoutées à votre compte.
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-8">
                  Nouveau solde : <span className="text-blue-600 dark:text-blue-400">{profile?.units || 0} units</span>
                </p>
                <button
                  onClick={() => setShowPaymentSuccessModal(false)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Parfait !
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
