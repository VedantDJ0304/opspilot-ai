/**
 * OpsPilot AI - In-Memory Database & Seed State
 * Provides full relational persistence for the application session.
 */

import {
  Ingredient,
  MenuItem,
  InventoryItem,
  InventoryTransaction,
  Order,
  OperationalRisk,
  AgentEvent,
  AgentDecision,
  AppNotification,
  AgentSettings,
  DemoStepState,
  OperationalState,
} from '../src/types.js';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-paneer',
    name: 'Paneer (Cottage Cheese)',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 3.0,
    normalRatePerHour: 0.8,
    costPerUnit: 340,
  },
  {
    id: 'ing-tomato',
    name: 'Tomato (Fresh Farm)',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 3.0,
    normalRatePerHour: 1.7,
    costPerUnit: 42,
  },
  {
    id: 'ing-cream',
    name: 'Fresh Dairy Cream',
    unit: 'L',
    displayUnit: 'L',
    minThreshold: 2.0,
    normalRatePerHour: 0.9,
    costPerUnit: 220,
  },
  {
    id: 'ing-rice',
    name: 'Royal Basmati Rice',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 5.0,
    normalRatePerHour: 4.0,
    costPerUnit: 95,
  },
  {
    id: 'ing-butter',
    name: 'Amul Butter',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 1.5,
    normalRatePerHour: 0.5,
    costPerUnit: 520,
  },
  {
    id: 'ing-flour',
    name: 'Wheat & Maida Flour',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 5.0,
    normalRatePerHour: 2.5,
    costPerUnit: 48,
  },
  {
    id: 'ing-spices',
    name: 'Spices & Garam Masala',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 1.0,
    normalRatePerHour: 0.3,
    costPerUnit: 640,
  },
  {
    id: 'ing-dal',
    name: 'Toor Dal (Pigeon Pea)',
    unit: 'kg',
    displayUnit: 'kg',
    minThreshold: 3.0,
    normalRatePerHour: 1.2,
    costPerUnit: 165,
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-pbm',
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 310,
    availabilityStatus: 'LIMITED',
    limitedReason: 'OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.',
    prepTimeMinutes: 18,
    recipe: [
      { ingredientId: 'ing-paneer', amount: 0.15, unit: 'kg' }, // 150g
      { ingredientId: 'ing-butter', amount: 0.02, unit: 'kg' }, // 20g
      { ingredientId: 'ing-cream', amount: 0.03, unit: 'L' },   // 30ml
      { ingredientId: 'ing-tomato', amount: 0.10, unit: 'kg' }, // 100g
      { ingredientId: 'ing-spices', amount: 0.01, unit: 'kg' }, // 10g
    ],
  },
  {
    id: 'menu-pt',
    name: 'Paneer Tikka',
    category: 'Starters',
    price: 280,
    availabilityStatus: 'LIMITED',
    limitedReason: 'OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.',
    prepTimeMinutes: 15,
    recipe: [
      { ingredientId: 'ing-paneer', amount: 0.20, unit: 'kg' }, // 200g
      { ingredientId: 'ing-butter', amount: 0.015, unit: 'kg' },
      { ingredientId: 'ing-spices', amount: 0.02, unit: 'kg' },
    ],
  },
  {
    id: 'menu-pb',
    name: 'Paneer Dum Biryani',
    category: 'Rice & Biryani',
    price: 340,
    availabilityStatus: 'LIMITED',
    limitedReason: 'OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.',
    prepTimeMinutes: 22,
    recipe: [
      { ingredientId: 'ing-paneer', amount: 0.12, unit: 'kg' }, // 120g
      { ingredientId: 'ing-rice', amount: 0.20, unit: 'kg' },   // 200g
      { ingredientId: 'ing-butter', amount: 0.025, unit: 'kg' },
      { ingredientId: 'ing-spices', amount: 0.015, unit: 'kg' },
    ],
  },
  {
    id: 'menu-thali',
    name: 'Special Veg Thali',
    category: 'Thalis',
    price: 260,
    availabilityStatus: 'AVAILABLE',
    prepTimeMinutes: 15,
    recipe: [
      { ingredientId: 'ing-paneer', amount: 0.05, unit: 'kg' }, // 50g
      { ingredientId: 'ing-dal', amount: 0.10, unit: 'kg' },
      { ingredientId: 'ing-rice', amount: 0.15, unit: 'kg' },
      { ingredientId: 'ing-flour', amount: 0.10, unit: 'kg' },
      { ingredientId: 'ing-tomato', amount: 0.05, unit: 'kg' },
    ],
  },
  {
    id: 'menu-dt',
    name: 'Dal Tadka Special',
    category: 'Main Course',
    price: 190,
    availabilityStatus: 'AVAILABLE',
    prepTimeMinutes: 12,
    recipe: [
      { ingredientId: 'ing-dal', amount: 0.15, unit: 'kg' },
      { ingredientId: 'ing-tomato', amount: 0.08, unit: 'kg' },
      { ingredientId: 'ing-butter', amount: 0.02, unit: 'kg' },
      { ingredientId: 'ing-spices', amount: 0.01, unit: 'kg' },
    ],
  },
  {
    id: 'menu-vb',
    name: 'Subz Veg Biryani',
    category: 'Rice & Biryani',
    price: 240,
    availabilityStatus: 'AVAILABLE',
    prepTimeMinutes: 20,
    recipe: [
      { ingredientId: 'ing-rice', amount: 0.25, unit: 'kg' },
      { ingredientId: 'ing-tomato', amount: 0.06, unit: 'kg' },
      { ingredientId: 'ing-butter', amount: 0.02, unit: 'kg' },
      { ingredientId: 'ing-spices', amount: 0.015, unit: 'kg' },
    ],
  },
  {
    id: 'menu-bn',
    name: 'Butter Naan',
    category: 'Breads',
    price: 60,
    availabilityStatus: 'AVAILABLE',
    prepTimeMinutes: 8,
    recipe: [
      { ingredientId: 'ing-flour', amount: 0.12, unit: 'kg' },
      { ingredientId: 'ing-butter', amount: 0.025, unit: 'kg' },
    ],
  },
  {
    id: 'menu-roti',
    name: 'Tandoori Roti (Butter)',
    category: 'Breads',
    price: 30,
    availabilityStatus: 'AVAILABLE',
    prepTimeMinutes: 6,
    recipe: [
      { ingredientId: 'ing-flour', amount: 0.10, unit: 'kg' },
      { ingredientId: 'ing-butter', amount: 0.005, unit: 'kg' },
    ],
  },
  {
    id: 'menu-jr',
    name: 'Jeera Basmati Rice',
    category: 'Rice & Biryani',
    price: 150,
    availabilityStatus: 'AVAILABLE',
    prepTimeMinutes: 10,
    recipe: [
      { ingredientId: 'ing-rice', amount: 0.20, unit: 'kg' },
      { ingredientId: 'ing-butter', amount: 0.015, unit: 'kg' },
      { ingredientId: 'ing-spices', amount: 0.005, unit: 'kg' },
    ],
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    ingredientId: 'ing-paneer',
    name: 'Paneer (Cottage Cheese)',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 10.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 2.1,
    consumptionRatePerHour: 1.6, // 2x normal rate!
    normalRatePerHour: 0.8,
    pendingDemandUnits: 8,
    estimatedRunoutMinutes: 45, // 2.1 / 1.6 * 60 min approx ~ 45-78 min based on pending queue
    riskLevel: 'CRITICAL',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-tomato',
    name: 'Tomato (Fresh Farm)',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 15.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 4.8,
    consumptionRatePerHour: 2.1,
    normalRatePerHour: 1.7,
    pendingDemandUnits: 4,
    estimatedRunoutMinutes: 110, // ~1h 50m
    riskLevel: 'WARNING',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-cream',
    name: 'Fresh Dairy Cream',
    unit: 'L',
    displayUnit: 'L',
    physicalBaselineStock: 8.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 3.2,
    consumptionRatePerHour: 1.1,
    normalRatePerHour: 0.9,
    pendingDemandUnits: 3,
    estimatedRunoutMinutes: 175, // ~2h 55m
    riskLevel: 'WARNING',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-rice',
    name: 'Royal Basmati Rice',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 35.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 18.0,
    consumptionRatePerHour: 4.2,
    normalRatePerHour: 4.0,
    pendingDemandUnits: 5,
    estimatedRunoutMinutes: 255, // ~4h 15m
    riskLevel: 'NORMAL',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-butter',
    name: 'Amul Butter',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 8.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 4.5,
    consumptionRatePerHour: 0.6,
    normalRatePerHour: 0.5,
    pendingDemandUnits: 4,
    estimatedRunoutMinutes: 450,
    riskLevel: 'NORMAL',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-flour',
    name: 'Wheat & Maida Flour',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 25.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 16.2,
    consumptionRatePerHour: 2.6,
    normalRatePerHour: 2.5,
    pendingDemandUnits: 6,
    estimatedRunoutMinutes: 370,
    riskLevel: 'NORMAL',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-spices',
    name: 'Spices & Garam Masala',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 6.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 4.8,
    consumptionRatePerHour: 0.35,
    normalRatePerHour: 0.3,
    pendingDemandUnits: 4,
    estimatedRunoutMinutes: 820,
    riskLevel: 'NORMAL',
    lastCountAt: 'Today, 08:00 AM',
  },
  {
    ingredientId: 'ing-dal',
    name: 'Toor Dal (Pigeon Pea)',
    unit: 'kg',
    displayUnit: 'kg',
    physicalBaselineStock: 14.0,
    physicalBaselineTime: '08:00 AM Today',
    estimatedStock: 9.4,
    consumptionRatePerHour: 1.3,
    normalRatePerHour: 1.2,
    pendingDemandUnits: 3,
    estimatedRunoutMinutes: 430,
    riskLevel: 'NORMAL',
    lastCountAt: 'Today, 08:00 AM',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1042',
    orderNumber: 1042,
    items: [
      {
        menuItemId: 'menu-pbm',
        menuItemName: 'Paneer Butter Masala',
        quantity: 2,
        unitPrice: 310,
        total: 620,
      },
      {
        menuItemId: 'menu-bn',
        menuItemName: 'Butter Naan',
        quantity: 2,
        unitPrice: 60,
        total: 120,
      },
    ],
    subtotal: 740,
    tax: 37,
    total: 777,
    status: 'Preparing',
    createdAt: '10:42 AM',
    ingredientImpactSummary: 'Paneer -300g, Butter -90g, Cream -60ml, Tomato -200g, Flour -240g',
    tableOrChannel: 'Dine-In Table 4',
  },
  {
    id: 'ord-1041',
    orderNumber: 1041,
    items: [
      {
        menuItemId: 'menu-pt',
        menuItemName: 'Paneer Tikka',
        quantity: 2,
        unitPrice: 280,
        total: 560,
      },
      {
        menuItemId: 'menu-pb',
        menuItemName: 'Paneer Dum Biryani',
        quantity: 1,
        unitPrice: 340,
        total: 340,
      },
    ],
    subtotal: 900,
    tax: 45,
    total: 945,
    status: 'Pending',
    createdAt: '10:38 AM',
    ingredientImpactSummary: 'Paneer -520g, Rice -200g, Butter -55g, Spices -55g',
    tableOrChannel: 'Dine-In Table 7',
  },
  {
    id: 'ord-1040',
    orderNumber: 1040,
    items: [
      {
        menuItemId: 'menu-pbm',
        menuItemName: 'Paneer Butter Masala',
        quantity: 1,
        unitPrice: 310,
        total: 310,
      },
      {
        menuItemId: 'menu-thali',
        menuItemName: 'Special Veg Thali',
        quantity: 2,
        unitPrice: 260,
        total: 520,
      },
    ],
    subtotal: 830,
    tax: 41.5,
    total: 871.5,
    status: 'Preparing',
    createdAt: '10:34 AM',
    ingredientImpactSummary: 'Paneer -250g, Dal -200g, Rice -300g, Flour -200g, Tomato -200g',
    tableOrChannel: 'Dine-In Table 2',
  },
  {
    id: 'ord-1039',
    orderNumber: 1039,
    items: [
      {
        menuItemId: 'menu-dt',
        menuItemName: 'Dal Tadka Special',
        quantity: 1,
        unitPrice: 190,
        total: 190,
      },
      {
        menuItemId: 'menu-jr',
        menuItemName: 'Jeera Basmati Rice',
        quantity: 1,
        unitPrice: 150,
        total: 150,
      },
      {
        menuItemId: 'menu-roti',
        menuItemName: 'Tandoori Roti (Butter)',
        quantity: 3,
        unitPrice: 30,
        total: 90,
      },
    ],
    subtotal: 430,
    tax: 21.5,
    total: 451.5,
    status: 'Ready',
    createdAt: '10:28 AM',
    ingredientImpactSummary: 'Dal -150g, Rice -200g, Flour -300g, Tomato -80g, Butter -50g',
    tableOrChannel: 'Takeaway #12',
  },
  {
    id: 'ord-1038',
    orderNumber: 1038,
    items: [
      {
        menuItemId: 'menu-vb',
        menuItemName: 'Subz Veg Biryani',
        quantity: 2,
        unitPrice: 240,
        total: 480,
      },
    ],
    subtotal: 480,
    tax: 24,
    total: 504,
    status: 'Completed',
    createdAt: '10:15 AM',
    ingredientImpactSummary: 'Rice -500g, Tomato -120g, Butter -40g, Spices -30g',
    tableOrChannel: 'Swiggy Online',
  },
  {
    id: 'ord-1037',
    orderNumber: 1037,
    items: [
      {
        menuItemId: 'menu-pbm',
        menuItemName: 'Paneer Butter Masala',
        quantity: 3,
        unitPrice: 310,
        total: 930,
      },
      {
        menuItemId: 'menu-bn',
        menuItemName: 'Butter Naan',
        quantity: 6,
        unitPrice: 60,
        total: 360,
      },
    ],
    subtotal: 1290,
    tax: 64.5,
    total: 1354.5,
    status: 'Completed',
    createdAt: '10:02 AM',
    ingredientImpactSummary: 'Paneer -450g, Butter -210g, Cream -90ml, Tomato -300g, Flour -720g',
    tableOrChannel: 'Zomato Online',
  },
];

