import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DentalChart } from './components/DentalChart';
import { ProsthesisSelector } from './components/ProsthesisSelector';
import { FileUpload } from './components/FileUpload';
import { CaseSummary } from './components/CaseSummary';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { ChevronRight, Plus, Info, AlertTriangle, X, ShoppingCart, Check, HelpCircle, AlertCircle, ShieldAlert, FileText, Activity, Clock, Download, Trash2, MessageSquare, Send, CheckCircle, User, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './contexts/LanguageContext';
import { PROSTHESIS_BASE_DATA } from './constants';

const SUPPORTING_TYPES = ['crown', 'pilier', 'coping', 'inlay'];
const PONTIC_TYPES = ['pontic', 'reduced_pontic'];

const getNeighbors = (num: number): number[] => {
  const neighbors: number[] = [];
  if (num >= 11 && num <= 18) {
    if (num < 18) neighbors.push(num + 1);
    if (num > 11) neighbors.push(num - 1);
    if (num === 11) neighbors.push(21);
  } else if (num >= 21 && num <= 28) {
    if (num > 21) neighbors.push(num - 1);
    if (num < 28) neighbors.push(num + 1);
    if (num === 21) neighbors.push(11);
  } else if (num >= 31 && num <= 38) {
    if (num > 31) neighbors.push(num - 1);
    if (num < 38) neighbors.push(num + 1);
    if (num === 31) neighbors.push(41);
  } else if (num >= 41 && num <= 48) {
    if (num < 48) neighbors.push(num + 1);
    if (num > 41) neighbors.push(num - 1);
    if (num === 41) neighbors.push(31);
  }
  return neighbors;
};

const validatePontics = (selections: Record<number, string[]>) => {
  const allTeeth = Object.keys(selections).map(Number);
  const ponticTeeth = allTeeth.filter(t => (selections[t] || []).some(id => PONTIC_TYPES.includes(id)));
  const supportingTeeth = allTeeth.filter(t => (selections[t] || []).some(id => SUPPORTING_TYPES.includes(id)));
  
  const invalidPontics: number[] = [];
  
  ponticTeeth.forEach(pTooth => {
    const visited = new Set<number>();
    const queue = [pTooth];
    let foundSupport = false;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      
      const neighbors = getNeighbors(current);
      for (const n of neighbors) {
        if (supportingTeeth.includes(n)) {
          foundSupport = true;
          break;
        }
        if (ponticTeeth.includes(n) && !visited.has(n)) {
          queue.push(n);
        }
      }
      if (foundSupport) break;
    }
    
    if (!foundSupport) {
      invalidPontics.push(pTooth);
    }
  });
  
  return invalidPontics;
};

