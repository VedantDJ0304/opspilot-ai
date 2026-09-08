/**
 * OpsPilot AI - 10-Step Interactive Demo Scenario Runner
 * Designed specifically for hackathon judges to verify the end-to-end autonomous agent lifecycle.
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { DemoStepState } from '../types.js';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoState: DemoStepState;
  onAdvanceStep: (step?: number) => Promise<void>;
  onReset: () => Promise<void>;
}

const STEPS = [
  {
    step: 1,
    title: 'New orders arriving...',
    stage: 'INPUT',
    description: 'Burst of lunch rush orders arrives containing multiple paneer entrees.',
  },
  {
    step: 2,
    title: 'Consumption rate increased...',
    stage: 'TELEMETRY',
    description: 'Deterministic rate engine recalculates consumption surge to 1.6 kg/hr (2× normal).',
  },
  {
    step: 3,
    title: 'Risk threshold breached (CRITICAL)...',
    stage: 'RISK',
    description: 'Estimated runout drops below 45 minutes; risk engine elevates Paneer to CRITICAL.',
  },
  {
    step: 4,
    title: 'AI analyzing situation...',
    stage: 'OBSERVE & ANALYZE',
    description: 'OpsPilot observes high burn rate vs physical baseline; diagnoses imminent kitchen stockout.',
  },
  {
    step: 5,
    title: 'Decision made...',
    stage: 'DECIDE',
    description: 'Agent evaluates alternatives and decides to temporarily limit paneer-heavy dishes.',
  },
  {
    step: 6,
    title: 'Autonomous action executed...',
    stage: 'ACT',
    description: 'Paneer Butter Masala, Paneer Tikka, and Paneer Biryani marked Limited across channels.',
  },
  {
    step: 7,
    title: 'Monitoring outcome...',
    stage: 'MONITOR',
    description: 'Agent observes paneer burn velocity decelerating by 65%; remaining 2.1kg protected.',
  },
  {
    step: 8,
    title: 'Inventory updated by Manager...',
    stage: 'HUMAN INTERACTION',
    description: 'Manager logs delivery of fresh dairy batch: +8.0 kg Paneer added to baseline.',
  },
  {
    step: 9,
    title: 'Risk reduced to NORMAL...',
    stage: 'RISK',
    description: 'Deterministic engine recalculates 10+ hours runout; risk drops from CRITICAL to NORMAL.',
  },
  {
    step: 10,
    title: 'Menu availability restored (ADAPTATION)',
    stage: 'ADAPT',
    description: 'Agent detects recovered inventory and autonomously restores all dishes to Available!',
  },
];

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({
  isOpen,
  onClose,
  demoState,
  onAdvanceStep,
  onReset,
}) => {
  const [isAutomating, setIsAutomating] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentStep = demoState.currentStep || 1;

  const handleNext = async () => {
    setLoading(true);
    try {
      const next = currentStep >= 10 ? 1 : currentStep + 1;
      await onAdvanceStep(next);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullCycle = async () => {
    setIsAutomating(true);
    setLoading(true);
    try {
      for (let s = 1; s <= 10; s++) {
        await onAdvanceStep(s);
        // small delay so judge can observe each step
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
    } finally {
      setIsAutomating(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                OpsPilot AI • 10-Step Autonomous Scenario Simulator
              </h3>
              <p className="text-xs text-slate-300">
                Live end-to-end demonstration for hackathon evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Step {currentStep} of 10</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-bold">{STEPS[currentStep - 1]?.title}</span>
          </div>

          <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Sequence List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {STEPS.map((s) => {
            const isPassed = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div
                key={s.step}
                onClick={() => !loading && onAdvanceStep(s.step)}
                className={`cursor-pointer border rounded-xl p-3.5 transition-all flex items-start gap-3.5 ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                    : isPassed
                    ? 'border-emerald-200 bg-emerald-50/20 text-slate-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-400'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-indigo-950 font-bold' : isPassed ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {s.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isCurrent
                            ? 'bg-indigo-200/80 text-indigo-900'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {s.stage}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 animate-spin" /> Active Step
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onReset()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Start
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunFullCycle}
              disabled={loading || isAutomating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-slate-800" />
              <span>{isAutomating ? 'Simulating All Steps...' : 'Auto-Play 10 Steps'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={loading || isAutomating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              <span>{currentStep >= 10 ? 'Start Over (Step 1)' : `Next Step (${currentStep + 1})`}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
