import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PROSTHESIS_BASE_DATA } from '../constants';

interface CaseSummaryProps {
  selectedTeeth: number[];
  toothSelections: Record<number, string[]>;
  invalidTeeth: number[];
}

export const CaseSummary: React.FC<CaseSummaryProps> = ({ selectedTeeth, toothSelections, invalidTeeth }) => {
  const { t } = useLanguage();
  
  const toothEntries = selectedTeeth
    .sort((a, b) => a - b)
    .map(num => ({
      number: num,
      prostheses: (toothSelections[num] || []).map(id => {
        const base = PROSTHESIS_BASE_DATA.find(p => p.id === id);
        if (!base) return null;
        return {
          ...base,
          label: t(base.id as any)
        };
      }).filter(Boolean) as { id: string; label: string; icon: React.ReactNode; cost: number }[]
    }));

  const totalCost = toothEntries.reduce((acc, entry) => {
    const hasOtherProsthesis = entry.prostheses.some(p => p.id !== 'modeles');
    return acc + entry.prostheses.reduce((pAcc, p) => {
      let cost = p.cost;
      if (p.id === 'modeles' && hasOtherProsthesis) {
        cost = 0;
      }
      return pAcc + cost;
    }, 0);
  }, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('caseSummary')}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
            {toothEntries.length} {t('teeth')}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        {toothEntries.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {toothEntries.map((entry) => {
              const hasOtherProsthesis = entry.prostheses.some(p => p.id !== 'modeles');
              return (
                <div key={entry.number} className="pb-4 border-b border-gray-50 dark:border-slate-800 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-1 rounded ${
                        invalidTeeth.includes(entry.number) 
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' 
                          : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      }`}>
                        {t('item')} {entry.number}
                      </span>
                      {invalidTeeth.includes(entry.number) && (
                        <AlertCircle size={14} className="text-red-500 dark:text-red-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                      {entry.prostheses.length} {t('items')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {entry.prostheses.length > 0 ? (
                      entry.prostheses.map((p) => {
                        let displayCost = p.cost;
                        if (p.id === 'modeles' && hasOtherProsthesis) {
                          displayCost = 0;
                        }
                        return (
                          <div key={p.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                              <span className="text-gray-400 dark:text-slate-500">{p.icon}</span>
                              <div className="flex flex-col">
                                <span>{p.label}</span>
                                {(p.id === 'wax_up' || p.id === 'barre') && (
                                  <span className="text-[9px] text-gray-400 dark:text-slate-500 italic font-normal lowercase">
                                    {p.id === 'wax_up' ? t('perTooth') : p.id === 'barre' ? t('perImplant') : t('perPilier')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-gray-500 dark:text-slate-400 font-bold text-xs">{displayCost} U</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-amber-500 dark:text-amber-400 italic font-medium">{t('noProsthesisSelected')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400 italic">{t('noTeethSelectedYet')}</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
          {invalidTeeth.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-800 dark:text-red-200 leading-tight">
                <span className="font-bold">{t('validationError')}:</span> {t('ponticRuleError')}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{t('totalCost')}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCost} Units</p>
          </div>
        </div>
      </div>
    </div>
  );
};
