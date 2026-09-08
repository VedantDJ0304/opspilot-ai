/**
 * OpsPilot AI - System Settings & Agent Autonomy Configuration
 * Section 17 & 22: Configure restaurant identity, autonomy boundaries, and risk thresholds.
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Building,
  Bell,
  Sparkles,
} from 'lucide-react';
import { AgentSettings } from '../types.js';

interface SettingsViewProps {
  settings: AgentSettings;
  onUpdateSettings: (updated: Partial<AgentSettings>) => Promise<void>;
  onReset: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onReset,
}) => {
  const [localSettings, setLocalSettings] = useState<AgentSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTogglePermission = async (key: keyof AgentSettings['permissions']) => {
    const updatedVal = !localSettings.permissions[key];
    const newPermissions = { ...localSettings.permissions, [key]: updatedVal };
    const newObj = { ...localSettings, permissions: newPermissions };
    setLocalSettings(newObj);
    await onUpdateSettings({ permissions: newPermissions });
  };

  const handleSensitivity = async (val: 'conservative' | 'balanced' | 'aggressive') => {
    const newObj = { ...localSettings, riskSensitivity: val };
    setLocalSettings(newObj);
    await onUpdateSettings({ riskSensitivity: val });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System & Agent Settings
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Configure restaurant operational boundaries, Gemini AI permissions, and risk tolerances.
        </p>
      </div>

      {/* Restaurant Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Building className="w-4 h-4 text-indigo-600" />
          Restaurant Profile
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
              Establishment Name
            </label>
            <input
              type="text"
              readOnly
              value="Spice Garden Restaurant"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
              Branch & Operating Mode
            </label>
            <input
              type="text"
              readOnly
              value="Nashik Branch • Lunch & Dinner Service"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
              General Manager
            </label>
            <input
              type="text"
              readOnly
              value="Rajesh Kulkarni"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
              Primary Currency & Metrics
            </label>
            <input
              type="text"
              readOnly
              value="INR (₹) • Metric (kg, Liters, Grams)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* AI Agent Autonomy Permissions (Section 17) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AI Agent Autonomy Safeguards & Permissions
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Gemini 3.8 Flash Active
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Define what autonomous actions the OpsPilot agent can execute without requiring manual human confirmation.
        </p>

        <div className="divide-y divide-slate-100">
          {[
            {
              key: 'notifyManager' as const,
              title: 'Manager Push Notifications',
              desc: 'Allow OpsPilot to immediately dispatch urgent operational alerts to Manager Rajesh.',
            },
            {
              key: 'limitMenuItems' as const,
              title: 'Autonomous Menu Item Throttling (Limited Availability)',
              desc: 'Allow OpsPilot to mark high-consumption dishes as LIMITED when runout time drops below threshold.',
            },
            {
              key: 'disableMenuItems' as const,
              title: 'Autonomous Menu Item Disabling (Complete Delisting)',
              desc: 'Allow OpsPilot to fully disable dishes when estimated stock drops to 0.0.',
            },
            {
              key: 'restoreMenuItems' as const,
              title: 'Autonomous Recovery Restoration',
              desc: 'Allow OpsPilot to automatically restore menu items to AVAILABLE once inventory replenishment is logged.',
            },
            {
              key: 'replenishmentAlerts' as const,
              title: 'Automated Supplier Re-order Recommendations',
              desc: 'Allow OpsPilot to generate purchase suggestions for key dairy and fresh produce suppliers.',
            },
          ].map((item) => (
            <div key={item.key} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  {item.desc}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTogglePermission(item.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  localSettings.permissions[item.key] ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    localSettings.permissions[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Sensitivity & Thresholds */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Risk Sensitivity & Runout Thresholds
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Operational Sensitivity Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'conservative' as const, label: 'Conservative', desc: 'Triggers alerts early (120m runout)' },
              { id: 'balanced' as const, label: 'Balanced (Default)', desc: 'Optimal trade-off for lunch rush (45m)' },
              { id: 'aggressive' as const, label: 'Aggressive', desc: 'Minimizes menu restrictions until 25m' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleSensitivity(mode.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localSettings.riskSensitivity === mode.id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{mode.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
              Warning Runout Threshold
            </span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              90 minutes
            </div>
            <span className="text-[11px] text-slate-500">
              Triggers visual status alert in dashboard
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
              Critical Runout Threshold
            </span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              45 minutes
            </div>
            <span className="text-[11px] text-slate-500">
              Engages autonomous menu limitation actions
            </span>
          </div>
        </div>
      </div>

      {/* Demo Controls & State Reset */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Reset Demo State
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Restores initial lunch rush scenario with 142 orders, baseline physical stocks, and the Paneer surge risk.
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Scenario State
        </button>
      </div>
    </div>
  );
};
