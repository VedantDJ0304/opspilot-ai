/**
 * OpsPilot AI - Backend Server & API Routes
 * Express + Vite Full-Stack Application
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import {
  calculateOrderIngredientsConsumption,
  runRiskEngine,
  calculateRunoutMinutes,
} from './server/calculations.js';
import { runAgentCycle } from './server/agent.js';
import { advanceDemoStep } from './server/demo.js';
import { Order, OrderItem } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', product: 'OpsPilot AI', timestamp: new Date().toISOString() });
  });

  // Get full operational state
  app.get('/api/state', (req, res) => {
    res.json(db.getState());
  });

  // Reset database state to initial Spice Garden demo state
  app.post('/api/reset', (req, res) => {
    const freshState = db.reset();
    res.json({ success: true, state: freshState });
  });

  // Create new order
  app.post('/api/orders', async (req, res) => {
    try {
      const { items, tableOrChannel } = req.body as {
        items: OrderItem[];
        tableOrChannel?: string;
      };

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item.' });
      }

      const state = db.getState();
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // 1. Calculate totals
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.unitPrice * item.quantity;
      }
      const tax = Math.round(subtotal * 0.05 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      // 2. Calculate deterministic ingredient consumption
      const { impacts, summaryText } = calculateOrderIngredientsConsumption(
        items,
        state.menuItems,
        state.ingredients
      );

      const orderNumber = 1040 + state.orders.length + 1;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        items,
        subtotal,
        tax,
        total,
        status: 'Pending',
        createdAt: time,
        ingredientImpactSummary: summaryText,
        tableOrChannel: tableOrChannel || 'Dine-In Table 1',
      };

      // 3. Save order
      db.addOrder(newOrder);

      // 4. Deduct consumed ingredients from estimated stock & record transactions
      for (const impact of impacts) {
        const invItem = state.inventory.find((i) => i.ingredientId === impact.ingredientId);
        if (invItem) {
          const prevStock = invItem.estimatedStock;
          const newStock = Math.max(0, Math.round((prevStock - impact.consumedAmount) * 1000) / 1000);
          invItem.estimatedStock = newStock;
          // Dynamically increase consumption rate when under burst orders
          invItem.consumptionRatePerHour = Math.round((invItem.consumptionRatePerHour + 0.08) * 100) / 100;
          invItem.estimatedRunoutMinutes = calculateRunoutMinutes(newStock, invItem.consumptionRatePerHour);
          invItem.pendingDemandUnits += 1;
          db.updateInventoryItem(invItem);

          db.addInventoryTransaction({
            id: `tx-${Date.now()}-${impact.ingredientId}`,
            timestamp: time,
            ingredientId: impact.ingredientId,
            ingredientName: invItem.name,
            type: 'ORDER_CONSUMPTION',
            delta: -impact.consumedAmount,
            unit: impact.unit,
            balanceAfter: newStock,
            referenceId: newOrder.id,
            note: `Order #${orderNumber} consumption: ${impact.formattedText}`,
          });
        }
      }

      // 5. Re-run deterministic risk engine
      const updatedRisks = runRiskEngine(state.inventory, state.ingredients, state.settings.riskSensitivity);
      db.setRisks(updatedRisks);

      // 6. Trigger AI agent evaluation if active risks exist or burst detected
      if (state.settings.agentEnabled) {
        await runAgentCycle(`New Order #${orderNumber} received (${summaryText})`);
      }

      res.json({
        success: true,
        order: newOrder,
        state: db.getState(),
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: err.message || 'Failed to create order' });
    }
  });

  // Update order status
  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, order: updated, state: db.getState() });
  });

  // Inventory adjustment / physical stock count / delivery restock
  app.post('/api/inventory/adjust', async (req, res) => {
    try {
      const { ingredientId, delta, newPhysicalStock, type, note } = req.body;
      const state = db.getState();
      const invItem = state.inventory.find((i) => i.ingredientId === ingredientId);

      if (!invItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let balanceAfter = invItem.estimatedStock;
      if (newPhysicalStock !== undefined) {
        // Physical count baseline reset
        invItem.physicalBaselineStock = Number(newPhysicalStock);
        invItem.physicalBaselineTime = `${time} Today`;
        balanceAfter = Number(newPhysicalStock);
        invItem.estimatedStock = balanceAfter;
        invItem.lastCountAt = `${time} (Physical Audit)`;
      } else if (delta !== undefined) {
        balanceAfter = Math.max(0, Number((invItem.estimatedStock + Number(delta)).toFixed(3)));
        invItem.estimatedStock = balanceAfter;
      }

      // Recompute runout time
      invItem.estimatedRunoutMinutes = calculateRunoutMinutes(balanceAfter, invItem.consumptionRatePerHour);
      db.updateInventoryItem(invItem);

      // Record transaction
      db.addInventoryTransaction({
        id: `tx-adj-${Date.now()}`,
        timestamp: time,
        ingredientId,
        ingredientName: invItem.name,
        type: type || 'MANUAL_ADJUSTMENT',
        delta: Number(delta ?? (balanceAfter - invItem.estimatedStock)),
        unit: invItem.unit,
        balanceAfter,
        note: note || `Stock update by Manager Rajesh K.`,
      });

      // Recalculate risks
      const updatedRisks = runRiskEngine(state.inventory, state.ingredients, state.settings.riskSensitivity);
      db.setRisks(updatedRisks);

      // Trigger AI Agent to evaluate & adapt
      if (state.settings.agentEnabled) {
        await runAgentCycle(`Inventory adjusted on ${invItem.name}: new stock ${balanceAfter} ${invItem.unit}`);
      }

      res.json({ success: true, state: db.getState() });
    } catch (err: any) {
      console.error('Error adjusting inventory:', err);
      res.status(500).json({ error: err.message || 'Inventory adjustment failed' });
    }
  });

  // Update menu item availability or pricing
  app.patch('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    const { availabilityStatus, price, limitedReason } = req.body;
    const state = db.getState();
    const item = state.menuItems.find((m) => m.id === id);

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    if (availabilityStatus) item.availabilityStatus = availabilityStatus;
    if (price !== undefined) item.price = Number(price);
    if (limitedReason !== undefined) item.limitedReason = limitedReason;

    db.updateMenuItem(item);
    res.json({ success: true, menuItem: item, state: db.getState() });
  });

  // Run AI Agent manually
  app.post('/api/agent/run', async (req, res) => {
    try {
      const { trigger } = req.body;
      const result = await runAgentCycle(trigger || 'Manager requested operational analysis');
      res.json({ success: true, result, state: db.getState() });
    } catch (err: any) {
      console.error('Agent run failed:', err);
      res.status(500).json({ error: err.message || 'Agent cycle failed' });
    }
  });

  // Advance Demo Scenario Step
  app.post('/api/agent/demo-step', async (req, res) => {
    try {
      const { step } = req.body;
      const updatedState = await advanceDemoStep(step);
      res.json({ success: true, state: updatedState });
    } catch (err: any) {
      console.error('Demo step failed:', err);
      res.status(500).json({ error: err.message || 'Demo step progression failed' });
    }
  });

  // Update Settings
  app.patch('/api/settings', (req, res) => {
    const settingsUpdate = req.body;
    db.updateSettings(settingsUpdate);
    res.json({ success: true, settings: db.getState().settings });
  });

  // Mark notifications read
  app.post('/api/notifications/mark-read', (req, res) => {
    const state = db.getState();
    state.notifications.forEach((n) => (n.read = true));
    res.json({ success: true });
  });

  // ----------------------------------------------------
  // Vite Middleware Setup
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OpsPilot AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
