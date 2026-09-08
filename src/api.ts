/**
 * OpsPilot AI - Frontend API Client
 */

import { OperationalState, OrderItem, AgentSettings } from './types.js';

export async function fetchOperationalState(): Promise<OperationalState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch operational state');
  return res.json();
}

export async function createOrder(
  items: OrderItem[],
  tableOrChannel?: string
): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, tableOrChannel }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function adjustInventory(payload: {
  ingredientId: string;
  delta?: number;
  newPhysicalStock?: number;
  type?: string;
  note?: string;
}): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch('/api/inventory/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust inventory');
  }
  return res.json();
}

export async function updateMenuItemAvailability(
  id: string,
  availabilityStatus: 'AVAILABLE' | 'LIMITED' | 'DISABLED',
  limitedReason?: string
): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch(`/api/menu/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availabilityStatus, limitedReason }),
  });
  if (!res.ok) throw new Error('Failed to update menu item');
  return res.json();
}

export async function runAgentManual(trigger?: string): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch('/api/agent/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trigger }),
  });
  if (!res.ok) throw new Error('Failed to trigger AI agent');
  return res.json();
}

export async function advanceDemoStep(step?: number): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch('/api/agent/demo-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step }),
  });
  if (!res.ok) throw new Error('Failed to advance demo step');
  return res.json();
}

export async function resetDemoState(): Promise<{ success: boolean; state: OperationalState }> {
  const res = await fetch('/api/reset', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset state');
  return res.json();
}

export async function updateAgentSettings(settings: Partial<AgentSettings>): Promise<AgentSettings> {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  const data = await res.json();
  return data.settings;
}

export async function markNotificationsRead(): Promise<void> {
  await fetch('/api/notifications/mark-read', { method: 'POST' });
}
