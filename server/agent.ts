/**
 * OpsPilot AI - Autonomous Operations Agent Controller
 * 
 * Implements the full agentic loop:
 * OBSERVE -> ANALYZE -> DECIDE -> ACT -> MONITOR -> ADAPT
 * 
 * Uses @google/genai SDK (gemini-3.8-flash) when GEMINI_API_KEY is available,
 * with deterministic fallback to ensure reliable hackathon demonstrations.
 */

import { GoogleGenAI, Type } from'@google/genai';
import { db } from './db.js';
import {
  AgentActionType,
  AgentDecision,
  AgentEvent,
  AppNotification,
  InventoryItem,
  MenuItem,
  OperationalRisk,
} from '../src/types.js';

interface AgentExecutionResult {
  observed: string;
  analysis: string;
  decision: AgentDecision;
  actionsExecuted: string[];
  eventsLogged: AgentEvent[];
}

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Executes a full cycle of the OpsPilot AI Autonomous Loop.
 */
export async function runAgentCycle(
  triggerEvent: string = 'Routine operational sweep'
): Promise<AgentExecutionResult> {
  const state = db.getState();
  const settings = state.settings;
  const timeString = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. OBSERVE: Gather signals from data layer
  const activeRisks = state.risks.filter((r) => r.status === 'ACTIVE');
  const criticalRisk = activeRisks.find((r) => r.riskLevel === 'CRITICAL');
  const warningRisks = activeRisks.filter((r) => r.riskLevel === 'WARNING');
  const pendingOrders = state.orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Preparing'
  );
  const limitedItems = state.menuItems.filter((m) => m.availabilityStatus === 'LIMITED');

  const observeSummary = criticalRisk
    ? `Critical surge detected on ${criticalRisk.ingredientName}. Current stock is ${criticalRisk.currentStock} ${criticalRisk.unit}, consuming at ${criticalRisk.consumptionRate} ${criticalRisk.unit}/hr (${(criticalRisk.consumptionRate / criticalRisk.normalRate).toFixed(1)}× baseline) with ${criticalRisk.pendingOrdersCount} pending orders. Estimated runout: ${criticalRisk.runoutMinutes} minutes.`
    : limitedItems.length > 0 && !criticalRisk
      ? `Stock recovery observed. ${limitedItems.length} menu items currently restricted while critical risk conditions have cleared.`
      : `Operational signals normal across ${state.inventory.length} ingredients. ${pendingOrders.length} orders in preparation queue.`;

  // Log OBSERVE event
  const observeEvent: AgentEvent = {
    id: `evt-obs-${Date.now()}`,
    timestamp: timeString,
    stage: 'OBSERVE',
    title: criticalRisk
      ? `Inventory Risk Alert Observed: ${criticalRisk.ingredientName}`
      : limitedItems.length > 0 && !criticalRisk
        ? 'Recovery Signals Observed'
        : 'Operational Baseline Signals Observed',
    description: observeSummary,
    inputData: {
      activeRisksCount: activeRisks.length,
      criticalIngredient: criticalRisk?.ingredientName,
      pendingOrdersCount: pendingOrders.length,
      trigger: triggerEvent,
    },
    status: 'COMPLETED',
  };
  db.addAgentEvent(observeEvent);

  // 2. ANALYZE & DECIDE: Check if situation requires action or adaptation
  let actionType: AgentActionType = 'CONTINUE_MONITORING';
  let reasoningSummary = '';
  let decisionTitle = '';
  let selectedMenuItems: string[] = [];

  // Check for ADAPTATION condition: Limited items exist, but stock is healthy (e.g. manager added stock)
  const isRecovered =
    limitedItems.length > 0 &&
    state.inventory.find((i) => i.ingredientId === 'ing-paneer' && i.estimatedStock >= 6.0 && i.riskLevel === 'NORMAL');

  if (isRecovered) {
    // ADAPTATION SCENARIO
    actionType = 'RESTORE_MENU_ITEM';
    decisionTitle = 'Restore full menu availability following inventory recovery';
    reasoningSummary =
      'Paneer stock has been replenished to safe operating levels (>= 6.0kg). Risk metrics returned to NORMAL. Restricting menu items is no longer necessary.';
    selectedMenuItems = limitedItems.map((m) => m.id);
  } else if (criticalRisk && criticalRisk.ingredientId === 'ing-paneer') {
    // SHORTAGE MITIGATION SCENARIO
    actionType = settings.permissions.limitMenuItems ? 'LIMIT_MENU_ITEM' : 'NOTIFY_MANAGER';
    decisionTitle = 'Temporarily limit paneer-heavy dishes to prevent total kitchen stockout';
    reasoningSummary = `Current consumption rate (${criticalRisk.consumptionRate} kg/hr) is ${(criticalRisk.consumptionRate / criticalRisk.normalRate).toFixed(1)}× normal rate. Available stock (${criticalRisk.currentStock} kg) will exhaust in ${criticalRisk.runoutMinutes} minutes. Limiting paneer-heavy items conserves stock for active dine-in orders while maintaining restaurant throughput.`;
    selectedMenuItems = ['menu-pbm', 'menu-pt', 'menu-pb'];
  } else if (warningRisks.length > 0) {
    actionType = 'CREATE_REPLENISHMENT_ALERT';
    decisionTitle = `Alert kitchen procurement for elevated consumption on ${warningRisks[0].ingredientName}`;
    reasoningSummary = `Elevated consumption rate detected on ${warningRisks[0].ingredientName}. Proactively queue replenishment to avert risk escalation.`;
  } else {
    actionType = 'CONTINUE_MONITORING';
    decisionTitle = 'Maintain operational watch; all telemetry within tolerance thresholds';
    reasoningSummary =
      'All tracked ingredient runout projections exceed 3 hours. Order inflow matches standard meal rush distributions.';
  }

  // Optional: Try Gemini API for nuanced reasoning enhancement if API key is active
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const prompt = `You are OpsPilot AI, an autonomous operations agent for a restaurant named Spice Garden.
Operational State:
- Trigger: ${triggerEvent}
- Active Risks: ${JSON.stringify(activeRisks)}
- Critical Risk: ${JSON.stringify(criticalRisk || 'None')}
- Limited Items: ${limitedItems.map((m) => m.name).join(', ') || 'None'}
- Pending Orders: ${pendingOrders.length}
- Inventory Status: ${state.inventory.map((i) => `${i.name}: ${i.estimatedStock} ${i.unit} (runout ${i.estimatedRunoutMinutes}m)`).join('; ')}

Determine the optimal operational response. Return concise JSON:
{
  "reasoning_summary": "1-2 sentence operational analysis",
  "decision": "concise decision statement",
  "recommended_action": "${actionType}",
  "monitoring_objective": "what to watch after action"
}`;

      // Call Gemini 2.5 Flash for contextual reasoning with a 4-second timeout
      const generatePromise = gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reasoning_summary: { type: Type.STRING },
              decision: { type: Type.STRING },
              recommended_action: { type: Type.STRING },
              monitoring_objective: { type: Type.STRING },
            },
            required: ['reasoning_summary', 'decision', 'recommended_action'],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.reasoning_summary) reasoningSummary = parsed.reasoning_summary;
        if (parsed.decision) decisionTitle = parsed.decision;
      }
    } catch (err) {
      console.warn('Gemini API call skipped or timed out; using deterministic agent logic.');
    }
  }

  // Log ANALYZE event
  const analyzeEvent: AgentEvent = {
    id: `evt-ana-${Date.now()}`,
    timestamp: timeString,
    stage: 'ANALYZE',
    title: isRecovered
      ? 'Recovery & Capacity Threshold Assessment'
      : criticalRisk
        ? `High-Risk Stock Depletion Analysis: ${criticalRisk.ingredientName}`
        : 'Operational Telemetry Stability Check',
    description: reasoningSummary,
    inputData: {
      actionType,
      runoutMinutes: criticalRisk?.runoutMinutes,
      rateRatio: criticalRisk ? (criticalRisk.consumptionRate / criticalRisk.normalRate).toFixed(1) : '1.0x',
    },
    status: 'COMPLETED',
  };
  db.addAgentEvent(analyzeEvent);

  // 3. DECIDE: Record structured decision
  const decisionRecord: AgentDecision = {
    id: `dec-${Date.now()}`,
    timestamp: timeString,
    goal: isRecovered
      ? 'Restore normal menu capacity after stock stabilization'
      : 'Prevent operational disruptions and kitchen stockouts',
    trigger: triggerEvent,
    context: {
      ingredientName: criticalRisk ? criticalRisk.ingredientName : 'Paneer',
      stock: criticalRisk ? criticalRisk.currentStock : state.inventory[0]?.estimatedStock || 10,
      unit: criticalRisk ? criticalRisk.unit : 'kg',
      consumptionRate: criticalRisk ? criticalRisk.consumptionRate : 0.8,
      normalRate: criticalRisk ? criticalRisk.normalRate : 0.8,
      pendingOrders: pendingOrders.length,
      runoutMinutes: criticalRisk ? criticalRisk.runoutMinutes : 999,
    },
    availableAlternatives: [
      'Limit paneer-heavy dishes (Targeted mitigation)',
      'Disable all paneer menu items immediately (Aggressive disruption)',
      'Notify kitchen manager for emergency procurement',
      'Continue monitoring without operational intervention',
    ],
    decision: decisionTitle,
    reason: reasoningSummary,
    action: actionType,
    actionParams: {
      targetItemIds: selectedMenuItems,
      actionType,
    },
    result: '',
    status: actionType === 'CONTINUE_MONITORING' ? 'Monitoring' : 'Executed',
  };

  // Log DECIDE event
  const decideEvent: AgentEvent = {
    id: `evt-dec-${Date.now()}`,
    timestamp: timeString,
    stage: isRecovered ? 'ADAPT' : 'DECIDE',
    title: isRecovered ? 'Agent Adaptation: Restore Menu Items' : `Decision: ${decisionTitle}`,
    description: decisionTitle,
    decision: decisionTitle,
    action: actionType,
    status: 'COMPLETED',
  };
  db.addAgentEvent(decideEvent);

  // 4. ACT: Execute autonomous application actions
  const executedActions: string[] = [];

  if (actionType === 'LIMIT_MENU_ITEM' && settings.permissions.limitMenuItems) {
    for (const itemId of selectedMenuItems) {
      const item = state.menuItems.find((m) => m.id === itemId);
      if (item) {
        item.availabilityStatus = 'LIMITED';
        item.limitedReason = 'OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak surge.';
        db.updateMenuItem(item);
      }
    }
    const itemNames = state.menuItems
      .filter((m) => selectedMenuItems.includes(m.id))
      .map((m) => m.name)
      .join(', ');
    executedActions.push(`Marked ${selectedMenuItems.length} menu items as Limited (${itemNames})`);

    const actEvent: AgentEvent = {
      id: `evt-act-${Date.now()}`,
      timestamp: timeString,
      stage: 'ACT',
      title: 'Autonomous Action: Limited High-Demand Dishes',
      description: `Automatically updated availability of ${itemNames} to 'Limited' to preserve inventory.`,
      action: 'LIMIT_MENU_ITEM',
      actionTarget: itemNames,
      result: 'Menu availability state updated across POS and online channels.',
      status: 'COMPLETED',
    };
    db.addAgentEvent(actEvent);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'OpsPilot Guard Activated: Menu Items Limited',
      message: `Limited availability set for ${itemNames} to protect paneer reserve.`,
      type: 'WARNING',
      timestamp: timeString,
      read: false,
      actionLink: '/menu',
    };
    db.addNotification(notif);
    decisionRecord.result = `Marked ${itemNames} as Limited. Order velocity throttled to conserve remaining stock.`;
  } else if (actionType === 'RESTORE_MENU_ITEM' && settings.permissions.restoreMenuItems) {
    for (const itemId of selectedMenuItems) {
      const item = state.menuItems.find((m) => m.id === itemId);
      if (item) {
        item.availabilityStatus = 'AVAILABLE';
        item.limitedReason = undefined;
        db.updateMenuItem(item);
      }
    }
    const itemNames = state.menuItems
      .filter((m) => selectedMenuItems.includes(m.id))
      .map((m) => m.name)
      .join(', ');
    executedActions.push(`Restored ${selectedMenuItems.length} menu items to Available (${itemNames})`);

    const adaptEvent: AgentEvent = {
      id: `evt-adapt-${Date.now()}`,
      timestamp: timeString,
      stage: 'ADAPT',
      title: 'Autonomous Adaptation: Restored Full Menu',
      description: `Stock recovered to safe levels. Automatically restored ${itemNames} to Available.`,
      action: 'RESTORE_MENU_ITEM',
      actionTarget: itemNames,
      result: 'All menu restrictions cleared. Full order placement restored.',
      status: 'COMPLETED',
    };
    db.addAgentEvent(adaptEvent);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Inventory Recovered: Menu Restored',
      message: `OpsPilot restored ${itemNames} to full availability.`,
      type: 'SUCCESS',
      timestamp: timeString,
      read: false,
      actionLink: '/menu',
    };
    db.addNotification(notif);
    decisionRecord.result = `Restored ${itemNames} to normal availability following stock recovery.`;
  } else if (actionType === 'NOTIFY_MANAGER' || actionType === 'CREATE_REPLENISHMENT_ALERT') {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Kitchen Procurement Priority Alert',
      message: reasoningSummary,
      type: 'CRITICAL',
      timestamp: timeString,
      read: false,
      actionLink: '/inventory',
    };
    db.addNotification(notif);
    executedActions.push('Dispatched procurement alert to Manager Rajesh K.');
    decisionRecord.result = 'Procurement notification dispatched to kitchen dashboard.';
  }

  // 5. MONITOR: Set monitoring event
  const monitorEvent: AgentEvent = {
    id: `evt-mon-${Date.now()}`,
    timestamp: timeString,
    stage: 'MONITOR',
    title: 'Active Operations Monitoring',
    description: isRecovered
      ? 'Observing new order intake and stock depletion rate under restored menu capacity.'
      : 'Agent is monitoring order velocity, inventory runout curve, and awaiting replenishment updates.',
    status: 'MONITORING',
  };
  db.addAgentEvent(monitorEvent);

  db.setLatestDecision(decisionRecord);

  return {
    observed: observeSummary,
    analysis: reasoningSummary,
    decision: decisionRecord,
    actionsExecuted: executedActions,
    eventsLogged: [observeEvent, analyzeEvent, decideEvent, monitorEvent],
  };
}
