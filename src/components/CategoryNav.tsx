'use client';

import React from 'react';
import { Sparkles, Gamepad2, Layers, CreditCard, Radio, Key } from 'lucide-react';
import { CATEGORIES_LIST } from '@/data/catalog';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  Key: <Key className="w-4 h-4" />,
};

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {CATEGORIES_LIST.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 scale-[1.02]'
                  : 'bg-[#141e34] hover:bg-[#1a2744] text-slate-300 border border-white/5 hover:border-white/10'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-indigo-400'}>
                {ICON_MAP[cat.icon] || <Sparkles className="w-4 h-4" />}
              </span>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
