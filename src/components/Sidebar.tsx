/**
 * OpsPilot AI - Persistent Navigation Sidebar
 */

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  UtensilsCrossed,
  Bot,
  Settings,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  agentEnabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  mobileOpen,
  onMobileClose,
  agentEnabled = true,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'menu', label: 'Menu & Recipes', icon: UtensilsCrossed },
    { id: 'ai-operations', label: 'AI Operations', icon: Bot, badge: 'Core' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="text-base font-semibold text-white tracking-tight leading-tight">
                OpsPilot AI
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Autonomous Operations
              </div>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onRouteChange(item.id);
                  onMobileClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Agent Status Card */}
        <div className="p-3 border-t border-slate-800">
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white tracking-tight">
                  AI Agent Status
                </span>
              </div>
              <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                {agentEnabled ? 'Active' : 'Standby'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitoring kitchen signals, consumption velocity & runout curves.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Autonomous Guard
              </span>
              <span className="text-slate-400 font-mono text-[10px]">v2.4.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