export const INITIAL_RISKS: OperationalRisk[] = [
  {
    id: 'risk-paneer-critical',
    ingredientId: 'ing-paneer',
    ingredientName: 'Paneer (Cottage Cheese)',
    riskLevel: 'CRITICAL',
    detectedAt: '10:41 AM',
    currentStock: 2.1,
    unit: 'kg',
    runoutMinutes: 45,
    consumptionRate: 1.6,
    normalRate: 0.8,
    pendingOrdersCount: 8,
    message: 'Paneer may run out in approximately 45 minutes due to 2× demand surge.',
    status: 'ACTIVE',
  },
  {
    id: 'risk-tomato-warning',
    ingredientId: 'ing-tomato',
    ingredientName: 'Tomato (Fresh Farm)',
    riskLevel: 'WARNING',
    detectedAt: '10:35 AM',
    currentStock: 4.8,
    unit: 'kg',
    runoutMinutes: 110,
    consumptionRate: 2.1,
    normalRate: 1.7,
    pendingOrdersCount: 4,
    message: 'Tomato consumption elevated (+24% above baseline). Stock covers ~1h 50m.',
    status: 'ACTIVE',
  },
];

export const INITIAL_AGENT_DECISION: AgentDecision = {
  id: 'dec-1041-paneer',
  timestamp: '10:41 AM',
  goal: 'Prevent paneer stockout and safeguard service continuity.',
  trigger: 'Paneer consumption rate reached 1.6 kg/hr (2.0× baseline), estimated runout under 45 minutes with 8 pending orders.',
  context: {
    ingredientName: 'Paneer',
    stock: 2.1,
    unit: 'kg',
    consumptionRate: 1.6,
    normalRate: 0.8,
    pendingOrders: 8,
    runoutMinutes: 45,
  },
  availableAlternatives: [
    'Limit paneer-heavy dishes (Targeted mitigation)',
    'Disable all paneer menu items immediately (Heavy disruption)',
    'Send urgent procurement alert to kitchen manager without menu changes',
    'Continue monitoring without operational intervention',
  ],
  decision: 'Temporarily limit paneer-heavy dishes and dispatch replenishment alert.',
  reason: 'Current demand is approximately 2× normal consumption and available stock cannot satisfy pending and projected lunch surge. Limiting menu items preserves remaining 2.1 kg for high-margin pending orders while allowing other dishes to sell.',
  action: 'LIMIT_MENU_ITEM',
  actionParams: {
    menuItemIds: ['menu-pbm', 'menu-pt', 'menu-pb'],
    status: 'LIMITED',
    reason: 'OpsPilot Autonomous Guard: Limited to conserve paneer stock during peak spike.',
  },
  result: '3 paneer-heavy dishes marked as Limited Availability. New incoming paneer order velocity decelerated by 65%.',
  status: 'Monitoring',
};

