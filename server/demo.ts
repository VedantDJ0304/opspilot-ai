/**
 * OpsPilot AI - 10-Step Interactive Demo Scenario Engine
 * 
 * Implements the complete hackathon judge demonstration:
 * 1. New orders arriving
 * 2. Consumption rate increases
 * 3. Risk detected (CRITICAL)
 * 4. AI analyzing situation
 * 5. Decision made
 * 6. Action executed (Menu items limited)
 * 7. Monitoring outcome
 * 8. Inventory updated (+8kg paneer stock audit)
 * 9. Risk reduced to NORMAL
 * 10. Menu availability restored (ADAPTATION)
 */

import { db } from './db.js';
import { runRiskEngine, calculateRunoutMinutes } from './calculations.js';
import { runAgentCycle } from './agent.js';
import { Order, AppNotification } from '../src/types.js';

export interface StepInfo {
  stepNumber: number;
  title: string;
  description: string;
}

export const DEMO_STEPS: StepInfo[] = [
  {
    stepNumber: 1,
    title: 'New Orders Arriving',
    description: 'A sudden burst of lunch rush orders arrives for paneer-heavy entrees.',
  },
  {
    stepNumber: 2,
    title: 'Consumption Rate Increased',
    description: 'Deterministic consumption calculation surges paneer rate from 0.8 kg/hr to 1.6 kg/hr (2× normal).',
  },
  {
    stepNumber: 3,
    title: 'Operational Risk Detected',
    description: 'Estimated runout drops below 45 minutes; risk engine elevates Paneer to CRITICAL.',
  },
  {
    stepNumber: 4,
    title: 'AI Analyzing Situation',
    description: 'OpsPilot AI observes the spike, calculates depletion trajectory, and evaluates mitigation alternatives.',
  },
  {
    stepNumber: 5,
    title: 'Decision Formulated',
    description: 'Agent decides to temporarily limit paneer-heavy items to preserve core stock.',
  },
  {
    stepNumber: 6,
    title: 'Autonomous Action Executed',
    description: 'Paneer Butter Masala, Paneer Tikka, and Paneer Biryani marked Limited across channels.',
  },
  {
    stepNumber: 7,
    title: 'Monitoring Outcome',
    description: 'Agent monitors real-time telemetry; paneer burn rate stabilizes and remaining stock is shielded.',
  },
  {
    stepNumber: 8,
    title: 'Inventory Restocked',
    description: 'Manager logs delivery of fresh dairy stock: +8.0 kg Paneer added to inventory baseline.',
  },
  {
    stepNumber: 9,
    title: 'Risk Metric Normalized',
    description: 'Recalculated runout exceeds 8 hours; risk engine clears CRITICAL status to NORMAL.',
  },
  {
    stepNumber: 10,
    title: 'Menu Availability Restored',
    description: 'AI adapts to recovered operational conditions and autonomously restores all dishes to Available.',
  },
];

export async function advanceDemoStep(targetStep?: number) {
  const state = db.getState();
  const current = state.demoState.currentStep;
  const nextStep = targetStep !== undefined ? targetStep : current >= 10 ? 1 : current + 1;
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  switch (nextStep) {
    case 1: {
      // Step 1: Simulate new orders
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: 1043,
        items: [
          {
            menuItemId: 'menu-pbm',
            menuItemName: 'Paneer Butter Masala',
            quantity: 3,
            unitPrice: 310,
            total: 930,
          },
          {
            menuItemId: 'menu-pt',
            menuItemName: 'Paneer Tikka',
            quantity: 2,
            unitPrice: 280,
            total: 560,
          },
        ],
        subtotal: 1490,
        tax: 74.5,
        total: 1564.5,
        status: 'Pending',
        createdAt: time,
        ingredientImpactSummary: 'Paneer -850g, Butter -90g, Cream -90ml, Tomato -300g',
        tableOrChannel: 'Dine-In Banquet',
      };
      db.addOrder(newOrder);
      break;
    }

    case 2: {
      // Step 2: Consumption rate increase
      const paneer = state.inventory.find((i) => i.ingredientId === 'ing-paneer');
      if (paneer) {
        paneer.estimatedStock = 2.1;
        paneer.consumptionRatePerHour = 1.6;
        paneer.estimatedRunoutMinutes = 45;
        db.updateInventoryItem(paneer);
      }
      break;
    }

    case 3: {
      // Step 3: Risk engine triggers CRITICAL
      const paneer = state.inventory.find((i) => i.ingredientId === 'ing-paneer');
      if (paneer) {
        paneer.riskLevel = 'CRITICAL';
        db.updateInventoryItem(paneer);
      }
      const newRisks = runRiskEngine(state.inventory, state.ingredients, state.settings.riskSensitivity);
      db.setRisks(newRisks);
      break;
    }

    case 4:
    case 5:
    case 6: {
      // Step 4, 5, 6: AI observation, decision, and autonomous action execution
      await runAgentCycle('Demonstration: Severe Paneer Surge');
      break;
    }

    case 7: {
      // Step 7: Monitoring stage
      db.addAgentEvent({
        id: `evt-mon-${Date.now()}`,
        timestamp: time,
        stage: 'MONITOR',
        title: 'Post-Action Inflow Stabilization',
        description: 'New incoming paneer order velocity decelerated by 65%. Available stock preserved at 2.1 kg.',
        status: 'MONITORING',
      });
      break;
    }

    case 8: {
      // Step 8: Manager logs stock arrival (+8kg)
      const paneer = state.inventory.find((i) => i.ingredientId === 'ing-paneer');
      if (paneer) {
        paneer.physicalBaselineStock = 10.1;
        paneer.estimatedStock = 10.1;
        paneer.consumptionRatePerHour = 0.9;
        paneer.estimatedRunoutMinutes = calculateRunoutMinutes(10.1, 0.9);
        paneer.riskLevel = 'NORMAL';
        paneer.lastCountAt = `${time} (Delivery Check)`;
        db.updateInventoryItem(paneer);

        db.addInventoryTransaction({
          id: `tx-restock-${Date.now()}`,
          timestamp: time,
          ingredientId: 'ing-paneer',
          ingredientName: 'Paneer (Cottage Cheese)',
          type: 'PURCHASE',
          delta: 8.0,
          unit: 'kg',
          balanceAfter: 10.1,
          note: 'Emergency stock replenishment verified by Manager Rajesh K.',
        });

        db.addNotification({
          id: `notif-restock-${Date.now()}`,
          title: 'Stock Replenished: Paneer +8.0 kg',
          message: 'Kitchen received dairy delivery. Total estimated stock now 10.1 kg.',
          type: 'SUCCESS',
          timestamp: time,
          read: false,
          actionLink: '/inventory',
        });
      }
      break;
    }

    case 9: {
      // Step 9: Risk engine evaluates new stock, resolves critical risk
      const risks = runRiskEngine(state.inventory, state.ingredients, state.settings.riskSensitivity);
      db.setRisks(risks);
      break;
    }

    case 10: {
      // Step 10: AI Adaptation: Restores menu items!
      await runAgentCycle('Demonstration: Stock Recovery & Restoration');
      break;
    }
  }

  const stepMeta = DEMO_STEPS[nextStep - 1] || DEMO_STEPS[0];
  db.setDemoState({
    currentStep: nextStep,
    stepTitle: `Step ${nextStep}: ${stepMeta.title}`,
    stepDescription: stepMeta.description,
    isSimulating: false,
  });

  return db.getState();
}
