import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface ToothProps {
  number: number;
  isSelected: boolean;
  isActive: boolean;
  isInvalid: boolean;
  hasProsthesis: boolean;
  onClick: (number: number, event: React.MouseEvent) => void;
}

const Tooth: React.FC<ToothProps> = ({ number, isSelected, isActive, isInvalid, hasProsthesis, onClick }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => onClick(number, e)}
      className={`relative w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
        isInvalid
          ? 'bg-red-50 dark:bg-red-900/20 border-red-500 shadow-lg shadow-red-100 dark:shadow-none ring-4 ring-red-500/10'
          : isActive
          ? 'bg-white dark:bg-slate-800 border-blue-600 shadow-lg shadow-blue-50 dark:shadow-none ring-4 ring-blue-600/10'
          : isSelected
          ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <span className={`text-xs font-black select-none ${
        isInvalid ? 'text-red-600 dark:text-red-400' : isActive ? 'text-blue-600 dark:text-blue-400' : isSelected ? 'text-blue-400 dark:text-blue-500' : 'text-gray-400 dark:text-slate-500'
      }`}>
        {number}
      </span>
      {hasProsthesis && (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full border border-white dark:border-slate-800 ${
          isInvalid ? 'bg-red-600 dark:bg-red-400' : isActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-blue-400 dark:bg-blue-500'
        }`} />
      )}
    </motion.button>
  );
};

interface DentalChartProps {
  selectedTeeth: number[];
  activeTeeth: number[];
  invalidTeeth: number[];
  toothSelections: Record<number, string[]>;
  onToggleTooth: (number: number, event: React.MouseEvent) => void;
}

export const DentalChart: React.FC<DentalChartProps> = ({ 
  selectedTeeth, 
  activeTeeth, 
  invalidTeeth,
  toothSelections, 
  onToggleTooth 
}) => {
  const { t } = useLanguage();
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      {/* Upper Jaw */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('upperJaw')}</span>
          <div className="h-px flex-1 mx-4 bg-gray-100 dark:bg-slate-800"></div>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
          {upperTeeth.map((num) => (
            <Tooth
              key={num}
              number={num}
              isSelected={selectedTeeth.includes(num)}
              isActive={activeTeeth.includes(num)}
              isInvalid={invalidTeeth.includes(num)}
              hasProsthesis={(toothSelections[num]?.length || 0) > 0}
              onClick={onToggleTooth}
            />
          ))}
        </div>
      </div>

      {/* Lower Jaw */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('lowerJaw')}</span>
          <div className="h-px flex-1 mx-4 bg-gray-100 dark:bg-slate-800"></div>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
          {lowerTeeth.map((num) => (
            <Tooth
              key={num}
              number={num}
              isSelected={selectedTeeth.includes(num)}
              isActive={activeTeeth.includes(num)}
              isInvalid={invalidTeeth.includes(num)}
              hasProsthesis={(toothSelections[num]?.length || 0) > 0}
              onClick={onToggleTooth}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