export const INITIAL_AGENT_EVENTS: AgentEvent[] = [
  {
    id: 'evt-6',
    timestamp: '10:42 AM',
    stage: 'MONITOR',
    title: 'Monitoring Order Inflow & Stock Stabilization',
    description: 'Agent is observing post-action order velocity and inventory runout trajectory.',
    inputData: { paneerStockKg: 2.1, pendingOrders: 8, status: 'Active Watch' },
    status: 'MONITORING',
  },
  {
    id: 'evt-5',
    timestamp: '10:41 AM',
    stage: 'ACT',
    title: 'Autonomous Action: Limited Paneer-Heavy Menu Items',
    description: 'Executed LIMIT_MENU_ITEM on Paneer Butter Masala, Paneer Tikka, and Paneer Biryani.',
    action: 'LIMIT_MENU_ITEM',
    actionTarget: 'Paneer Butter Masala, Paneer Tikka, Paneer Biryani',
    result: 'Menu availability updated in real-time. POS and digital channels restricted.',
    status: 'COMPLETED',
  },
  {
    id: 'evt-4',
    timestamp: '10:41 AM',
    stage: 'DECIDE',
    title: 'Decision: Limit Paneer Dishes to Prevent Full Outage',
    description: 'Determined high probability of paneer stockout within 45 minutes; selected targeted menu limiting.',
    decision: 'Temporarily limit paneer-heavy dishes while notifying manager.',
    status: 'COMPLETED',
  },
  {
    id: 'evt-3',
    timestamp: '10:41 AM',
    stage: 'ANALYZE',
    title: 'Consumption Surge Analysis (+100% vs Baseline)',
    description: 'Current paneer consumption of 1.6 kg/hr is exactly double normal rate of 0.8 kg/hr.',
    inputData: { currentRate: 1.6, normalRate: 0.8, ratio: '2.0x', runoutMinutes: 45 },
    status: 'COMPLETED',
  },
  {
    id: 'evt-2',
    timestamp: '10:40 AM',
    stage: 'OBSERVE',
    title: 'Operational Inflow Spike Detected',
    description: '8 new orders received in the last 20 minutes with high concentration in paneer entrees.',
    inputData: { batchOrders: 8, paneerImpactGrams: 1450 },
    status: 'COMPLETED',
  },
  {
    id: 'evt-1',
    timestamp: '08:00 AM',
    stage: 'OBSERVE',
    title: 'Morning Baseline Stock Registered',
    description: 'Manager logged physical opening inventory count: Paneer 10.0kg, Tomato 15.0kg, Rice 35.0kg.',
    inputData: { paneerBaselineKg: 10.0, status: 'Normal Start' },
    status: 'COMPLETED',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical Inventory Risk: Paneer',
    message: 'Estimated runout in 45 minutes. Current consumption (1.6 kg/hr) exceeds baseline (0.8 kg/hr).',
    type: 'CRITICAL',
    timestamp: '10:41 AM',
    read: false,
    actionLink: '/ai-operations',
  },
  {
    id: 'notif-2',
    title: 'Autonomous Action Executed',
    message: 'OpsPilot marked 3 paneer-heavy dishes as Limited Availability to prevent total stockout.',
    type: 'WARNING',
    timestamp: '10:41 AM',
    read: false,
    actionLink: '/menu',
  },
  {
    id: 'notif-3',
    title: 'Tomato Consumption Warning',
    message: 'Tomato rate elevated at 2.1 kg/hr. Stock sufficient for approximately 1h 50m.',
    type: 'INFO',
    timestamp: '10:35 AM',
    read: true,
    actionLink: '/inventory',
  },
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-1',
    timestamp: '10:42 AM',
    ingredientId: 'ing-paneer',
    ingredientName: 'Paneer (Cottage Cheese)',
    type: 'ORDER_CONSUMPTION',
    delta: -0.3,
    unit: 'kg',
    balanceAfter: 2.1,
    referenceId: 'ord-1042',
    note: 'Consumption from Order #1042 (2x Paneer Butter Masala)',
  },
  {
    id: 'tx-2',
    timestamp: '10:38 AM',
    ingredientId: 'ing-paneer',
    ingredientName: 'Paneer (Cottage Cheese)',
    type: 'ORDER_CONSUMPTION',
    delta: -0.52,
    unit: 'kg',
    balanceAfter: 2.4,
    referenceId: 'ord-1041',
    note: 'Consumption from Order #1041 (2x Paneer Tikka, 1x Paneer Biryani)',
  },
  {
    id: 'tx-3',
    timestamp: '10:34 AM',
    ingredientId: 'ing-paneer',
    ingredientName: 'Paneer (Cottage Cheese)',
    type: 'ORDER_CONSUMPTION',
    delta: -0.25,
    unit: 'kg',
    balanceAfter: 2.92,
    referenceId: 'ord-1040',
    note: 'Consumption from Order #1040 (1x Paneer Butter Masala, 2x Thali)',
  },
  {
    id: 'tx-4',
    timestamp: '10:02 AM',
    ingredientId: 'ing-paneer',
    ingredientName: 'Paneer (Cottage Cheese)',
    type: 'ORDER_CONSUMPTION',
    delta: -0.45,
    unit: 'kg',
    balanceAfter: 3.17,
    referenceId: 'ord-1037',
    note: 'Consumption from Order #1037 (3x Paneer Butter Masala)',
  },
  {
    id: 'tx-0',
    timestamp: '08:00 AM',
    ingredientId: 'ing-paneer',
    ingredientName: 'Paneer (Cottage Cheese)',
    type: 'INITIAL',
    delta: 10.0,
    unit: 'kg',
    balanceAfter: 10.0,
    referenceId: 'baseline-init',
    note: 'Physical morning stock audit by Manager Rajesh K.',
  },
];

