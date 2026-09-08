/**
 * OpsPilot AI - Autonomous Restaurant Operations System
 * Root Application Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { DashboardView } from './components/DashboardView.js';
import { OrdersView } from './components/OrdersView.js';
import { InventoryView } from './components/InventoryView.js';
import { MenuRecipesView } from './components/MenuRecipesView.js';
import { AiOperationsView } from './components/AiOperationsView.js';
import { SettingsView } from './components/SettingsView.js';
import { NewOrderModal } from './components/NewOrderModal.js';
import { StockAdjustModal } from './components/StockAdjustModal.js';
import { DecisionDetailModal } from './components/DecisionDetailModal.js';
import { DemoScenarioModal } from './components/DemoScenarioModal.js';
import {
  fetchOperationalState,
  createOrder,
  updateOrderStatus,
  adjustInventory,
  updateMenuItemAvailability,
  runAgentManual,
  advanceDemoStep,
  resetDemoState,
  updateAgentSettings,
  markNotificationsRead,
} from './api.js';
import {
  OperationalState,
  OrderItem,
  OrderStatus,
  MenuAvailability,
  AgentSettings,
  InventoryItem,
} from './types.js';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<OperationalState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState<boolean>(false);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState<boolean>(false);
  const [stockAdjustItem, setStockAdjustItem] = useState<InventoryItem | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // State loader
  const loadState = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchOperationalState();
      setState(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching state:', err);
      if (!silent) setError(err.message || 'Failed to connect to OpsPilot server');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load + periodic polling for real-time telemetry updates
  useEffect(() => {
    loadState();
    const interval = setInterval(() => {
      loadState(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadState]);

  // Handler: Create Order
  const handleCreateOrder = async (items: OrderItem[], tableOrChannel: string) => {
    try {
      const res = await createOrder(items, tableOrChannel);
      setState(res.state);
      showToast('Order placed successfully! Recipe ingredients deducted.');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    }
  };

  // Handler: Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await updateOrderStatus(orderId, status);
      setState(res.state);
      showToast(`Order status updated to ${status}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Handler: Adjust Stock / Physical Audit
  const handleAdjustStock = async (payload: {
    ingredientId: string;
    delta?: number;
    newPhysicalStock?: number;
    type: string;
    note: string;
  }) => {
    try {
      const res = await adjustInventory(payload);
      setState(res.state);
      showToast('Stock adjustment recorded and runout curves recomputed.');
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  // Handler: Toggle Menu Availability
  const handleToggleMenuAvailability = async (
    id: string,
    status: MenuAvailability,
    reason?: string
  ) => {
    try {
      const res = await updateMenuItemAvailability(id, status, reason);
      setState(res.state);
      showToast(`Menu item availability updated to ${status}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update menu item', 'error');
    }
  };

  // Handler: Manual AI Trigger
  const handleTriggerAi = async () => {
    setIsAiRunning(true);
    try {
      const res = await runAgentManual('Manager Manual Trigger');
      setState(res.state);
      showToast('OpsPilot AI evaluated operations and logged observations.');
    } catch (err: any) {
      showToast(err.message || 'Agent evaluation failed', 'error');
    } finally {
      setIsAiRunning(false);
    }
  };

  // Handler: Advance Demo Step
  const handleAdvanceDemoStep = async (step?: number) => {
    try {
      const res = await advanceDemoStep(step);
      setState(res.state);
      showToast(`Scenario Step ${res.state.demoState.currentStep}: ${res.state.demoState.stepTitle}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to advance demo step', 'error');
    }
  };

  // Handler: Reset Demo State
  const handleReset = async () => {
    try {
      const res = await resetDemoState();
      setState(res.state);
      showToast('Scenario state reset back to initial lunch rush.');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset state', 'error');
    }
  };

  // Handler: Update Agent Settings
  const handleUpdateSettings = async (updated: Partial<AgentSettings>) => {
    try {
      const newSettings = await updateAgentSettings(updated);
      if (state) {
        setState({ ...state, settings: newSettings });
      }
      showToast('Settings saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    }
  };

  // Handler: Mark Notifications Read
  const handleMarkNotificationsRead = async () => {
    try {
      await markNotificationsRead();
      if (state) {
        const updatedNotifs = state.notifications.map((n) => ({ ...n, read: true }));
        setState({ ...state, notifications: updatedNotifs });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Adjust Modal helper
  const openAdjustModal = (ingredientId?: string) => {
    if (!state) return;
    const target = ingredientId
      ? state.inventory.find((i) => i.ingredientId === ingredientId)
      : state.inventory[0];
    if (target) {
      setStockAdjustItem(target);
      setIsStockAdjustOpen(true);
    }
  };

  if (loading && !state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <div className="text-sm font-semibold text-slate-800">
            Connecting to OpsPilot Autonomous System...
          </div>
          <div className="text-xs text-slate-500">
            Initializing kitchen rate telemetry & agent state
          </div>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">
            Failed to Connect to OpsPilot Server
          </h2>
          <p className="text-xs text-slate-600 mt-1 mb-4">{error}</p>
          <button
            onClick={() => loadState()}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast message */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Persistent Navigation Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={(route) => setCurrentRoute(route)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        agentEnabled={state.settings.agentEnabled}
      />

      {/* Main Content Body (Offset on Desktop by Sidebar Width) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Top Bar */}
        <TopBar
          onMenuClick={() => setMobileSidebarOpen(true)}
          restaurantName="Spice Garden"
          managerName="Rajesh Kulkarni"
          notifications={state.notifications}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onTriggerAi={handleTriggerAi}
          onReset={handleReset}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          isAiRunning={isAiRunning}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentRoute === 'dashboard' && (
            <DashboardView
              state={state}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
              onOpenAdjustStock={openAdjustModal}
              onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {currentRoute === 'orders' && (
            <OrdersView
              orders={state.orders}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {currentRoute === 'inventory' && (
            <InventoryView
              inventory={state.inventory}
              ingredients={state.ingredients}
              transactions={state.inventoryTransactions}
              onOpenAdjust={openAdjustModal}
            />
          )}

          {currentRoute === 'menu' && (
            <MenuRecipesView
              menuItems={state.menuItems}
              ingredients={state.ingredients}
              onToggleAvailability={handleToggleMenuAvailability}
            />
          )}

          {currentRoute === 'ai-operations' && (
            <AiOperationsView
              state={state}
              onTriggerAi={handleTriggerAi}
              onOpenDemo={() => setIsDemoModalOpen(true)}
              isAiRunning={isAiRunning}
            />
          )}

          {currentRoute === 'settings' && (
            <SettingsView
              settings={state.settings}
              onUpdateSettings={handleUpdateSettings}
              onReset={handleReset}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        menuItems={state.menuItems}
        ingredients={state.ingredients}
        onSubmitOrder={handleCreateOrder}
      />

      <StockAdjustModal
        isOpen={isStockAdjustOpen}
        onClose={() => setIsStockAdjustOpen(false)}
        inventoryItem={stockAdjustItem}
        onAdjust={handleAdjustStock}
      />

      <DecisionDetailModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        decision={state.latestDecision}
        onNavigateAiOperations={() => setCurrentRoute('ai-operations')}
      />

      <DemoScenarioModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        demoState={state.demoState}
        onAdvanceStep={handleAdvanceDemoStep}
        onReset={handleReset}
      />
    </div>
  );
}