export default function App() {
  const { t, language } = useLanguage();
  const [activeTeeth, setActiveTeeth] = useState<number[]>([]);
  const [toothSelections, setToothSelections] = useState<Record<number, string[]>>({});
  const [patientName, setPatientName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [instructions, setInstructions] = useState('');
  const [availableUnits, setAvailableUnits] = useState(45);
  const [showInsufficientUnitsModal, setShowInsufficientUnitsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showCGVModal, setShowCGVModal] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBuyUnitsModal, setShowBuyUnitsModal] = useState(false);
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [cart, setCart] = useState<{id: string, label: string, units: number, price: number, quantity: number}[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard' | 'create-case' | 'view-pending-case' | 'view-completed-case' | 'view-inprogress-case' | 'manage-account'>('landing');
  const [userPhone, setUserPhone] = useState('01 23 45 67 89');
  const [userPassword, setUserPassword] = useState('••••••••');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  
  // User data
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Lab',
    email: 'contact@johnlab.com',
    companyName: 'John Dental Lab',
    siret: '12345678901234',
    billingAddress: '123 Rue de la Dent, 75000 Paris',
    businessType: 'laboratoire'
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSubject, setHelpSubject] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: t('chatInitialMessage') }
  ]);

  // Sync dark mode with document and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Update initial message when language changes if no user interaction yet
  useEffect(() => {
    if (chatHistory.length === 1 && chatHistory[0].role === 'bot') {
      setChatHistory([{ role: 'bot', text: t('chatInitialMessage') }]);
    }
  }, [language]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    // Mock bot response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'bot' as const, text: t('chatBotResponse') }]);
    }, 1000);
  };
  const [cases, setCases] = useState([
    { 
      id: 'CAS-2024-001', 
      patient: 'M. Durand', 
      type: 'Couronne Zircone', 
      status: 'statusInProgress', 
      date: '2024-03-10', 
      tooth: '26'
    },
    { 
      id: 'CAS-2024-002', 
      patient: 'Mme. Leroy', 
      type: 'Bridge 3 unités', 
      status: 'statusCompleted', 
      date: '2024-03-09', 
      tooth: '14, 15, 16'
    },
    { 
      id: 'CAS-2024-003', 
      patient: 'M. Petit', 
      type: 'Inlay Core', 
      status: 'statusPending', 
      date: '2024-03-08', 
      tooth: '11'
    },
    { 
      id: 'CAS-2024-004', 
      patient: 'Mme. Moreau', 
      type: 'Facette Emax', 
      status: 'statusCompleted', 
      date: '2024-03-07', 
      tooth: '21'
    },
    { 
      id: 'CAS-2024-005', 
      patient: 'M. Bernard', 
      type: 'Couronne sur Pilier', 
      status: 'statusInProgress', 
      date: '2024-03-06', 
      tooth: '46'
    },
  ]);

  // Derived: teeth that have at least one prosthesis
  const selectedTeeth = Object.keys(toothSelections)
    .map(Number)
    .filter(num => (toothSelections[num] || []).length > 0);

  const totalCost = selectedTeeth.reduce((acc, num) => {
    const selections = toothSelections[num] || [];
    const hasOtherProsthesis = selections.some(id => id !== 'modeles');
    
    const toothCost = selections.reduce((pAcc, id) => {
      const base = PROSTHESIS_BASE_DATA.find(p => p.id === id);
      let cost = base?.cost || 0;
      
      // 'modeles' costs 0 if another prosthesis is selected on the same tooth
      if (id === 'modeles' && hasOtherProsthesis) {
        cost = 0;
      }
      
      return pAcc + cost;
    }, 0);
    return acc + toothCost;
  }, 0);

  const invalidPontics = validatePontics(toothSelections);
  const isCaseValid = selectedTeeth.length > 0 && invalidPontics.length === 0;

  const handleCaseClick = (caseData: any) => {
    setSelectedCase(caseData);
    
    // Common state population for both pending and completed views
    setPatientName(caseData.patient || '');
    setInstructions(caseData.instructions || '');
    if (caseData.toothSelections) {
      setToothSelections(caseData.toothSelections);
    } else if (caseData.tooth) {
      const toothNum = parseInt(caseData.tooth);
      if (!isNaN(toothNum)) {
        setToothSelections({ [toothNum]: [caseData.type.toLowerCase().replace(/ /g, '_')] });
      }
    }

    if (caseData.status === 'statusPending') {
      setFiles([]); // Clear files for re-upload
      setCurrentPage('view-pending-case');
    } else if (caseData.status === 'statusCompleted') {
      setCurrentPage('view-completed-case');
    } else if (caseData.status === 'statusInProgress') {
      setCurrentPage('view-inprogress-case');
    } else {
      setShowCaseDetailsModal(true);
    }
  };

  const handleDeleteCase = () => {
    if (selectedCase) {
      setCases(prev => prev.filter(c => c && c.id !== selectedCase.id));
      setShowDeleteModal(false);
      setSelectedCase(null);
    }
  };

  const toggleTooth = (number: number, event: React.MouseEvent) => {
    const isMultiSelect = event.shiftKey || event.ctrlKey || event.metaKey;

    setActiveTeeth(prev => {
      if (isMultiSelect) {
        return prev.includes(number) 
          ? prev.filter(t => t !== number) 
          : [...prev, number];
      } else {
        // If it's already the only one selected, deselect it.
        // Otherwise, select only this one.
        if (prev.length === 1 && prev[0] === number) {
          return [];
        }
        return [number];
      }
    });
  };

  const toggleProsthesis = (prosthesisId: string) => {
    if (activeTeeth.length === 0) return;

    setToothSelections(prev => {
      const next = { ...prev };
      const allHaveIt = activeTeeth.every(t => (prev[t] || []).includes(prosthesisId));
      
      activeTeeth.forEach(t => {
        let current = next[t] || [];
        
        if (allHaveIt) {
          // Remove if all have it
          next[t] = current.filter(id => id !== prosthesisId);
        } else {
          // Add it
          if (!current.includes(prosthesisId)) {
            // Filter existing ones that are incompatible with the NEW one
            current = current.filter(existingId => {
              // Barre constraints: only with crown, coping, modeles
              if (prosthesisId === 'barre') return ['crown', 'coping', 'modeles'].includes(existingId);
              if (existingId === 'barre') return ['crown', 'coping', 'modeles'].includes(prosthesisId);
              
              // Wax-up constraints: only with smile_design, modeles, implant_planning
              if (prosthesisId === 'wax_up') return ['smile_design', 'modeles', 'implant_planning'].includes(existingId);
              if (existingId === 'wax_up') return ['smile_design', 'modeles', 'implant_planning'].includes(prosthesisId);
              
              // Smile Design constraints: only with modeles, wax_up
              if (prosthesisId === 'smile_design') return ['modeles', 'wax_up'].includes(existingId);
              if (existingId === 'smile_design') return ['modeles', 'wax_up'].includes(prosthesisId);

              // Surgical constraints: only with implant_planning, modeles
              if (prosthesisId === 'surgical') return ['implant_planning', 'modeles'].includes(existingId);
              if (existingId === 'surgical') return ['implant_planning', 'modeles'].includes(prosthesisId);
              
              // Pilier constraints: only with crown, coping
              if (prosthesisId === 'pilier') return ['crown', 'coping'].includes(existingId);
              if (existingId === 'pilier') return ['crown', 'coping'].includes(prosthesisId);
              
              // Mutual exclusion for core types (Crown, Coping, Implant, etc.)
              const coreTypes = ['crown', 'coping', 'implant', 'veneer', 'inlay', 'pontic', 'reduced_pontic', 'implant_planning', 'surgical', 'post_core'];
              if (coreTypes.includes(prosthesisId) && coreTypes.includes(existingId)) {
                // Exceptions:
                // 1. crown/coping can coexist with post_core
                if (prosthesisId === 'post_core' && ['crown', 'coping'].includes(existingId)) return true;
                if (existingId === 'post_core' && ['crown', 'coping'].includes(prosthesisId)) return true;
                
                // 2. implant can coexist with crown/coping
                if (prosthesisId === 'implant' && ['crown', 'coping'].includes(existingId)) return true;
                if (existingId === 'implant' && ['crown', 'coping'].includes(prosthesisId)) return true;
                
                // 3. surgical can coexist with implant_planning
                if (prosthesisId === 'surgical' && existingId === 'implant_planning') return true;
                if (existingId === 'surgical' && prosthesisId === 'implant_planning') return true;
                
                return false;
              }
              
              return true;
            });
            
            current = [...current, prosthesisId];
            next[t] = current;
          }
        }
      });
      
      return next;
    });
  };

  const clearSelection = () => {
    setActiveTeeth([]);
    setToothSelections({});
  };

  const resetForm = () => {
    clearSelection();
    setPatientName('');
    setFiles([]);
    setInstructions('');
    setShowSuccessModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check daily limit (4 cases per day)
    const today = new Date().toISOString().split('T')[0];
    const casesToday = cases.filter(c => c.date === today).length;
    
    if (casesToday >= 4) {
      setShowDailyLimitModal(true);
      return;
    }

    if (availableUnits < totalCost) {
      setShowInsufficientUnitsModal(true);
      return;
    }

    setShowLegalModal(true);
  };

  const processSubmission = () => {
    const newCase = {
      id: `CAS-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`,
      patient: patientName || 'Anonyme',
      type: selectedTeeth.length > 1 ? `Bridge ${selectedTeeth.length} unités` : t(toothSelections[selectedTeeth[0]][0] as any),
      status: 'statusWaiting',
      date: new Date().toISOString().split('T')[0],
      tooth: selectedTeeth.join(', '),
      instructions: instructions
    };

    setCases(prev => [newCase, ...prev]);
    setAvailableUnits(prev => prev - totalCost);
    setShowSuccessModal(true);
    setShowLegalModal(false);
    setLegalAccepted(false); // Reset checkbox for next time
    
    // Reset form
    setActiveTeeth([]);
    setToothSelections({});
    setPatientName('');
    setFiles([]);
    setInstructions('');
  };

  const handleBuyUnits = (units: number) => {
    setAvailableUnits(prev => prev + units);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: any) => {
    if (page === 'auth') {
      setAuthMode('login');
      // If we are already on auth page, we might need to force a reset or just rely on setAuthMode
    }
    setCurrentPage(page);
  };

  const handleUpdateFiles = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the case in local state
    if (selectedCase) {
      setCases(prev => prev.map(c => 
        c.id === selectedCase.id ? { ...c, instructions: instructions } : c
      ));
    }
    
    setShowSuccessModal(true);
    setTimeout(() => {
      setCurrentPage('dashboard');
      resetForm();
    }, 2000);
  };

  const handleDeleteAccount = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setShowDeleteAccountModal(false);
    alert(t('accountDeleted'));
  };

  const handleSavePhone = () => {
    setIsEditingPhone(false);
    alert(t('phoneChanged'));
  };

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      alert(t('passwordConfirmError') || 'Passwords do not match');
      return;
    }
    setIsEditingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert(t('passwordChanged'));
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      if (currentPage === 'auth') {
        return <AuthPage onLogin={(data) => {
          if (data) {
            setUserData(prev => ({ ...prev, ...data }));
          }
          handleLogin();
        }} initialMode={authMode} onModeChange={setAuthMode} onShowCGV={() => setShowCGVModal(true)} />;
      }
      return (
        <LandingPage 
          onGetStarted={() => {
            setAuthMode('signup');
            setCurrentPage('auth');
          }}
          onLogin={() => {
            setAuthMode('login');
            setCurrentPage('auth');
          }}
          onContact={() => {
            setHelpSubject(t('contactUs'));
            setShowHelpModal(true);
          }}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            onCreateCase={() => setCurrentPage('create-case')} 
            onCaseClick={handleCaseClick}
            onBuyUnits={() => setShowBuyUnitsModal(true)}
            onOpenChat={() => setIsChatOpen(true)}
            availableUnits={availableUnits} 
            cases={cases}
          />
        );
      case 'create-case':
        return (
          <>
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <nav className="flex items-center gap-2 text-base text-gray-500 dark:text-slate-400 mb-2">
                  <span 
                    className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    onClick={() => setCurrentPage('dashboard')}
                  >
                    {t('dashboard')}
                  </span>
                  <ChevronRight size={14} />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('createNewCase')}</span>
                </nav>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('createNewCase')}</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {/* Section 1: Teeth Selection */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {t('selectTeeth')}
                    </h2>
                    <button 
                      type="button"
                      onClick={clearSelection}
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 uppercase tracking-wider"
                    >
                      {t('clearSelection')}
                    </button>
                  </div>
                  <div onClick={(e) => {
                    // If clicking the background of the chart section, clear active teeth
                    if (e.target === e.currentTarget) setActiveTeeth([]);
                  }}>
                    <DentalChart 
                      selectedTeeth={selectedTeeth} 
                      activeTeeth={activeTeeth}
                      invalidTeeth={invalidPontics}
                      toothSelections={toothSelections}
                      onToggleTooth={toggleTooth} 
                    />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-4 italic">
                    * {t('toothSelectionHint')}
                  </p>
                </section>

                {/* Section 2: Prosthesis Type */}
                <section className={`bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-300 ${activeTeeth.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {t('selectProsthesisType')} {activeTeeth.length > 0 && (
                        <span className="text-blue-600 dark:text-blue-400 ml-2">
                          {activeTeeth.length === 1 
                            ? `${t('forTooth')} ${activeTeeth[0]}` 
                            : t('forTeeth', { count: activeTeeth.length })}
                        </span>
                      )}
                    </h2>
                    {activeTeeth.length === 0 && <span className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">{t('selectTeethFirst')}</span>}
                  </div>
                  <ProsthesisSelector 
                    activeTeeth={activeTeeth}
                    toothSelections={toothSelections}
                    onToggle={toggleProsthesis} 
                  />
                </section>

                {/* Section 3: STL File Upload */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('uploadStl')}</h2>
                  <FileUpload files={files} onFilesChange={setFiles} />
                </section>

                {/* Section 4: Patient Info */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('patientNameLabel')}</h2>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t('patientNamePlaceholder')}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                    required
                  />
                </section>

                {/* Section 5: Case Instructions */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('caseInstructions')}</h2>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t('placeholderInstructions')}
                    className="w-full min-h-[120px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none dark:text-slate-100"
                  />
                </section>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  {/* Units Available Card (Sticky) */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-colors duration-300">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('unitsAvailable')}</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{availableUnits}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowBuyUnitsModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      {t('buyMoreUnits')}
                    </button>
                  </div>

                  <CaseSummary 
                    selectedTeeth={selectedTeeth} 
                    toothSelections={toothSelections} 
                    invalidTeeth={invalidPontics}
                  />
                  
                  <button
                    type="submit"
                    disabled={!isCaseValid || files.length === 0 || !patientName.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Plus size={24} strokeWidth={3} />
                    {t('submitCase')}
                  </button>

                  {/* Chatbot Bubble */}
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-110 transition-all active:scale-95 group relative"
                      title="Assistant Mr.dent"
                    >
                      <MessageSquare size={28} />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    </button>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assistant Mr.dent</span>
                  </div>
                </div>
              </div>
            </form>
          </>
        );
      case 'view-pending-case':
        return (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  <span 
                    className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    onClick={() => setCurrentPage('dashboard')}
                  >
                    {t('dashboard')}
                  </span>
                  <ChevronRight size={14} />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('caseSummary')} - {selectedCase?.id}</span>
                </nav>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('caseSummary')}</h1>
                <p className="text-amber-600 dark:text-amber-500 font-bold text-base flex items-center gap-2">
                  <AlertCircle size={16} />
                  {t('pendingCaseEditNotice')}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateFiles} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {/* Section 1: Teeth Selection (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {t('selectTeeth')}
                    </h2>
                  </div>
                  <DentalChart 
                    selectedTeeth={selectedTeeth} 
                    activeTeeth={[]}
                    invalidTeeth={[]}
                    toothSelections={toothSelections}
                    onToggleTooth={() => {}} 
                  />
                </section>

                {/* Section 2: Prosthesis Type (Read-only) */}
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 opacity-75 pointer-events-none">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                      {t('selectProsthesisType')}
                    </h2>
                  </div>
                  <ProsthesisSelector 
                    activeTeeth={selectedTeeth}
                    toothSelections={toothSelections}
                    onToggle={() => {}} 
                  />
                </section>

                {/* Section 3: STL File Upload (Active) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 ring-2 ring-blue-500/20 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('uploadNewStl')}</h2>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">{t('actionRequired')}</span>
                  </div>
                  <FileUpload files={files} onFilesChange={setFiles} />
                </section>

                {/* Section 4: Patient Info (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('patientNameLabel')}</h2>
                  <input
                    type="text"
                    value={patientName}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base font-bold focus:outline-none dark:text-slate-100"
                  />
                </section>

                {/* Section 5: Case Instructions */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('caseInstructions')}</h2>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t('instructionsPlaceholder')}
                    className="w-full min-h-[120px] bg-gray-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none dark:text-slate-100"
                  />
                </section>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  <CaseSummary 
                    selectedTeeth={selectedTeeth} 
                    toothSelections={toothSelections} 
                    invalidTeeth={[]}
                  />
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Download size={24} strokeWidth={3} />
                    {t('updateCase')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <MessageSquare size={24} strokeWidth={3} />
                    {t('helpWithCase')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('dashboard')}
                    className="w-full bg-white border border-gray-200 text-gray-500 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="rotate-180" size={18} />
                    {t('backToDashboard')}
                  </button>
                </div>
              </div>
            </form>
          </>
        );
      case 'view-completed-case':
        return (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  <span 
                    className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    onClick={() => setCurrentPage('dashboard')}
                  >
                    {t('dashboard')}
                  </span>
                  <ChevronRight size={14} />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('caseSummary')} - {selectedCase?.id}</span>
                </nav>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('caseSummary')}</h1>
                <p className="text-green-600 dark:text-green-500 font-bold text-base flex items-center gap-2">
                  <CheckCircle size={16} />
                  {t('statusCompleted')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {/* Section 1: Teeth Selection (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {t('selectTeeth')}
                    </h2>
                  </div>
                  <DentalChart 
                    selectedTeeth={selectedTeeth} 
                    activeTeeth={[]}
                    invalidTeeth={[]}
                    toothSelections={toothSelections}
                    onToggleTooth={() => {}} 
                  />
                </section>

                {/* Section 2: Prosthesis Type (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {t('selectProsthesisType')}
                    </h2>
                  </div>
                  <ProsthesisSelector 
                    activeTeeth={selectedTeeth}
                    toothSelections={toothSelections}
                    onToggle={() => {}} 
                  />
                </section>

                {/* Section 3: Patient Info (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('patientNameLabel')}</h2>
                  <input
                    type="text"
                    value={patientName}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base font-bold focus:outline-none dark:text-slate-100"
                  />
                </section>

                {/* Section 4: Case Instructions (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('caseInstructions')}</h2>
                  <textarea
                    value={instructions}
                    readOnly
                    className="w-full min-h-[120px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base focus:outline-none resize-none dark:text-slate-100"
                  />
                </section>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  <CaseSummary 
                    selectedTeeth={selectedTeeth} 
                    toothSelections={toothSelections} 
                    invalidTeeth={[]}
                  />
                  
                  <button
                    type="button"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Download size={24} strokeWidth={3} />
                    {t('downloadFiles')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <MessageSquare size={24} strokeWidth={3} />
                    {t('helpWithCase')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('dashboard')}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="rotate-180" size={18} />
                    {t('backToDashboard')}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      case 'view-inprogress-case':
        return (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  <span 
                    className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    onClick={() => setCurrentPage('dashboard')}
                  >
                    {t('dashboard')}
                  </span>
                  <ChevronRight size={14} />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{t('caseSummary')} - {selectedCase?.id}</span>
                </nav>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('caseSummary')}</h1>
                <p className="text-blue-600 dark:text-blue-500 font-bold text-base flex items-center gap-2">
                  <Clock size={16} />
                  {t('statusInProgress')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {/* Section 1: Teeth Selection (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {t('selectTeeth')}
                    </h2>
                  </div>
                  <DentalChart 
                    selectedTeeth={selectedTeeth} 
                    activeTeeth={[]}
                    invalidTeeth={[]}
                    toothSelections={toothSelections}
                    onToggleTooth={() => {}} 
                  />
                </section>

                {/* Section 2: Prosthesis Type (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {t('selectProsthesisType')}
                    </h2>
                  </div>
                  <ProsthesisSelector 
                    activeTeeth={selectedTeeth}
                    toothSelections={toothSelections}
                    onToggle={() => {}} 
                  />
                </section>

                {/* Section 3: Patient Info (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('patientNameLabel')}</h2>
                  <input
                    type="text"
                    value={patientName}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base font-bold focus:outline-none dark:text-slate-100"
                  />
                </section>

                {/* Section 4: Case Instructions (Read-only) */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 opacity-75 pointer-events-none transition-colors duration-300">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('caseInstructions')}</h2>
                  <textarea
                    value={instructions}
                    readOnly
                    className="w-full min-h-[120px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-base focus:outline-none resize-none dark:text-slate-100"
                  />
                </section>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  <CaseSummary 
                    selectedTeeth={selectedTeeth} 
                    toothSelections={toothSelections} 
                    invalidTeeth={[]}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <MessageSquare size={24} strokeWidth={3} />
                    {t('helpWithCase')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('dashboard')}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="rotate-180" size={18} />
                    {t('backToDashboard')}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      case 'manage-account':
        return (
          <div className="w-full">
            <div className="mb-8">
              <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                <span 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  onClick={() => setCurrentPage('dashboard')}
                >
                  {t('dashboard')}
                </span>
                <ChevronRight size={14} />
                <span className="font-medium text-slate-900 dark:text-slate-100">{t('manageAccount')}</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('manageAccount')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 text-center sticky top-24 transition-colors duration-300">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-3xl mx-auto mb-4">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{userData.firstName} {userData.lastName}</h2>
                  <p className="text-base text-gray-500 dark:text-slate-400 mb-2">{userData.email}</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {userData.businessType === 'cabinet' ? 'Cabinet Dentaire' : 'Laboratoire'}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                    {t('profileSummary')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('firstName')}</label>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{userData.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('lastName')}</label>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{userData.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('companyName')}</label>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{userData.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('siret')}</label>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{userData.siret}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('billingAddress')}</label>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{userData.billingAddress}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('email')}</label>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{userData.email}</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-gray-50 dark:border-slate-800">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {t('phoneNumber')}
                        </label>
                        {!isEditingPhone && (
                          <button 
                            onClick={() => setIsEditingPhone(true)}
                            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <Edit size={14} />
                            {t('edit')}
                          </button>
                        )}
                      </div>
                      {isEditingPhone ? (
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-base font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-slate-100"
                          />
                          <button 
                            onClick={handleSavePhone}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm"
                          >
                            {t('confirm')}
                          </button>
                          <button 
                            onClick={() => setIsEditingPhone(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl font-bold text-sm"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      ) : (
                        <p className="text-base font-bold text-slate-900 dark:text-slate-100 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent">{userPhone}</p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {t('password')}
                        </label>
                        {!isEditingPassword && (
                          <button 
                            onClick={() => setIsEditingPassword(true)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            <Edit size={14} />
                            {t('edit')}
                          </button>
                        )}
                      </div>
                      {isEditingPassword ? (
                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('oldPassword')}</label>
                            <input
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('newPassword')}</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('confirmNewPassword')}</label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={handleSavePassword}
                              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20"
                            >
                              {t('confirm')}
                            </button>
                            <button 
                              onClick={() => setIsEditingPassword(false)}
                              className="flex-1 py-3 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-100 dark:border-slate-600 rounded-xl font-bold text-xs"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent">••••••••</p>
                      )}
                    </div>
                  </div>
                </section>

                <div className="pt-12 flex justify-center">
                  <button 
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="text-[10px] font-bold text-gray-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-500 transition-colors uppercase tracking-widest underline underline-offset-4"
                  >
                    {t('deleteAccount')}
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteAccountModal && (
              <>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowDeleteAccountModal(false)}></div>
                <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
                  <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-gray-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mb-6">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('deleteAccount')}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
                      {t('deleteAccountConfirm')}
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteAccountModal(false)}
                        className="flex-1 px-6 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
                      >
                        {t('cancel')}
                      </button>
                      <button 
                        onClick={handleDeleteAccount}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                      >
                        {t('confirm')}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        showHelpModal={showHelpModal}
        setShowHelpModal={setShowHelpModal}
        helpSubject={helpSubject}
        setHelpSubject={setHelpSubject}
        cart={cart}
        setCart={setCart}
        onCheckout={handleBuyUnits}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userData={userData}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="w-full px-6 py-8 transition-all duration-300">
        {renderContent()}
        {/* Chat Window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-8 right-8 w-80 md:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col z-50 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Assistant Mr.dent</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-[10px] text-blue-100 uppercase font-bold tracking-wider">En ligne</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center gap-2">
                  <input 
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <p>{t('footerCopyright')}</p>
          <span className="hidden md:block text-slate-200 dark:text-slate-800">•</span>
          <button 
            onClick={() => setShowCGVModal(true)}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors"
          >
            Conditions Générales de Vente (CGV)
          </button>
        </div>
      </footer>

      {/* CGV Modal */}
      {showCGVModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] animate-in fade-in duration-300" onClick={() => setShowCGVModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[210] p-4 pointer-events-none">
            <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Conditions Générales de Vente</h3>
                </div>
                <button onClick={() => setShowCGVModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Conditions Générales de Vente – Dental3Design (EI Volberg)</h4>
                  
                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">1. Objet</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Les présentes Conditions Générales de Vente (CGV) régissent les prestations de conception numérique 3D de prothèses dentaires et dispositifs médicaux sur mesure fournies par Dental3Design, micro-entreprise EI Volberg.<br/>
                      Le client déclare avoir pris connaissance et accepter intégralement ces CGV avant tout achat d’unités ou utilisation du service.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">2. Nature des prestations</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dental3Design fournit uniquement des fichiers de conception 3D destinés à la fabrication de dispositifs médicaux sur mesure.<br/>
                      Le service ne comprend ni fabrication, ni pose, ni prescription médicale, ni contrôle clinique.<br/>
                      Toute utilisation des fichiers conçus est sous la responsabilité exclusive du client, qu’il soit laboratoire ou cabinet dentaire.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">3. Achat et utilisation des unités</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Les prestations sont réglées via des unités achetées à l’avance sur le site.<br/>
                      Chaque prestation a un coût défini en unités.<br/>
                      Les unités sont non remboursables et non transférables.<br/>
                      Les unités expirent 12 mois après leur achat.<br/>
                      Le solde d’unités est automatiquement déduit lors de la commande.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">4. Délais de traitement</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Les prestations sont effectuées sous 4 jours ouvrés après confirmation de commande, hors week-ends et jours fériés.<br/>
                      Les délais peuvent être prolongés si les informations fournies par le client sont incomplètes ou incorrectes.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">5. Responsabilité et limitation</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dental3Design décline toute responsabilité pour :<br/>
                      - Tout dommage, accident ou incident lié à l’utilisation des dispositifs fabriqués à partir des fichiers 3D.<br/>
                      - Toute erreur ou imperfection dans le dispositif final.<br/>
                      - Tout défaut d’adaptation ou d’innocuité du dispositif sur le patient.<br/>
                      Les prestations sont fournies “en l’état” sans garantie d’aucune sorte, qu’elle soit expresse ou implicite.<br/>
                      Le client est seul responsable de :<br/>
                      - Vérifier, valider et contrôler les fichiers avant fabrication.<br/>
                      - La fabrication, l’adaptation, l’utilisation et la mise en œuvre des dispositifs médicaux.<br/>
                      - Le respect de toutes les réglementations locales et normes applicables aux dispositifs médicaux.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">6. Obligations du client</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      - Fournir toutes les informations nécessaires (scans, mesures, documents) pour permettre la conception.<br/>
                      - Respecter les normes médicales et réglementations applicables.<br/>
                      - S’assurer que le dispositif final est sûr et adapté à l’usage prévu.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">7. Propriété intellectuelle</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Tous les fichiers 3D, algorithmes et conceptions restent propriété exclusive de Dental3Design.<br/>
                      Le client reçoit un droit limité et non transférable d’usage des fichiers uniquement pour la fabrication du dispositif correspondant.<br/>
                      Toute reproduction, diffusion ou utilisation commerciale des fichiers sans autorisation est strictement interdite.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">8. Exclusion de garantie</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dental3Design ne garantit pas :<br/>
                      - La conformité des fichiers aux normes médicales.<br/>
                      - La compatibilité, sécurité ou efficacité des dispositifs fabriqués.<br/>
                      - L’absence d’erreurs, omissions ou défauts dans les fichiers fournis.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">9. Force majeure</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dental3Design ne peut être tenu responsable en cas d’inexécution partielle ou totale de ses obligations en cas de force majeure (grèves, catastrophes naturelles, problèmes techniques, pandémie, etc.).
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">10. Modification des CGV</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dental3Design se réserve le droit de modifier les CGV à tout moment.<br/>
                      Les nouvelles CGV s’appliquent aux commandes passées après leur publication sur le site.
                    </p>
                  </section>

                  <section className="mb-6">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">11. Loi applicable et juridiction</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Les présentes CGV sont régies par la loi française.<br/>
                      Tout litige relatif à l’interprétation ou l’exécution des CGV sera de la compétence exclusive des tribunaux français compétents du siège social de EI Volberg.
                    </p>
                  </section>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <button
                  onClick={() => setShowCGVModal(false)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Case Details Modal */}
      {showCaseDetailsModal && selectedCase && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowCaseDetailsModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedCase.status === 'statusCompleted' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' :
                      selectedCase.status === 'statusInProgress' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' :
                      selectedCase.status === 'statusWaiting' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                      'bg-amber-50 dark:bg-amber-900/30 text-amber-500'
                    }`}>
                      <Info size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedCase.id}</h3>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedCase.patient}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCaseDetailsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedCase.status === 'statusCompleted' && (
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95">
                      <Download size={20} />
                      {t('downloadFiles')}
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setHelpSubject(`${t('helpWithCase')} ${selectedCase.id}`);
                      setShowHelpModal(true);
                      setShowCaseDetailsModal(false);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <HelpCircle size={20} />
                    {t('helpTitle')}
                  </button>

                  {selectedCase.status === 'statusPending' && (
                    <button 
                      onClick={() => {
                        setShowDeleteModal(true);
                        setShowCaseDetailsModal(false);
                      }}
                      className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trash2 size={20} />
                      {t('deleteCase')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Case Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 dark:text-red-400">
                  <AlertTriangle size={28} />
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setHelpSubject(`${t('helpWithCase')} ${selectedCase?.id}`);
                    setShowHelpModal(true);
                    setShowDeleteModal(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                >
                  <HelpCircle size={18} />
                  {t('helpTitle')}
                </button>
                <button
                  onClick={handleDeleteCase}
                  className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {t('deleteCase')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Buy Units Modal */}
      {showBuyUnitsModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowBuyUnitsModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
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
                        if (existing) {
                          return prev.map(item => 
                            item.id === offer.id 
                              ? { ...item, quantity: item.quantity + 1 } 
                              : item
                          );
                        }
                        return [...prev, {
                          id: offer.id,
                          label: offer.label,
                          units: offer.units,
                          price: offer.price,
                          quantity: 1
                        }];
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
                        offer.popular 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-900 dark:bg-slate-700 text-white'
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

      {/* Insufficient Units Modal */}
      {showInsufficientUnitsModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowInsufficientUnitsModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <AlertTriangle size={28} />
                </div>
                <button onClick={() => setShowInsufficientUnitsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('insufficientUnitsTitle')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                {t('insufficientUnitsMessage')}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowInsufficientUnitsModal(false);
                    setShowBuyUnitsModal(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                >
                  <ShoppingCart size={18} />
                  {t('buyMoreUnits')}
                </button>
                <button
                  onClick={() => setShowInsufficientUnitsModal(false)}
                  className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                >
                  {t('ok')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Legal Disclaimer Modal */}
      {showLegalModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] animate-in fade-in duration-300"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[130] p-4 pointer-events-none">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <ShieldAlert size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Information Importante</h3>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    "Dental3Design fournit uniquement des prestations de conception numérique 3D pour dispositifs médicaux sur mesure. La responsabilité finale de la fabrication, de l’adaptation et de l’utilisation sur le patient incombe exclusivement au client."
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group mb-8">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-700 transition-all checked:border-blue-600 checked:bg-blue-600"
                      checked={legalAccepted}
                      onChange={(e) => setLegalAccepted(e.target.checked)}
                    />
                    <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 select-none group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    Je confirme avoir pris connaissance de cette mention et j'accepte les <button type="button" onClick={() => setShowCGVModal(true)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Conditions Générales de Vente (CGV)</button>.
                  </span>
                </label>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowLegalModal(false);
                      setLegalAccepted(false);
                    }}
                    className="flex-1 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={processSubmission}
                    disabled={!legalAccepted}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Daily Limit Reached Modal */}
      {showDailyLimitModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto text-center border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <ShieldAlert size={32} strokeWidth={3} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('dailyLimitReachedTitle')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
                {t('dailyLimitReachedMessage')}
              </p>
              
              <button
                onClick={() => setShowDailyLimitModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
              >
                {t('ok')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"></div>
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                  <Check size={32} strokeWidth={3} />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('caseSentTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {t('caseSentMessage')}
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setCurrentPage('create-case');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <Plus size={18} strokeWidth={3} />
                  {t('createNewCase')}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setCurrentPage('dashboard');
                  }}
                  className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                >
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
