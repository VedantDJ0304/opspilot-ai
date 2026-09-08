/**
 * OpsPilot AI - Inventory Command & Risk View
 * Section 9 & 10 & 29: Physical vs Estimated inventory, runout forecasts, and complete traceable audit log.
 */

import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Scale,
  Clock,
  TrendingDown,
  History,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { InventoryItem, InventoryTransaction, Ingredient } from '../types.js';

interface InventoryViewProps {
  inventory: InventoryItem[];
  ingredients: Ingredient[];
  transactions: InventoryTransaction[];
  onOpenAdjust: (ingredientId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  ingredients,
  transactions,
  onOpenAdjust,
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'TRANSACTIONS'>('ITEMS');

  const criticalCount = inventory.filter((i) => i.riskLevel === 'CRITICAL').length;
  const warningCount = inventory.filter((i) => i.riskLevel === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Consumption Velocity
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Physical stock baselines, real-time estimated depletion, and deterministic runout curves.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ITEMS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'ITEMS'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Inventory Table
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Ledger ({transactions.length})
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Tracked Ingredients
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {inventory.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">100% recipe mapped</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Critical Risk
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              criticalCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
            {criticalCount > 0 ? 'Paneer stockout imminent' : 'None active'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Elevated Warning
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {warningCount}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
            Tomato & Cream elevated
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Ledger Audit Count
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {transactions.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Gram-level traceable
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'ITEMS' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Deterministic Stock & Runout Projections
            </span>
            <span className="text-xs text-slate-500">
              Updated on every order placement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40">
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">Estimated Stock</th>
                  <th className="py-3 px-4">Physical Baseline</th>
                  <th className="py-3 px-4">Burn Rate</th>
                  <th className="py-3 px-4">Normal Rate</th>
                  <th className="py-3 px-4">Operational Risk</th>
                  <th className="py-3 px-4">Est. Runout</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {inventory.map((item) => {
                  const isCrit = item.riskLevel === 'CRITICAL';
                  const isWarn = item.riskLevel === 'WARNING';
                  const rateFactor = (item.consumptionRatePerHour / item.normalRatePerHour).toFixed(1);

                  return (
                    <tr
                      key={item.ingredientId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCrit ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Last physical count: {item.lastCountAt}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className={isCrit ? 'text-rose-600 font-extrabold' : ''}>
                          {item.estimatedStock} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="font-mono">{item.physicalBaselineStock} {item.unit}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {item.physicalBaselineTime}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold whitespace-nowrap">
                        <span className={Number(rateFactor) >= 1.5 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {item.consumptionRatePerHour} {item.unit}/hr
                        </span>
                        {Number(rateFactor) > 1.0 && (
                          <span className="text-[10px] text-rose-500 font-semibold block">
                            ({rateFactor}× normal)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {item.normalRatePerHour} {item.unit}/hr
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isCrit
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isWarn
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isCrit
                              ? 'text-rose-700 text-sm'
                              : isWarn
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          }
                        >
                          {item.estimatedRunoutMinutes < 60
                            ? `${item.estimatedRunoutMinutes} min`
                            : `${Math.floor(item.estimatedRunoutMinutes / 60)}h ${
                                item.estimatedRunoutMinutes % 60
                              }m`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenAdjust(item.ingredientId)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                        >
                          Audit / Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Transactions Ledger Table */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Traceable Inventory Ledger (Section 29)
            </span>
            <span className="text-xs text-slate-500">
              Tracks every initial stock, order burn, purchase, and physical audit
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Delta</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Note / Audit Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => {
                  const isPositive = tx.delta > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {tx.timestamp}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {tx.ingredientName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? `+${tx.delta}` : tx.delta} {tx.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {tx.balanceAfter} {tx.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