export const INITIAL_SETTINGS: AgentSettings = {
  agentEnabled: true,
  monitoringFrequencyMinutes: 1,
  riskSensitivity: 'balanced',
  permissions: {
    notifyManager: true,
    limitMenuItems: true,
    disableMenuItems: false,
    restoreMenuItems: true,
    replenishmentAlerts: true,
  },
  operatingHours: '11:00 AM - 11:30 PM',
  restaurantName: 'Spice Garden',
  currencySymbol: '₹',
};

export const INITIAL_DEMO_STATE: DemoStepState = {
  currentStep: 6, // Starting at "Action executed" showing the alert active and menu limited!
  totalSteps: 10,
  stepTitle: 'Step 6: Autonomous Action Executed',
  stepDescription: 'Paneer-heavy items marked Limited Availability. Agent is currently monitoring recovery.',
  isSimulating: false,
};

export const INITIAL_INCIDENTS = [
  {
    id: 'inc-01',
    date: 'Yesterday, 14:15 PM',
    ingredientName: 'Fresh Dairy Cream',
    cause: 'Party hall catering booked 12 Dal Makhani & 8 Butter Chicken without advance notice.',
    actionTaken: 'Limited cream-heavy portioning & dispatched runner restock alert to Amul distributor.',
    outcome: 'Stock preserved for evening service without running dry. Restocked at 16:00 PM.',
    status: 'RESOLVED' as const,
  },
  {
    id: 'inc-02',
    date: '3 days ago, 20:30 PM',
    ingredientName: 'Basmati Biryani Rice',
    cause: 'Heavy Friday dinner online delivery surge (28 biryanis in 45 minutes).',
    actionTaken: 'Autonomously set Dum Biryani to LIMITED to protect dine-in orders.',
    outcome: 'Zero kitchen stockout disputes. Dine-in tables served without cancellation.',
    status: 'RESOLVED' as const,
  },
  {
    id: 'inc-03',
    date: 'Today, 10:45 AM',
    ingredientName: 'Paneer (Fresh Malai)',
    cause: 'Abnormal lunch rush surge: 8 orders in 20 minutes (2x normal burn rate).',
    actionTaken: 'Limited Paneer Butter Masala, Tikka & Biryani dishes to protect pending queue.',
    outcome: 'Active operational throttling in effect. Awaiting dairy batch restock.',
    status: 'ACTIVE' as const,
  },
];

