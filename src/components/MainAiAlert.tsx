/**
 * OpsPilot AI - Main AI Operational Alert Component
 * Section 6: Primary visual differentiator for OpsPilot AI.
 */

import React from 'react';
import {
  AlertOctagon,
  Eye,
  LineChart,
  Brain,
  Zap,
  Activity,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { OperationalRisk, AgentDecision } from '../types.js';

interface MainAiAlertProps {
  criticalRisk?: OperationalRisk;
  latestDecision: AgentDecision | null;
  onViewDetails: () => void;
  onViewAiActivity: () => void;
}

export const MainAiAlert: React.FC<MainAiAlertProps> = ({
  criticalRisk,
  latestDecision,
  onViewDetails,
  onViewAiActivity,
}) => {
  // If there's no active critical risk (e.g. after adaptation/restock), show the healthy/recovered state!
  if (!criticalRisk) {
    return (
      <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  HEALTHY / RESOLVED
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Autonomous Protection Active
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                All Operational Inventory Runout Curves Within Normal Bounds
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                OpsPilot AI has confirmed inventory replenishment. Previous menu restrictions have been restored and consumption velocity matches standard lunch forecasts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onViewAiActivity}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              View AI Activity
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Critical Risk state (e.g. Paneer shortage)
  return (
    <div className="bg-white border-2 border-rose-500/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="bg-rose-50/70 border-b border-rose-100 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-rose-950 uppercase">
              AI Operational Alert
            </span>
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white shadow-2xs">
              CRITICAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-rose-700 bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded-md">
            Shortage in ~{criticalRisk.runoutMinutes} mins
          </span>
        </div>
      </div>

      {/* Main Alert Body */}
      <div className="p-5 sm:p-6 space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {criticalRisk.ingredientName.split(' ')[0]} may run out in approximately {criticalRisk.runoutMinutes} minutes.
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Autonomous protection has engaged to throttle paneer dish intake and prevent severe dining disruption.
          </p>
        </div>

        {/* 5-Column Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Current Estimated Stock
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {criticalRisk.currentStock} {criticalRisk.unit}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Physical baseline: 10.0 kg</div>
          </div>

          <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">
              Current Consumption
            </div>
            <div className="text-lg font-bold text-rose-900 mt-1">
              {criticalRisk.consumptionRate} {criticalRisk.unit}/hour
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">2.0× surge factor</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Normal Consumption
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {criticalRisk.normalRate} {criticalRisk.unit}/hour
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Historical lunch norm</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pending Orders
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {criticalRisk.pendingOrdersCount} orders
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">In active kitchen prep</div>
          </div>

          <div className="bg-rose-100/70 border border-rose-300 rounded-xl p-3.5 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Estimated Shortage
            </div>
            <div className="text-lg font-black text-rose-900 mt-1">
              {criticalRisk.runoutMinutes} minutes
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-0.5">Exhaustion projected</div>
          </div>
        </div>

        {/* 5-Step Operational Reasoning Sequence: Observe -> Analyze -> Decide -> Act -> Monitor */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            Autonomous Decision & Action Trace
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* 1. OBSERVE */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                <Eye className="w-3.5 h-3.5" />
                OBSERVED
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Paneer consumption is currently 2× the normal rate (1.6 kg/hr vs 0.8 kg/hr baseline).
              </p>
            </div>

            {/* 2. ANALYZE */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                <LineChart className="w-3.5 h-3.5" />
                ANALYZED
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Current order demand is significantly higher than expected. Stock will deplete before afternoon prep.
              </p>
            </div>

            {/* 3. DECIDE */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                <Brain className="w-3.5 h-3.5" />
                DECISION
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Temporarily limit paneer-heavy dishes to protect stock for pending high-margin orders.
              </p>
            </div>

            {/* 4. ACT */}
            <div className="bg-white border border-rose-200 rounded-lg p-3 ring-1 ring-rose-200">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5" />
                ACTION
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Paneer-heavy dishes were marked as limited availability across POS and digital channels.
              </p>
            </div>

            {/* 5. MONITOR */}
            <div className="bg-white border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Activity className="w-3.5 h-3.5" />
                MONITORING
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Agent is monitoring new order velocity and awaits kitchen inventory recovery.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Target Items Guarded: Paneer Butter Masala, Paneer Tikka, Paneer Biryani</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onViewDetails}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-lg transition-colors"
            >
              View Details
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onViewAiActivity}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              View AI Activity
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
