import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PROSTHESIS_BASE_DATA } from '../constants';

export interface ProsthesisType {
  id: string;
  label: string;
  icon: React.ReactNode;
  cost: number;
}

interface ProsthesisSelectorProps {
  activeTeeth: number[];
  toothSelections: Record<number, string[]>;
  onToggle: (id: string) => void;
}

export const ProsthesisSelector: React.FC<ProsthesisSelectorProps> = ({ activeTeeth, toothSelections, onToggle }) => {
  const { t } = useLanguage();

  const PROSTHESIS_TYPES: ProsthesisType[] = PROSTHESIS_BASE_DATA.map(p => ({
    ...p,
    label: t(p.id as any)
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {PROSTHESIS_TYPES.map((type) => {
          const count = activeTeeth.filter(t => (toothSelections[t] || []).includes(type.id)).length;
          const isAll = activeTeeth.length > 0 && count === activeTeeth.length;
          const isSome = count > 0 && count < activeTeeth.length;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onToggle(type.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group relative ${
                isAll
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                  : isSome
                  ? 'bg-blue-50/30 border-blue-100 border-dashed'
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isAll ? 'bg-blue-600 text-white' : isSome ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}>
                {type.icon}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isAll ? 'text-blue-900' : isSome ? 'text-blue-700' : 'text-slate-700'}`}>
                  {type.label}
                </p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  {type.cost} Units
                  {(type.id === 'wax_up' || type.id === 'barre') && (
                    <span className="ml-1 lowercase italic opacity-70">
                      ({type.id === 'wax_up' ? t('perTooth') : type.id === 'barre' ? t('perImplant') : t('perPilier')})
                    </span>
                  )}
                </p>
              </div>
              {isSome && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Partially selected in group" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
