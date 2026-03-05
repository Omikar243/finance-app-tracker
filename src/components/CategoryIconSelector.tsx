import React from 'react';
import * as Icons from 'lucide-react';

const AVAILABLE_ICONS = [
  'Home', 'Utensils', 'Car', 'Zap', 'Shield', 'Stethoscope', 'PiggyBank', 'User', 'Film', 'Banknote', 
  'ArrowRightLeft', 'HelpCircle', 'ShoppingBag', 'Coffee', 'Smartphone', 'Wifi', 'Plane', 'Gift', 
  'Briefcase', 'GraduationCap', 'Dumbbell', 'Music', 'Gamepad', 'Book', 'Heart', 'Sun', 'Moon', 'Cloud',
  'CreditCard', 'DollarSign', 'Euro', 'PoundSterling', 'IndianRupee', 'Bitcoin', 'Wallet', 'Landmark'
];

interface CategoryIconSelectorProps {
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
  onClose: () => void;
}

export function CategoryIconSelector({ onSelect, selectedIcon, onClose }: CategoryIconSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-md w-full m-4 border border-gray-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Icon</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Icons.X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
          {AVAILABLE_ICONS.map(iconName => {
            // @ts-ignore
            const IconComponent = Icons[iconName];
            if (!IconComponent) return null;
            
            return (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                  selectedIcon === iconName 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'
                }`}
                title={iconName}
              >
                <IconComponent size={24} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
