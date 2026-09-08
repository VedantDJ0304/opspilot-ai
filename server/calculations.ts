/**
 * OpsPilot AI - Deterministic Restaurant Operations Calculation Engine
 * 
 * Mandate: NEVER pretend that an LLM is doing deterministic arithmetic.
 * Normal application code must calculate:
 * - Ingredient consumption
 * - Current estimated inventory
 * - Consumption rate
 * - Runout time
 * - Order totals
 * - Risk metrics
 */

import {
  MenuItem,
  OrderItem,
  InventoryItem,
  OperationalRisk,
  RiskLevel,
  Ingredient,
} from '../src/types.js';

export interface IngredientConsumptionImpact {
  ingredientId: string;
  ingredientName: string;
  consumedAmount: number; // in base unit (kg or L)
  unit: string;
  formattedText: string;
}

/**
 * Calculates exact ingredient consumption for a list of order items based on registered recipes.
 */
export function calculateOrderIngredientsConsumption(
  items: OrderItem[],
  menuItems: MenuItem[],
  ingredients: Ingredient[]
): {
  impacts: IngredientConsumptionImpact[];
  summaryText: string;
} {
  const consumptionMap = new Map<string, number>();

  for (const item of items) {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    if (!menuItem || !menuItem.recipe) continue;

    for (const recipeItem of menuItem.recipe) {
      const current = consumptionMap.get(recipeItem.ingredientId) || 0;
      // amount is per serving; multiply by order item quantity
      consumptionMap.set(
        recipeItem.ingredientId,
        current + recipeItem.amount * item.quantity
      );
    }
  }

  const impacts: IngredientConsumptionImpact[] = [];
  const textParts: string[] = [];

  consumptionMap.forEach((amount, ingredientId) => {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    const name = ingredient ? ingredient.name.split(' ')[0] : ingredientId;
    const unit = ingredient ? ingredient.unit : 'kg';

    let formatted = '';
    if (unit === 'kg' && amount < 1.0) {
      formatted = `${name} -${Math.round(amount * 1000)}g`;
    } else if (unit === 'L' && amount < 1.0) {
      formatted = `${name} -${Math.round(amount * 1000)}ml`;
    } else {
      formatted = `${name} -${amount.toFixed(2)}${unit}`;
    }

    textParts.push(formatted);
    impacts.push({
      ingredientId,
      ingredientName: ingredient ? ingredient.name : ingredientId,
      consumedAmount: Math.round(amount * 1000) / 1000,
      unit,
      formattedText: formatted,
    });
  });

  return {
    impacts,
    summaryText: textParts.length > 0 ? textParts.join(', ') : 'No tracked ingredient impact',
  };
}

/**
 * Computes estimated inventory runout time in minutes.
 * Formula: (Estimated Stock / Consumption Rate) * 60 minutes.
 */
export function calculateRunoutMinutes(
  estimatedStock: number,
  consumptionRatePerHour: number
): number {
  if (consumptionRatePerHour <= 0) return 999;
  if (estimatedStock <= 0) return 0;
  const hours = estimatedStock / consumptionRatePerHour;
  return Math.max(0, Math.round(hours * 60));
}

/**
 * Evaluates operational risk level for an inventory ingredient deterministically.
 */
export function evaluateIngredientRisk(
  item: InventoryItem,
  ingredient: Ingredient | undefined,
  sensitivity: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
): {
  riskLevel: RiskLevel;
  message: string;
} {
  const runout = item.estimatedRunoutMinutes;
  const rateRatio =
    item.normalRatePerHour > 0 ? item.consumptionRatePerHour / item.normalRatePerHour : 1.0;
  const isBelowMin = ingredient ? item.estimatedStock < ingredient.minThreshold : false;

  // Sensitivity multiplier adjustments
  let criticalMinutesThreshold = 60;
  let warningMinutesThreshold = 180;

  if (sensitivity === 'aggressive') {
    criticalMinutesThreshold = 90;
    warningMinutesThreshold = 240;
  } else if (sensitivity === 'conservative') {
    criticalMinutesThreshold = 45;
    warningMinutesThreshold = 120;
  }

  // Critical conditions
  if (runout <= criticalMinutesThreshold || (isBelowMin && rateRatio >= 1.5)) {
    return {
      riskLevel: 'CRITICAL',
      message: `${item.name} may run out in approximately ${runout} minutes. Consumption rate is ${rateRatio.toFixed(1)}× normal.`,
    };
  }

  // Warning conditions
  if (runout <= warningMinutesThreshold || rateRatio >= 1.4 || isBelowMin) {
    return {
      riskLevel: 'WARNING',
      message: `${item.name} consumption elevated (${rateRatio.toFixed(1)}× baseline). Estimated runout in ${Math.floor(runout / 60)}h ${runout % 60}m.`,
    };
  }

  // Low conditions
  if (runout <= 360 || rateRatio >= 1.15) {
    return {
      riskLevel: 'LOW',
      message: `${item.name} stock stable but consumption mildly active (${rateRatio.toFixed(1)}× baseline).`,
    };
  }

  return {
    riskLevel: 'NORMAL',
    message: `${item.name} inventory healthy. Adequate stock for current operations.`,
  };
}

/**
 * Runs the deterministic operational risk engine across all inventory items.
 */
export function runRiskEngine(
  inventory: InventoryItem[],
  ingredients: Ingredient[],
  sensitivity: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
): OperationalRisk[] {
  const risks: OperationalRisk[] = [];

  for (const item of inventory) {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    const evaluation = evaluateIngredientRisk(item, ingredient, sensitivity);

    if (evaluation.riskLevel === 'CRITICAL' || evaluation.riskLevel === 'WARNING') {
      risks.push({
        id: `risk-${item.ingredientId}-${Date.now()}`,
        ingredientId: item.ingredientId,
        ingredientName: item.name,
        riskLevel: evaluation.riskLevel,
        detectedAt: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        currentStock: item.estimatedStock,
        unit: item.unit,
        runoutMinutes: item.estimatedRunoutMinutes,
        consumptionRate: item.consumptionRatePerHour,
        normalRate: item.normalRatePerHour,
        pendingOrdersCount: item.pendingDemandUnits,
        message: evaluation.message,
        status: 'ACTIVE',
      });
    }
  }

  return risks;
}
