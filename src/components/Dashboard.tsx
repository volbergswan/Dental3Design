import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  LayoutGrid,
  FileText,
  Activity,
  ArrowUpDown,
  X,
  MessagesSquare,
  Send,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onCreateCase: () => void;
  onCaseClick: (caseData: any) => void;
  onBuyUnits: () => void;
  onOpenChat: (type?: 'bot' | 'admin') => void;
  availableUnits: number;
  cases: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateCase, onCaseClick, onBuyUnits, onOpenChat, availableUnits, cases }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const pricingData = [
    { type: 'crown', units: 1 },
    { type: 'pontic', units: 1 },
    { type: 'pilier', units: 1.5 },
    { type: 'veneer', units: 1 },
    { type: 'inlay', units: 1 },
    { type: 'post_core', units: 1 },
    { type: 'coping', units: 1 },
    { type: 'reduced_pontic', units: 1 },
    { type: 'implant_planning', units: 9 },
    { type: 'surgical', units: 6 },
    { type: 'modeles', units: 0.5 },
    { type: 'wax_up', units: 0.5 },
    { type: 'smile_design', units: 1 },
    { type: 'barre', units: 1.5 },
  ];

  const stats = [
    { 
      label: t('statWaiting'), 
      value: cases.filter(c => c.status === 'statusWaiting').length.toString(), 
      icon: <Minus className="text-slate-400 dark:text-slate-500" strokeWidth={4} />, 
      color: 'bg-slate-50 dark:bg-slate-800/50' 
    },
    { 
      label: t('statPending'), 
      value: cases.filter(c => c.status === 'statusPending').length.toString(), 
      icon: <AlertCircle className="text-amber-500 dark:text-amber-400" />, 
      color: 'bg-amber-50 dark:bg-amber-900/20' 
    },
    { 
      label: t('statInProgress'), 
      value: cases.filter(c => c.status === 'statusInProgress').length.toString(), 
      icon: <Clock className="text-blue-500 dark:text-blue-400" />, 
      color: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      label: t('statCompleted'), 
      value: cases.filter(c => c.status === 'statusCompleted').length.toString(), 
      icon: <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" />, 
      color: 'bg-emerald-50 dark:bg-emerald-900/20' 
    },
  ];

  const filteredAndSortedCases = useMemo(() => {
    let result = cases.filter(c => {
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(query) ||
          c.patient.toLowerCase().includes(query) ||
          c.date.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [searchQuery, statusFilter, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">{t('dashboard')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('welcomeMessage')}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Recent Cases List */}
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-2xl ${stat.color} dark:bg-slate-800`}>
                    {React.cloneElement(stat.icon as React.ReactElement, { size: 20 })}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Create Case */}
            <button 
              onClick={onCreateCase}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-3xl font-bold transition-all shadow-lg shadow-blue-500/20 flex flex-col items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={24} />
              <span className="text-xs uppercase tracking-widest">{t('createNewCase')}</span>
            </button>

            {/* Units Balance */}
            <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-lg shadow-slate-900/20 flex flex-col items-center justify-center gap-1 relative overflow-hidden group">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{t('unitsAvailable')}</span>
              <span className="text-2xl font-black relative z-10">{availableUnits}</span>
              <button 
                onClick={onBuyUnits}
                className="text-base font-bold bg-white text-slate-900 px-5 py-2.5 rounded-xl mt-1 relative z-10 hover:bg-blue-50 transition-colors"
              >
                {t('buyMoreUnits')}
              </button>
              <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-blue-600/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            </div>

            {/* Pricing */}
            <button 
              onClick={() => setShowPricingModal(true)}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <FileText size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{t('pricingLabel')}</span>
            </button>

            {/* Messaging */}
            <button 
              onClick={() => onOpenChat('admin')}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 group relative"
            >
              <MessagesSquare size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight text-center leading-tight px-1">{t('adminMessaging')}</span>
              <span className="absolute top-3 right-8 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{t('myCasesTitle')}</h2>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 rounded-xl">
                <AlertCircle size={14} className="text-amber-600 dark:text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-tight">
                  {t('dailyLimitAlert')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="relative flex items-center"
                  >
                    <input 
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
                    />
                    <button 
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="absolute right-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Search size={18} />
                  </button>
                )}
              </AnimatePresence>

              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-2 rounded-lg transition-colors ${isFilterOpen || statusFilter !== 'all' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                >
                  <Filter size={18} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-2 z-30"
                      >
                        {['all', 'statusWaiting', 'statusPending', 'statusInProgress', 'statusCompleted'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-xl text-base font-medium transition-colors ${statusFilter === status ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            {status === 'all' ? t('all') : t(status as any)}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <div className="overflow-auto max-h-[480px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('tableHeaderId')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('tableHeaderPatient')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    <button 
                      onClick={toggleSort}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                      {t('tableHeaderDate')}
                      <ArrowUpDown size={12} className={`transition-opacity ${sortOrder !== 'desc' ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('tableHeaderStatus')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filteredAndSortedCases.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => onCaseClick(c)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">{c.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-medium text-slate-700 dark:text-slate-300">{c.patient}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-medium text-slate-700 dark:text-slate-300">{c.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        c.status === 'statusCompleted' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        c.status === 'statusInProgress' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        c.status === 'statusWaiting' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
                        'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {t(c.status as any)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-300 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedCases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic text-sm">
                      Aucun cas ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* Pricing Modal */}
      <AnimatePresence>
        {showPricingModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
              onClick={() => setShowPricingModal(false)}
            ></motion.div>
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800"
              >
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{t('pricingLabel')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Grille tarifaire par type de prothèse (en units)</p>
                  </div>
                  <button 
                    onClick={() => setShowPricingModal(false)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pricingData.map((item) => (
                      <div 
                        key={item.type}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all group"
                      >
                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 pr-4 leading-tight flex-1">
                          {(() => {
                            const label = t(item.type as any);
                            const parts = label.split('(');
                            if (parts.length > 1) {
                              return (
                                <>
                                  {parts[0]}
                                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-500 block sm:inline">({parts[1]}</span>
                                </>
                              );
                            }
                            return label;
                          })()}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                            {item.units.toLocaleString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}
                          </span>
                          <div className="flex flex-col items-start -space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Units</span>
                            {(item.type === 'wax_up' || item.type === 'barre') && (
                              <span className="text-[9px] font-bold text-slate-400/80 dark:text-slate-500/80 lowercase italic">
                                {item.type === 'wax_up' ? t('perTooth') : item.type === 'barre' ? t('perImplant') : t('perPilier')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 border-t border-gray-100 dark:border-slate-800 shrink-0">
                  <button 
                    onClick={() => setShowPricingModal(false)}
                    className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors active:scale-[0.98]"
                  >
                    {t('ok')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
