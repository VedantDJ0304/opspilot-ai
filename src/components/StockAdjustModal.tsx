/**
 * OpsPilot AI - Inventory Stock Adjustment / Physical Audit Dialog
 * Section 10: Distinguishes physical stock count vs estimated consumption.
 */

import React, { useState } from 'react';
import { X, Boxes, ShieldCheck, Scale, Truck, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types.js';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: InventoryItem | null;
  onAdjust: (payload: {
    ingredientId: string;
    delta?: number;
    newPhysicalStock?: number;
    type: string;
    note: string;
  }) => Promise<void>;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  inventoryItem,
  onAdjust,
}) => {
  const [mode, setMode] = useState<'DELIVERY' | 'PHYSICAL_COUNT' | 'WASTAGE'>('DELIVERY');
  const [value, setValue] = useState<string>('8.0');
  const [note, setNote] = useState<string>('Dairy supplier morning replenishment delivery');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !inventoryItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;

    setSubmitting(true);
    try {
      if (mode === 'PHYSICAL_COUNT') {
        await onAdjust({
          ingredientId: inventoryItem.ingredientId,
          newPhysicalStock: num,
          type: 'MANUAL_ADJUSTMENT',
          note: note || `Physical inventory count audit (${num} ${inventoryItem.unit})`,
        });
      } else if (mode === 'DELIVERY') {
        await onAdjust({
          ingredientId: inventoryItem.ingredientId,
          delta: num,
          type: 'PURCHASE',
          note: note || `Stock restock delivery (+${num} ${inventoryItem.unit})`,
        });
      } else {
        await onAdjust({
          ingredientId: inventoryItem.ingredientId,
          delta: -num,
          type: 'WASTAGE',
          note: note || `Kitchen wastage logged (-${num} ${inventoryItem.unit})`,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Update Stock: {inventoryItem.name}
              </h3>
              <p className="text-xs text-slate-500">
                Current Estimated: {inventoryItem.estimatedStock} {inventoryItem.unit} • Baseline: {inventoryItem.physicalBaselineStock} {inventoryItem.unit}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Type Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Operation Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('DELIVERY');
                  setValue('8.0');
                  setNote('Fresh delivery stock receipt');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'DELIVERY'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Delivery (+kg)
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('PHYSICAL_COUNT');
                  setValue(inventoryItem.estimatedStock.toString());
                  setNote('Staff physical stock weigh-in audit');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'PHYSICAL_COUNT'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Physical Audit
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('WASTAGE');
                  setValue('0.5');
                  setNote('Kitchen prep wastage / spoilage');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'WASTAGE'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Wastage (-kg)
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              {mode === 'PHYSICAL_COUNT'
                ? `New Absolute Physical Stock (${inventoryItem.unit})`
                : `Quantity to Add/Subtract (${inventoryItem.unit})`}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.05"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
              />
              <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">
                {inventoryItem.unit}
              </span>
            </div>
            {mode === 'DELIVERY' && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Tip: Adding +8.0 kg Paneer will replenish stock and trigger the AI Adaptation cycle!
              </p>
            )}
          </div>

          {/* Traceable note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Audit Note / Traceability Reference
            </label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {/* Explanatory badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Every transaction is logged in the permanent ledger. The deterministic risk engine will instantly re-evaluate runout curves and notify the AI agent.
            </span>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs"
            >
              {submitting ? 'Recording & Recomputing...' : 'Record Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
