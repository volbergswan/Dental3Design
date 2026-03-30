import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DentalChart } from './components/DentalChart';
import { ProsthesisSelector } from './components/ProsthesisSelector';
import { FileUpload } from './components/FileUpload';
import { CaseSummary } from './components/CaseSummary';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import {
  ChevronRight, Plus, X, ShoppingCart, Check, AlertCircle,
  ShieldAlert, FileText, Activity, Clock, Download, CheckCircle,
  MessageSquare, Send, Loader2, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './contexts/LanguageContext';
import { PROSTHESIS_BASE_DATA } from './constants';
import { loginLab, signupLab, logoutLab, getLabSession, onLabAuthChange } from './lib/authService';
import { getCasesByLab, createCase, subscribeToCases } from './lib/caseService';
import { getMessages, sendMessageToAdmin, subscribeToMessages } from './lib/messageService';
import { askMrDent, MR_DENT_GREETING } from './lib/mrDentService';
import type { Lab, Case, Message } from './lib/supabase';

const SUPPORTING_TYPES = ['crown', 'pilier', 'coping', 'inlay'];
const PONTIC_TYPES = ['pontic', 'reduced_pontic'];

const getNeighbors = (num: number): number[] => {
  const neighbors: number[] = [];
  if (num >= 11 && num <= 18) { if (num < 18) neighbors.push(num + 1); if (num > 11) neighbors.push(num - 1); if (num === 11) neighbors.push(21); }
  else if (num >= 21 && num <= 28) { if (num > 21) neighbors.push(num - 1); if (num < 28) neighbors.push(num + 1); if (num === 21) neighbors.push(11); }
  else if (num >= 31 && num <= 38) { if (num > 31) neighbors.push(num - 1); if (num < 38) neighbors.push(num + 1); if (num === 31) neighbors.push(41); }
  else if (num >= 41 && num <= 48) { if (num < 48) neighbors.push(num + 1); if (num > 41) neighbors.push(num - 1); if (num === 41) neighbors.push(31); }
  return neighbors;
};

const validatePontics = (selections: Record<number, string[]>) => {
  const allTeeth = Object.keys(selections).map(Number);
  const ponticTeeth = allTeeth.filter(t => (selections[t] || []).some(id => PONTIC_TYPES.includes(id)));
  const supportingTeeth = allTeeth.filter(t => (selections[t] || []).some(id => SUPPORTING_TYPES.includes(id)));
  const invalid: number[] = [];
  ponticTeeth.forEach(pTooth => {
    const visited = new Set<number>();
    const queue = [pTooth];
    let found = false;
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const n of getNeighbors(cur)) {
        if (supportingTeeth.includes(n)) { found = true; break; }
        if (ponticTeeth.includes(n) && !visited.has(n)) queue.push(n);
      }
      if (found) break;
    }
    if (!found) invalid.push(pTooth);
  });
  return invalid;
};

