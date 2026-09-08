/**
 * OpsPilot AI - Create Order Modal
 * Section 8: Interactive order placement with dynamic ingredient consumption preview.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Layers,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { MenuItem, Ingredient, OrderItem } from '../types.js';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  onSubmitOrder: (items: OrderItem[], tableOrChannel: string) => Promise<void>;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  ingredients,
  onSubmitOrder,
}) => {
  const [selectedItems, setSelectedItems] = useState<{ menuItemId: string; quantity: number }[]>([
    { menuItemId: menuItems[0]?.id || 'menu-pbm', quantity: 1 },
  ]);
  const [tableOrChannel, setTableOrChannel] = useState('Dine-In Table 5');
  const [submitting, setSubmitting] = useState(false);

  // Real-time calculation of subtotal, tax, total
  const { orderItems, subtotal, tax, total, ingredientImpacts } = useMemo(() => {
    let sub = 0;
    const items: OrderItem[] = [];
    const consumptionMap = new Map<string, number>();

    for (const entry of selectedItems) {
      const menu = menuItems.find((m) => m.id === entry.menuItemId);
      if (!menu) continue;
      const lineTotal = menu.price * entry.quantity;
      sub += lineTotal;
      items.push({
        menuItemId: menu.id,
        menuItemName: menu.name,
        quantity: entry.quantity,
        unitPrice: menu.price,
        total: lineTotal,
      });

      // Accumulate recipe ingredients
      for (const recipeItem of menu.recipe) {
        const current = consumptionMap.get(recipeItem.ingredientId) || 0;
        consumptionMap.set(
          recipeItem.ingredientId,
          current + recipeItem.amount * entry.quantity
        );
      }
    }

    const tx = Math.round(sub * 0.05 * 100) / 100;
    const tot = Math.round((sub + tx) * 100) / 100;

    const impacts: { name: string; amount: string }[] = [];
    consumptionMap.forEach((amt, ingId) => {
      const ing = ingredients.find((i) => i.id === ingId);
      const name = ing ? ing.name.split(' ')[0] : ingId;
      const unit = ing ? ing.unit : 'kg';
      let formatted = '';
      if (unit === 'kg' && amt < 1.0) {
        formatted = `${Math.round(amt * 1000)}g`;
      } else if (unit === 'L' && amt < 1.0) {
        formatted = `${Math.round(amt * 1000)}ml`;
      } else {
        formatted = `${amt.toFixed(2)} ${unit}`;
      }
      impacts.push({ name, amount: formatted });
    });

    return {
      orderItems: items,
      subtotal: sub,
      tax: tx,
      total: tot,
      ingredientImpacts: impacts,
    };
  }, [selectedItems, menuItems, ingredients]);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setSelectedItems([...selectedItems, { menuItemId: menuItems[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length <= 1) return;
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const handleItemChange = (index: number, menuItemId: string) => {
    const updated = [...selectedItems];
    updated[index].menuItemId = menuItemId;
    setSelectedItems(updated);
  };

  const handleQuantityChange = (index: number, delta: number) => {
    const updated = [...selectedItems];
    const newQty = Math.max(1, updated[index].quantity + delta);
    updated[index].quantity = newQty;
    setSelectedItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;
    setSubmitting(true);
    try {
      await onSubmitOrder(orderItems, tableOrChannel);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Create Operational Order
              </h3>
              <p className="text-xs text-slate-500">
                Calculates real-time ingredient consumption & triggers AI risk telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Channel / Table Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Table / Ordering Channel
            </label>
            <select
              value={tableOrChannel}
              onChange={(e) => setTableOrChannel(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
            >
              <option value="Dine-In Table 1">Dine-In Table 1</option>
              <option value="Dine-In Table 3">Dine-In Table 3</option>
              <option value="Dine-In Table 5">Dine-In Table 5</option>
              <option value="Takeaway Counter #14">Takeaway Counter #14</option>
              <option value="Zomato Online">Zomato Online</option>
              <option value="Swiggy Online">Swiggy Online</option>
            </select>
          </div>

          {/* Selected Menu Items Rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Order Items & Servings
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedItems.map((entry, idx) => {
                const menuItem = menuItems.find((m) => m.id === entry.menuItemId);
                const isLimited = menuItem?.availabilityStatus === 'LIMITED';

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3"
                  >
                    {/* Item Select */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={entry.menuItemId}
                        onChange={(e) => handleItemChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                      >
                        {menuItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} — ₹{item.price}{' '}
                            {item.availabilityStatus === 'LIMITED'
                              ? '(⚠️ Limited by OpsPilot)'
                              : ''}
                          </option>
                        ))}
                      </select>

                      {isLimited && (
                        <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Limited dish: High paneer consumption
                        </div>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, -1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-slate-900 min-w-6 text-center">
                        {entry.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete row */}
                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Ingredient Consumption Preview */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Real-Time Recipe Consumption Preview
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredientImpacts.map((imp, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 rounded-md text-xs font-semibold text-indigo-950 shadow-2xs"
                >
                  <span>{imp.name}:</span>
                  <span className="text-rose-600">-{imp.amount}</span>
                </span>
              ))}
            </div>
            <div className="text-[11px] text-indigo-700/80 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Calculated deterministically using registered recipe ingredient weights.
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>GST / Taxes (5%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-bold text-base pt-1 border-t border-slate-100">
              <span>Order Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || orderItems.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              {submitting ? 'Placing & Analyzing...' : 'Confirm & Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