// Mutable runtime state store
class DatabaseStore {
  private state: OperationalState;

  constructor() {
    this.state = this.createDefaultState();
  }

  private createDefaultState(): OperationalState {
    return {
      restaurant: {
        name: 'Spice Garden',
        tagline: 'Autonomous AI Operations for Restaurants',
        location: 'Sector 14, Nashik, Maharashtra',
        manager: 'Rajesh Kulkarni',
        status: 'Operational',
      },
      ingredients: JSON.parse(JSON.stringify(INITIAL_INGREDIENTS)),
      inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
      inventoryTransactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
      menuItems: JSON.parse(JSON.stringify(INITIAL_MENU_ITEMS)),
      orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
      risks: JSON.parse(JSON.stringify(INITIAL_RISKS)),
      agentEvents: JSON.parse(JSON.stringify(INITIAL_AGENT_EVENTS)),
      latestDecision: JSON.parse(JSON.stringify(INITIAL_AGENT_DECISION)),
      decisionHistory: [JSON.parse(JSON.stringify(INITIAL_AGENT_DECISION))],
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      settings: JSON.parse(JSON.stringify(INITIAL_SETTINGS)),
      demoState: JSON.parse(JSON.stringify(INITIAL_DEMO_STATE)),
      incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
      metrics: {
        todayOrdersCount: 142,
        pendingOrdersCount: 8,
        activeRisksCount: 2,
        agentActionsTodayCount: 7,
        criticalShortageIngredient: 'Paneer',
        criticalShortageTimeMinutes: 45,
      },
    };
  }

