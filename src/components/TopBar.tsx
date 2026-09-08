/**
 * OpsPilot AI - Top Header Bar
 */

import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronDown,
} from 'lucide-react';
import { AppNotification } from '../types.js';

interface TopBarProps {
  onMenuClick: () => void;
  restaurantName: string;
  managerName: string;
  notifications: AppNotification[];
  onOpenDemo: () => void;
  onTriggerAi: () => void;
  onReset: () => void;
  onMarkNotificationsRead: () => void;
  isAiRunning?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  restaurantName,
  managerName,
  notifications,
  onOpenDemo,
  onTriggerAi,
  onReset,
  onMarkNotificationsRead,
  isAiRunning = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left side: Hamburger (mobile) + Restaurant Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Restaurant Identity Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            SG
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900">
                {restaurantName}
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                Live
              </span>
            </div>
            <div className="text-[11px] text-slate-500 hidden sm:block">
              Nashik Branch • Lunch Service
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Actions, Notifications, Manager Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset State Button */}
        <button
          onClick={onReset}
          title="Reset back to initial scenario state"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset State</span>
        </button>

        {/* Run Demo Scenario Button */}
        <button
          onClick={onOpenDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
        >
          <Play className="w-3.5 h-3.5 fill-indigo-600" />
          <span className="hidden xs:inline">Run</span> Demo Scenario
        </button>

        {/* Trigger AI Evaluation Button */}
        <button
          onClick={onTriggerAi}
          disabled={isAiRunning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-2xs"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAiRunning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">AI Analysis</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                onMarkNotificationsRead();
              }
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    Operational Alerts
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({notifications.length})
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkNotificationsRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No operational alerts recorded.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors ${
                        !notif.read ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manager Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-semibold text-xs ring-1 ring-slate-200">
            RK
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {managerName}
            </div>
            <div className="text-[11px] text-slate-500">General Manager</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
        </div>
      </div>
    </header>
  );
};
