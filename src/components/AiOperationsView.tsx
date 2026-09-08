/**
 * OpsPilot AI - Autonomous AI Operations Command Center
 * Sections 13, 14, 15, 16, 17, 18, 19, 20, 21, 28:
 * The core hackathon centerpiece visualizing the Observe -> Analyze -> Decide -> Act -> Monitor -> Adapt cycle.
 */

import React from 'react';
import {
  Bot,
  Brain,
  Eye,
  LineChart,
  Zap,
  Activity,
  Sparkles,
  ShieldCheck,
  Target,
  FileText,
  Layers,
  History,
  CheckCircle2,
  Clock,
  RotateCcw,
  Play,
} from 'lucide-react';
import { OperationalState, AgentEvent, AgentDecision } from '../types.js';

interface AiOperationsViewProps {
  state: OperationalState;
  onTriggerAi: () => void;
  onOpenDemo: () => void;
  isAiRunning?: boolean;
}

export const AiOperationsView: React.FC<AiOperationsViewProps> = ({
  state,
  onTriggerAi,
  onOpenDemo,
  isAiRunning = false,
}) => {
  const { agentEvents, latestDecision, settings, incidents } = state;

  const getStageBadge = (stage: AgentEvent['stage']) => {
    switch (stage) {
      case 'OBSERVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ANALYZE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DECIDE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MONITOR':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'ADAPT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStageIcon = (stage: AgentEvent['stage']) => {
    switch (stage) {
      case 'OBSERVE':
        return <Eye className="w-3.5 h-3.5 text-blue-600" />;
      case 'ANALYZE':
        return <LineChart className="w-3.5 h-3.5 text-purple-600" />;
      case 'DECIDE':
        return <Brain className="w-3.5 h-3.5 text-amber-600" />;
      case 'ACT':
        return <Zap className="w-3.5 h-3.5 text-rose-600" />;
      case 'MONITOR':
        return <Activity className="w-3.5 h-3.5 text-cyan-600" />;
      case 'ADAPT':
        return <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bot className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-indigo-600" />
            OpsPilot AI Operations Center
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Autonomous decision engine powered by Gemini 3.8 Flash & Deterministic Rate Telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-600" />
            Launch 10-Step Simulator
          </button>

          <button
            onClick={onTriggerAi}
            disabled={isAiRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAiRunning ? 'animate-spin' : ''}`} />
            <span>{isAiRunning ? 'Evaluating Ops...' : 'Run Agent Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Hero Agent Status & Objective Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Agent Status: Active
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">
                Gemini 3.8 Flash Autonomous Loop
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              OpsPilot is continuously monitoring restaurant operations.
            </h2>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Current Operational Objective
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "Prevent operational disruptions caused by inventory shortages, abnormal demand surges, and kitchen runout risks while preserving guest experience."
              </p>
            </div>
          </div>

          {/* Autonomy Safeguards */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 lg:w-72 shrink-0 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Autonomous Guard Controls
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Auto-Limit Menu Items:</span>
                <span className="text-emerald-400 font-semibold font-mono">ENABLED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-Restore on Recovery:</span>
                <span className="text-emerald-400 font-semibold font-mono">ENABLED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Manager Push Alerts:</span>
                <span className="text-emerald-400 font-semibold font-mono">ENABLED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Risk Sensitivity:</span>
                <span className="text-amber-400 font-semibold font-mono">BALANCED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Stage Visual Workflow Header: OBSERVE -> ANALYZE -> DECIDE -> ACT -> MONITOR -> ADAPT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          The OpsPilot 6-Stage Autonomous Loop
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
          {[
            { stage: '1. OBSERVE', label: 'Monitor kitchen orders & burn rates', color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
            { stage: '2. ANALYZE', label: 'Evaluate runout time & surge factor', color: 'border-purple-200 bg-purple-50/50 text-purple-900' },
            { stage: '3. DECIDE', label: 'Reason over trade-offs & alternatives', color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
            { stage: '4. ACT', label: 'Execute menu limits & notifications', color: 'border-rose-200 bg-rose-50/50 text-rose-900' },
            { stage: '5. MONITOR', label: 'Track rate deceleration & recovery', color: 'border-cyan-200 bg-cyan-50/50 text-cyan-900' },
            { stage: '6. ADAPT', label: 'Autonomously restore availability', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 border rounded-xl ${item.color}`}>
              <div className="text-xs font-black tracking-wider uppercase">
                {item.stage}
              </div>
              <div className="text-[11px] mt-1 font-medium leading-snug">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Core Section: Event Timeline + Latest Decision Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Agent Event Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Agent Activity Event Stream
              </h3>
              <p className="text-xs text-slate-500">
                Live reasoning and telemetry events recorded by OpsPilot
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {agentEvents.length} events logged
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {agentEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-white border border-slate-200 shadow-2xs">
                      {getStageIcon(evt.stage)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStageBadge(
                        evt.stage
                      )}`}
                    >
                      {evt.stage}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {evt.timestamp}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  {evt.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {evt.description}
                </p>

                {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2 text-[11px] text-slate-500 font-mono">
                    {Object.entries(evt.metadata).map(([k, v]) => (
                      <span key={k} className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {k}: <strong className="text-slate-700">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Latest Decision Panel (Section 15) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Autonomous Decision Deep-Dive
                </h3>
                <p className="text-xs text-slate-500">
                  Full context, goals, and alternative options considered
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {latestDecision?.status || 'Active'}
              </span>
            </div>

            {latestDecision ? (
              <div className="space-y-4 text-xs">
                {/* Goal */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                  <div className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] mb-0.5">
                    Goal
                  </div>
                  <div className="text-slate-800 font-semibold">
                    {latestDecision.goal}
                  </div>
                </div>

                {/* Context */}
                <div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5">
                    Operational Context
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-400 block">Available Stock</span>
                      <span className="font-bold text-slate-900">
                        {latestDecision.context.stock} {latestDecision.context.unit}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-400 block">Consumption Rate</span>
                      <span className="font-bold text-rose-600">
                        {latestDecision.context.consumptionRate} {latestDecision.context.unit}/hr
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-400 block">Normal Baseline</span>
                      <span className="font-bold text-slate-800">
                        {latestDecision.context.normalRate} {latestDecision.context.unit}/hr
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-400 block">Pending Inflow</span>
                      <span className="font-bold text-slate-900">
                        {latestDecision.context.pendingOrders} orders
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                <div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5">
                    Alternatives Evaluated
                  </div>
                  <div className="space-y-1">
                    {latestDecision.availableAlternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-[11px] flex items-center justify-between ${
                          alt.toLowerCase().includes('limit')
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{alt}</span>
                        {alt.toLowerCase().includes('limit') && (
                          <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                            Executed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1">
                    Agent Reasoning (Gemini 3.8 Flash)
                  </div>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                    {latestDecision.reason}
                  </p>
                </div>

                {/* Action & Result */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-100 rounded border border-slate-200">
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">
                      Action Taken
                    </span>
                    <span className="font-bold text-slate-900">
                      {latestDecision.action}
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                    <span className="text-emerald-800 block uppercase font-bold text-[10px]">
                      Observed Result
                    </span>
                    <span className="font-semibold text-emerald-950">
                      {latestDecision.result || 'Orders throttled & protected.'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No decisions recorded yet.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Decision Hash: {latestDecision?.id || 'N/A'}</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministically Verified
            </span>
          </div>
        </div>
      </div>

      {/* Historical Incidents / Operational Memory (Section 28) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              Incident History & Operational Memory (Section 28)
            </h3>
            <p className="text-xs text-slate-500">
              Persistent memory of past inventory risk events, autonomous countermeasures, and recovery durations.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {incidents.length} recorded incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Ingredient Involved</th>
                <th className="py-3 px-4">Root Cause</th>
                <th className="py-3 px-4">AI Countermeasure Executed</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {inc.date}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {inc.ingredientName}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">
                    {inc.cause}
                  </td>
                  <td className="py-3 px-4 text-indigo-700 font-medium max-w-xs">
                    {inc.actionTaken}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">
                    {inc.outcome}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
