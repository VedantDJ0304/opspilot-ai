/**
 * OpsPilot AI - Dashboard Operational Command Center
 * Section 5: The primary command view showing live metrics, AI alert, and kitchen queue.
 */

import React from 'react';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  TrendingUp,
  Boxes,
  Plus,
  Bot,
  Sparkles,
} from 'lucide-react';
import { OperationalState } from '../types.js';
import { MainAiAlert } from './MainAiAlert.js';

interface DashboardViewProps {
  state: OperationalState;
  onOpenNewOrder: () => void;
  onOpenAdjustStock: (ingredientId?: string) => void;
  onOpenDecisionModal: () => void;
  onNavigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onOpenNewOrder,
  onOpenAdjustStock,
  onOpenDecisionModal,
  onNavigate,
}) => {
  const { metrics, risks, orders, inventory, latestDecision, agentEvents } = state;
  const criticalRisk = risks.find((r) => r.riskLevel === 'CRITICAL' && r.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Good morning, Manager Rajesh
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Here's what is happening across Spice Garden today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAdjustStock('ing-paneer')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-500" />
            <span>Stock Count</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Operational Status Alert Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          criticalRisk
            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full animate-ping ${
              criticalRisk ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              {criticalRisk ? 'ATTENTION REQUIRED' : 'OPERATIONS OPTIMAL'}
            </div>
            <div className="text-sm font-semibold">
              {criticalRisk
                ? `${risks.filter((r) => r.status === 'ACTIVE').length} operational risk needs immediate kitchen attention.`
                : 'Zero critical risks active. Inventory runout projections are stable.'}
            </div>
          </div>
        </div>

        {criticalRisk && (
          <button
            onClick={() => onNavigate('ai-operations')}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:text-rose-950 self-start sm:self-auto underline decoration-rose-300"
          >
            Inspect Autonomous Agent Guard
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Today's Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.todayOrdersCount}
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% vs yesterday</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.pendingOrdersCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            In active preparation queue
          </div>
        </div>

        {/* Inventory Risks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Inventory Risks
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metrics.activeRisksCount > 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              metrics.activeRisksCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {metrics.activeRisksCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {criticalRisk ? '1 Critical, 1 Warning' : 'All stocks safe'}
          </div>
        </div>

        {/* AI Actions Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              AI Actions Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {metrics.agentActionsTodayCount}
          </div>
          <div className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous decisions</span>
          </div>
        </div>
      </div>

      {/* Main AI Operational Alert (Section 6) */}
      <MainAiAlert
        criticalRisk={criticalRisk}
        latestDecision={latestDecision}
        onViewDetails={onOpenDecisionModal}
        onViewAiActivity={() => onNavigate('ai-operations')}
      />

      {/* 2-Column Operational Feed: Active Kitchen Queue & Inventory Runouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Orders & Real-time Ingredient Impact */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Kitchen Order Queue
              </h3>
              <p className="text-xs text-slate-500">
                Order ingredient consumption mapped in real-time
              </p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      #{order.orderNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">
                      {order.tableOrChannel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {order.createdAt}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === 'Preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'Pending'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'Ready'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-800 mb-1">
                  {order.items.map((i) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                  <span className="text-rose-700 font-medium truncate max-w-[280px]">
                    Impact: {order.ingredientImpactSummary}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0 font-mono">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Key Ingredients Runout Watchlist */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Key Ingredient Runout Watchlist
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic calculation: (Stock / Rate) × 60 min
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Inventory Table <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
            {inventory.slice(0, 5).map((item) => {
              const isCrit = item.riskLevel === 'CRITICAL';
              const isWarn = item.riskLevel === 'WARNING';

              return (
                <div
                  key={item.ingredientId}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCrit
                      ? 'bg-rose-50/40 border-rose-200'
                      : isWarn
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isCrit
                            ? 'bg-rose-600 text-white'
                            : isWarn
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold font-mono ${
                        isCrit ? 'text-rose-700' : isWarn ? 'text-amber-700' : 'text-slate-700'
                      }`}
                    >
                      {item.estimatedRunoutMinutes < 60
                        ? `${item.estimatedRunoutMinutes} min left`
                        : `${Math.floor(item.estimatedRunoutMinutes / 60)}h ${
                            item.estimatedRunoutMinutes % 60
                          }m left`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 mt-2">
                    <div>
                      <span className="text-slate-400 block">Est. Stock</span>
                      <span className="font-semibold text-slate-800">
                        {item.estimatedStock} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Current Rate</span>
                      <span className="font-semibold text-slate-800">
                        {item.consumptionRatePerHour} {item.unit}/hr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Normal Rate</span>
                      <span className="font-semibold text-slate-800">
                        {item.normalRatePerHour} {item.unit}/hr
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Autonomous Agent Timeline Ticker */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold tracking-tight">
              Live AI Autonomous Operations Ticker
            </h3>
          </div>
          <button
            onClick={() => onNavigate('ai-operations')}
            className="text-xs text-indigo-300 hover:text-white font-medium flex items-center gap-1"
          >
            Command Center <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {agentEvents.slice(0, 3).map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs"
            >
              <div className="flex items-center justify-between mb-1 text-slate-400">
                <span className="font-bold text-indigo-400 tracking-wider text-[10px]">
                  {evt.stage}
                </span>
                <span className="font-mono text-[10px]">{evt.timestamp}</span>
              </div>
              <h4 className="font-semibold text-slate-100 mb-1 leading-snug">
                {evt.title}
              </h4>
              <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                {evt.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