  public getState(): OperationalState {
    this.refreshMetrics();
    return this.state;
  }

  public reset(): OperationalState {
    this.state = this.createDefaultState();
    return this.state;
  }

  public refreshMetrics(): void {
    const pendingOrders = this.state.orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Preparing'
    ).length;
    const activeRisks = this.state.risks.filter((r) => r.status === 'ACTIVE').length;
    const actionsToday = this.state.agentEvents.filter(
      (e) => e.stage === 'ACT' || e.stage === 'ADAPT'
    ).length;

    const criticalRisk = this.state.risks.find(
      (r) => r.riskLevel === 'CRITICAL' && r.status === 'ACTIVE'
    );

    this.state.metrics = {
      todayOrdersCount: 138 + this.state.orders.length,
      pendingOrdersCount: pendingOrders,
      activeRisksCount: activeRisks,
      agentActionsTodayCount: actionsToday,
      criticalShortageIngredient: criticalRisk ? criticalRisk.ingredientName : undefined,
      criticalShortageTimeMinutes: criticalRisk ? criticalRisk.runoutMinutes : undefined,
    };
  }

  // Mutators
  public addOrder(order: Order): void {
    this.state.orders.unshift(order);
    this.refreshMetrics();
  }

  public updateOrderStatus(orderId: string, status: Order['status']): Order | undefined {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      this.refreshMetrics();
    }
    return order;
  }

  public updateInventoryItem(item: InventoryItem): void {
    const idx = this.state.inventory.findIndex((i) => i.ingredientId === item.ingredientId);
    if (idx >= 0) {
      this.state.inventory[idx] = item;
    } else {
      this.state.inventory.push(item);
    }
    this.refreshMetrics();
  }

  public addInventoryTransaction(tx: InventoryTransaction): void {
    this.state.inventoryTransactions.unshift(tx);
  }

  public updateMenuItem(item: MenuItem): void {
    const idx = this.state.menuItems.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      this.state.menuItems[idx] = item;
    }
  }

  public addAgentEvent(event: AgentEvent): void {
    this.state.agentEvents.unshift(event);
    this.refreshMetrics();
  }

  public setLatestDecision(decision: AgentDecision): void {
    this.state.latestDecision = decision;
    this.state.decisionHistory.unshift(decision);
  }

  public setRisks(risks: OperationalRisk[]): void {
    this.state.risks = risks;
    this.refreshMetrics();
  }

  public addNotification(notif: AppNotification): void {
    this.state.notifications.unshift(notif);
  }

  public updateSettings(settings: Partial<AgentSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
  }

  public setDemoState(demoState: Partial<DemoStepState>): void {
    this.state.demoState = { ...this.state.demoState, ...demoState };
  }
}

export const db = new DatabaseStore();
