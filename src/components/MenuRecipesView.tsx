/**
 * OpsPilot AI - Menu & Recipe Mapping View
 * Section 11 & 12: Menu catalogue with exact ingredient gram-level recipe linkages.
 */

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { MenuItem, Ingredient, MenuAvailability } from '../types.js';

interface MenuRecipesViewProps {
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  onToggleAvailability: (
    id: string,
    status: MenuAvailability,
    reason?: string
  ) => Promise<void>;
}

export const MenuRecipesView: React.FC<MenuRecipesViewProps> = ({
  menuItems,
  ingredients,
  onToggleAvailability,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Main Course', 'Starters', 'Rice & Biryani', 'Breads', 'Thalis'];

  const filteredItems = menuItems.filter(
    (m) => selectedCategory === 'ALL' || m.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Menu Items & Recipe Formulas
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Centralized ingredient-to-dish mapping. Powers deterministic inventory consumption.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Autonomous Guard Status:
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            Active Protection
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isLimited = item.availabilityStatus === 'LIMITED';
          const isDisabled = item.availabilityStatus === 'DISABLED';
          const isAvailable = item.availabilityStatus === 'AVAILABLE';

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                isLimited
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : isDisabled
                  ? 'border-slate-200 opacity-70 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Item Top Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-base font-black font-mono text-slate-900 shrink-0">
                    ₹{item.price}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mb-3">
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Available
                    </span>
                  )}
                  {isLimited && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Limited by OpsPilot
                    </span>
                  )}
                  {isDisabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <Lock className="w-3 h-3" />
                      Disabled
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.prepTimeMinutes}m prep
                  </span>
                </div>

                {/* Autonomous Guard Reason if Limited */}
                {isLimited && item.limitedReason && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed mb-3">
                    <strong>Autonomous Reason:</strong> {item.limitedReason}
                  </div>
                )}

                {/* Exact Recipe Formula */}
                <div className="border-t border-slate-100 pt-3 mt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    Recipe Ingredients (per serving)
                  </span>

                  <div className="space-y-1">
                    {item.recipe.map((rec, idx) => {
                      const ing = ingredients.find((i) => i.id === rec.ingredientId);
                      const name = ing ? ing.name : rec.ingredientId;
                      let formatted = '';
                      if (rec.unit === 'kg') {
                        formatted = `${Math.round(rec.amount * 1000)}g`;
                      } else if (rec.unit === 'L') {
                        formatted = `${Math.round(rec.amount * 1000)}ml`;
                      } else {
                        formatted = `${rec.amount} ${rec.unit}`;
                      }

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-slate-700 py-0.5"
                        >
                          <span className="truncate pr-2">{name}</span>
                          <span className="font-mono font-semibold text-slate-900 shrink-0">
                            {formatted}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Override Availability:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleAvailability(item.id, 'AVAILABLE')}
                    disabled={isAvailable}
                    className="px-2 py-1 rounded text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-40"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() =>
                      onToggleAvailability(
                        item.id,
                        'LIMITED',
                        'Manager manual operational throttle'
                      )
                    }
                    disabled={isLimited}
                    className="px-2 py-1 rounded text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 disabled:opacity-40"
                  >
                    Limit
                  </button>
                  <button
                    onClick={() =>
                      onToggleAvailability(
                        item.id,
                        'DISABLED',
                        'Temporarily taken off the menu'
                      )
                    }
                    disabled={isDisabled}
                    className="px-2 py-1 rounded text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-40"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