export default function App() {
  const { t, language } = useLanguage();

  // ── Auth ──────────────────────────────────────────────────
  const [currentLab, setCurrentLab] = useState<Lab | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Navigation ────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<
    'landing' | 'auth' | 'dashboard' | 'create-case' | 'view-pending-case' |
    'view-completed-case' | 'view-inprogress-case' | 'manage-account'
  >('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // ── Data ──────────────────────────────────────────────────
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // ── Case creation form ────────────────────────────────────
  const [activeTeeth, setActiveTeeth] = useState<number[]>([]);
  const [toothSelections, setToothSelections] = useState<Record<number, string[]>>({});
  const [patientName, setPatientName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Modals ────────────────────────────────────────────────
  const [showInsufficientUnitsModal, setShowInsufficientUnitsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showCGVModal, setShowCGVModal] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);

  // ── Dark mode ─────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('darkMode') ?? 'false'); } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem('darkMode', JSON.stringify(darkMode)); } catch {}
  }, [darkMode]);

  // ── Help modal (Navbar) ───────────────────────────────────
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSubject, setHelpSubject] = useState('');
  const [cart, setCart] = useState<{id: string, label: string, units: number, price: number, quantity: number}[]>([]);

  // ── Mr. Dent chatbot ──────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: MR_DENT_GREETING },
  ]);

  const handleMrDentSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: msg }];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const reply = await askMrDent(chatHistory, msg);
      setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Désolé, je suis momentanément indisponible.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Messages admin ────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // ── Check session on mount ────────────────────────────────
  useEffect(() => {
    // Vérifier la session existante
    getLabSession().then((lab) => {
      if (lab) {
        setCurrentLab(lab);
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      }
      setAuthChecking(false);
    });

    // Écouter les changements (login/logout)
    const unsub = onLabAuthChange((lab) => {
      setCurrentLab(lab);
      setIsAuthenticated(!!lab);
      if (!lab) {
        setCurrentPage('landing');
        setAuthChecking(false);
      }
    });
    return unsub;
  }, []);

  // ── Load cases when authenticated ─────────────────────────
  useEffect(() => {
    if (!currentLab) return;
    setLoadingCases(true);
    getCasesByLab(currentLab.id).then((data) => { setCases(data); setLoadingCases(false); });
    getMessages(currentLab.id).then(setMessages);

    const unsubCases = subscribeToCases(currentLab.id, setCases);
    const unsubMsgs = subscribeToMessages(currentLab.id, setMessages);
    return () => { unsubCases(); unsubMsgs(); };
  }, [currentLab]);

  // ── Handlers ──────────────────────────────────────────────
  const handleLogin = (lab: Lab) => {
    setCurrentLab(lab);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await logoutLab();
    setCurrentLab(null);
    setIsAuthenticated(false);
    setCases([]);
    setCurrentPage('landing');
  };

  const resetForm = () => {
    setActiveTeeth([]);
    setToothSelections({});
    setPatientName('');
    setFiles([]);
    setInstructions('');
    setLegalAccepted(false);
  };

  const selectedTeeth = Object.keys(toothSelections)
    .map(Number)
    .filter(n => (toothSelections[n]?.length ?? 0) > 0);

  const invalidTeeth = validatePontics(toothSelections);

  const totalCost = selectedTeeth.reduce((acc, num) => {
    const prostheses = toothSelections[num] ?? [];
    const hasOther = prostheses.some(id => id !== 'modeles');
    return acc + prostheses.reduce((pAcc, id) => {
      const base = PROSTHESIS_BASE_DATA.find(p => p.id === id);
      if (!base) return pAcc;
      return pAcc + (id === 'modeles' && hasOther ? 0 : base.cost);
    }, 0);
  }, 0);

  const handleToggleTooth = (num: number, event: React.MouseEvent) => {
    const isShift = event.shiftKey;
    if (isShift) {
      setActiveTeeth(prev => prev.includes(num) ? prev.filter(t => t !== num) : [...prev, num]);
    } else {
      setActiveTeeth([num]);
    }
    setToothSelections(prev => prev[num] ? prev : { ...prev, [num]: [] });
  };

  const handleToggleProsthesis = (id: string) => {
    if (activeTeeth.length === 0) return;
    setToothSelections(prev => {
      const updated = { ...prev };
      activeTeeth.forEach(tooth => {
        const current = updated[tooth] ?? [];
        updated[tooth] = current.includes(id) ? current.filter(p => p !== id) : [...current, id];
      });
      return updated;
    });
  };

  const handleSubmitCase = () => {
    if (invalidTeeth.length > 0) return;
    if (!currentLab) return;
    if (totalCost > (currentLab.units ?? 0)) {
      setShowInsufficientUnitsModal(true);
      return;
    }
    setShowLegalModal(true);
  };

  const processSubmission = async () => {
    if (!currentLab || !legalAccepted) return;
    setShowLegalModal(false);
    setSubmitting(true);

    const toothStr = selectedTeeth.sort((a, b) => a - b).join(', ');
    const typeStr = [...new Set(
      selectedTeeth.flatMap(t => (toothSelections[t] ?? []).map(id => {
        const base = PROSTHESIS_BASE_DATA.find(p => p.id === id);
        return base ? t(id as any) : id;
      }))
    )].join(', ');

    try {
      await createCase({
        lab_id: currentLab.id,
        patient: patientName,
        type: typeStr,
        tooth: toothStr,
        units: totalCost,
        instructions,
        files,
      });
      setSubmitting(false);
      setShowSuccessModal(true);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  const handleSendAdminMessage = async () => {
    if (!currentLab || !adminMessage.trim()) return;
    setSendingMsg(true);
    try {
      await sendMessageToAdmin(currentLab.id, adminMessage.trim());
      setAdminMessage('');
    } catch (e) { console.error(e); }
    finally { setSendingMsg(false); }
  };

  // ── Loading screen ────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // ── Page rendering ────────────────────────────────────────
  const renderPage = () => {
    if (!isAuthenticated) {
      if (currentPage === 'auth') {
        return (
          <AuthPage
            onLogin={handleLogin}
            initialMode={authMode}
            onShowCGV={() => setShowCGVModal(true)}
            onModeChange={setAuthMode}
          />
        );
      }
      return (
        <LandingPage
          onGetStarted={() => { setAuthMode('signup'); setCurrentPage('auth'); }}
          onLogin={() => { setAuthMode('login'); setCurrentPage('auth'); }}
          onContact={() => { setAuthMode('login'); setCurrentPage('auth'); }}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onCreateCase={() => setCurrentPage('create-case')}
            onCaseClick={(c) => { setSelectedCase(c); setCurrentPage(`view-${c.status === 'statusCompleted' ? 'completed' : c.status === 'statusInProgress' ? 'inprogress' : 'pending'}-case` as any); }}
            onBuyUnits={() => setShowBuyUnitsModal(true)}
            onOpenChat={() => setIsChatOpen(true)}
            availableUnits={currentLab?.units ?? 0}
            cases={cases}
          />
        );

      case 'create-case':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentPage('dashboard')} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-sm">
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('createNewCase')}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Patient */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{t('patientNameLabel')}</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t('patientNamePlaceholder')}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-100 transition-all" />
                </div>

                {/* Dental Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-6">{t('selectTeeth')}</h2>
                  <DentalChart selectedTeeth={selectedTeeth} activeTeeth={activeTeeth} invalidTeeth={invalidTeeth} toothSelections={toothSelections} onToggleTooth={handleToggleTooth} />
                </div>

                {/* Prosthesis */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-6">{t('selectProsthesisType')}</h2>
                  <ProsthesisSelector activeTeeth={activeTeeth} toothSelections={toothSelections} onToggle={handleToggleProsthesis} />
                </div>

                {/* Files */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-6">{t('uploadStl')}</h2>
                  <FileUpload files={files} onFilesChange={setFiles} />
                </div>

                {/* Instructions */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-6">{t('caseInstructions')}</h2>
                  <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t('placeholderInstructions')} rows={5}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-100 transition-all resize-none" />
                </div>
              </div>

              {/* Summary sidebar */}
              <div className="space-y-6">
                <CaseSummary selectedTeeth={selectedTeeth} toothSelections={toothSelections} invalidTeeth={invalidTeeth} />
                <button onClick={handleSubmitCase} disabled={submitting || selectedTeeth.length === 0 || invalidTeeth.length > 0 || !patientName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {submitting ? 'Envoi...' : t('submitCase')}
                </button>
              </div>
            </div>
          </div>
        );

      case 'view-pending-case':
      case 'view-completed-case':
      case 'view-inprogress-case':
        if (!selectedCase) return null;
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentPage('dashboard')} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-sm">
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{selectedCase.id}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedCase.status === 'statusCompleted' ? 'bg-emerald-50 text-emerald-600' :
                selectedCase.status === 'statusInProgress' ? 'bg-blue-50 text-blue-600' :
                'bg-amber-50 text-amber-600'}`}>
                {t(selectedCase.status as any)}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase">Détails du dossier</h2>
                {[
                  { label: 'Patient', value: selectedCase.patient },
                  { label: 'Type', value: selectedCase.type },
                  { label: 'Date', value: selectedCase.date },
                  { label: 'Dents', value: selectedCase.tooth },
                  { label: 'Unités', value: `${selectedCase.units} units` },
                ].map(({ label, value }) => value ? (
                  <div key={label}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
                  </div>
                ) : null)}
                {selectedCase.instructions && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instructions</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">"{selectedCase.instructions}"</p>
                  </div>
                )}
                {/* Files from admin */}
                {(selectedCase.files ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fichiers reçus</p>
                    {selectedCase.files!.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                        <Download size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Messagerie avec l'admin */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 flex flex-col">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase mb-6">Messagerie</h2>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-64">
                  {messages.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-8">Aucun message pour le moment.</p>
                  ) : messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'lab' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium ${
                        msg.sender === 'lab'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-sm'
                      }`}>
                        {msg.sender === 'admin' && <p className="text-[10px] font-bold text-slate-400 mb-1">Dental3Design</p>}
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                    placeholder="Écrire un message..."
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100" />
                  <button onClick={handleSendAdminMessage} disabled={sendingMsg || !adminMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                    {sendingMsg ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
      <Navbar
        onNavigate={(page) => setCurrentPage(page as any)}
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showHelpModal={showHelpModal}
        setShowHelpModal={setShowHelpModal}
        helpSubject={helpSubject}
        setHelpSubject={setHelpSubject}
        cart={cart}
        setCart={setCart}
        onCheckout={() => setShowBuyUnitsModal(true)}
        userData={{
          firstName: currentLab?.name?.split(' ')[0] ?? 'Mon',
          lastName: currentLab?.name?.split(' ').slice(1).join(' ') ?? 'Compte',
          email: currentLab?.email ?? '',
          companyName: currentLab?.name ?? '',
          siret: '',
          billingAddress: '',
          businessType: 'laboratoire',
        }}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </main>

      {/* Mr. Dent chatbot bubble */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-900 dark:bg-slate-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Mr. Dent</p>
                      <p className="text-[10px] text-slate-400">Assistant Dental3Design</p>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMrDentSend()}
                    placeholder="Posez votre question..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100" />
                  <button onClick={handleMrDentSend} disabled={chatLoading || !chatInput.trim()}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                    <Send size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bubble button */}
          <button onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all active:scale-95">
            {isChatOpen ? <X size={22} /> : <Bot size={22} />}
          </button>
        </div>
      )}

      {/* Buy Units Modal */}
      {showBuyUnitsModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowBuyUnitsModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('buyUnitsTitle')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Choisissez l'offre qui vous convient le mieux</p>
                </div>
                <button onClick={() => setShowBuyUnitsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                {[
                  { id: 'single', units: 1, price: 9.90, label: '1 UNIT', unitPrice: 9.90 },
                  { id: 'start', units: 10, price: 89.90, label: 'PACK START', unitPrice: 8.99, popular: true },
                  { id: 'lab', units: 50, price: 395, label: 'PACK LAB', unitPrice: 7.90 },
                  { id: 'pro', units: 100, price: 690, label: 'PACK PRO', unitPrice: 6.90 },
                ].map((offer) => (
                  <div
                    key={offer.id}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col justify-between ${
                      offer.popular
                        ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/20'
                        : 'border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => {
                      setCart(prev => {
                        const existing = prev.find(item => item.id === offer.id);
                        if (existing) return prev.map(item => item.id === offer.id ? { ...item, quantity: item.quantity + 1 } : item);
                        return [...prev, { id: offer.id, label: offer.label, units: offer.units, price: offer.price, quantity: 1 }];
                      });
                      setShowBuyUnitsModal(false);
                    }}
                  >
                    {offer.popular && (
                      <span className="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Populaire
                      </span>
                    )}
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">{offer.label}</h4>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{offer.units}</span>
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Units</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">{offer.price.toFixed(2)}€</span>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                          {t('unitPrice', { price: offer.unitPrice.toFixed(2) })}
                        </span>
                      </div>
                      <button className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                        offer.popular ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 dark:bg-slate-700 text-white'
                      }`}>
                        {t('buyNow')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Insufficient units modal */}
      {showInsufficientUnitsModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowInsufficientUnitsModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 pointer-events-auto text-center border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-amber-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('insufficientUnitsTitle')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">{t('insufficientUnitsMessage')}</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowInsufficientUnitsModal(false); setShowBuyUnitsModal(true); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                  <ShoppingCart size={18} />{t('buyMoreUnits')}
                </button>
                <button onClick={() => setShowInsufficientUnitsModal(false)}
                  className="w-full bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold">
                  {t('ok')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Legal modal */}
      {showLegalModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120]" />
          <div className="fixed inset-0 flex items-center justify-center z-[130] p-4 pointer-events-none">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Information Importante</h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  "Dental3Design fournit uniquement des prestations de conception numérique 3D pour dispositifs médicaux sur mesure. La responsabilité finale de la fabrication, de l'adaptation et de l'utilisation sur le patient incombe exclusivement au client."
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-8">
                <input type="checkbox" checked={legalAccepted} onChange={(e) => setLegalAccepted(e.target.checked)}
                  className="h-5 w-5 mt-0.5 cursor-pointer rounded border-slate-300 dark:border-slate-700" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Je confirme avoir pris connaissance de cette mention et j'accepte les{' '}
                  <button type="button" onClick={() => setShowCGVModal(true)} className="text-blue-600 font-bold hover:underline">CGV</button>.
                </span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => { setShowLegalModal(false); setLegalAccepted(false); }}
                  className="flex-1 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold">
                  {t('cancel')}
                </button>
                <button onClick={processSubmission} disabled={!legalAccepted}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 pointer-events-auto text-center border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-emerald-500" size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('caseSentTitle')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">{t('caseSentMessage')}</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => { resetForm(); setShowSuccessModal(false); setCurrentPage('create-case'); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
                  <Plus size={18} strokeWidth={3} />{t('createNewCase')}
                </button>
                <button onClick={() => { resetForm(); setShowSuccessModal(false); setCurrentPage('dashboard'); }}
                  className="w-full bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold">
                  {t('backToDashboard')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
