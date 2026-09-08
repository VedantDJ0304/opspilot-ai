/**
 * OpsPilot AI - Agent Decision Detail Modal
 * Section 15: Deep inspection of agent decision-making process.
 */

import React from 'react';
import {
  X,
  Target,
  FileText,
  Layers,
  Zap,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { AgentDecision } from '../types.js';

interface DecisionDetailModalProps {
  decision: AgentDecision | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateAiOperations: () => void;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({
  decision,
  isOpen,
  onClose,
  onNavigateAiOperations,
}) => {
  if (!isOpen || !decision) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Autonomous Decision Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Decision ID: {decision.id} • Registered at {decision.timestamp}
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Goal Section */}
          <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
              <Target className="w-4 h-4 text-indigo-600" />
              Operational Goal
            </div>
            <p className="text-sm font-semibold text-indigo-950">
              {decision.goal}
            </p>
          </div>

          {/* Context Telemetry */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Observed Operational Context
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[11px] text-slate-500">Current Stock</span>
                <div className="font-bold text-slate-900 text-base">
                  {decision.context.stock} {decision.context.unit}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[11px] text-slate-500">Consumption Rate</span>
                <div className="font-bold text-rose-600 text-base">
                  {decision.context.consumptionRate} {decision.context.unit}/hr
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[11px] text-slate-500">Baseline Rate</span>
                <div className="font-bold text-slate-700 text-base">
                  {decision.context.normalRate} {decision.context.unit}/hr
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[11px] text-slate-500">Pending Orders</span>
                <div className="font-bold text-slate-900 text-base">
                  {decision.context.pendingOrders} orders
                </div>
              </div>
            </div>
          </div>

          {/* Alternatives Evaluated */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Available Alternatives Evaluated
            </div>
            <div className="space-y-1.5">
              {decision.availableAlternatives.map((alt, idx) => {
                const isSelected = alt.toLowerCase().includes('limit paneer');
                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border border-slate-200/70 text-slate-600'
                    }`}
                  >
                    <span>{alt}</span>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision & Reason */}
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                Final Decision
              </div>
              <div className="text-sm font-bold text-slate-900 p-3 bg-slate-100 rounded-lg">
                {decision.decision}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Reasoning Summary
              </div>
              <p className="text-xs leading-relaxed text-slate-600 p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                {decision.reason}
              </p>
            </div>
          </div>

          {/* Action & Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Action Executed
              </div>
              <div className="text-xs font-semibold text-slate-900">
                {decision.action}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Paneer-heavy menu items set to 'Limited Availability'
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg bg-emerald-50/30 border-emerald-200/60">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Observed Result
              </div>
              <div className="text-xs text-slate-800 leading-relaxed">
                {decision.result || 'New paneer order inflow decelerated by 65%.'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Status: <strong className="text-slate-800">{decision.status}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateAiOperations();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              Go to AI Operations
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
