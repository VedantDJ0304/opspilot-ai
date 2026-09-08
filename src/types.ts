/**
 * OpsPilot AI - Core TypeScript Types & Interfaces
 */

export type RiskLevel = 'NORMAL' | 'LOW' | 'WARNING' | 'CRITICAL';

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export type MenuAvailability = 'AVAILABLE' | 'LIMITED' | 'DISABLED';

export type AgentStage = 'OBSERVE' | 'ANALYZE' | 'DECIDE' | 'ACT' | 'MONITOR' | 'ADAPT';

export type AgentActionType =
  | 'LIMIT_MENU_ITEM'
  | 'DISABLE_MENU_ITEM'
  | 'RESTORE_MENU_ITEM'
  | 'NOTIFY_MANAGER'
  | 'CREATE_REPLENISHMENT_ALERT'
  | 'ADJUST_MONITORING'
  | 'CONTINUE_MONITORING';

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'units';
  displayUnit: string;
  minThreshold: number; // in base unit (kg, L, units)
  normalRatePerHour: number; // in base unit per hour
  costPerUnit: number; // in INR
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number; // amount per serving in display unit
  unit: 'kg' | 'g' | 'L' | 'ml' | 'units';
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Main Course' | 'Starters' | 'Breads' | 'Rice & Biryani' | 'Thalis';
  price: number; // INR
  availabilityStatus: MenuAvailability;
  limitedReason?: string;
  recipe: RecipeIngredient[];
  prepTimeMinutes: number;
}

export interface InventoryItem {
  ingredientId: string;
  name: string;
  unit: string;
  displayUnit: string;
  physicalBaselineStock: number;
  physicalBaselineTime: string;
  estimatedStock: number;
  consumptionRatePerHour: number;
  normalRatePerHour: number;
  pendingDemandUnits: number;
  estimatedRunoutMinutes: number;
  riskLevel: RiskLevel;
  lastCountAt: string;
}

export type InventoryTransactionType =
  | 'INITIAL'
  | 'ORDER_CONSUMPTION'
  | 'PURCHASE'
  | 'WASTAGE'
  | 'MANUAL_ADJUSTMENT'
  | 'CORRECTION';

export interface InventoryTransaction {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  type: InventoryTransactionType;
  delta: number;
  unit: string;
  balanceAfter: number;
  referenceId?: string;
  note: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  ingredientImpactSummary: string;
  tableOrChannel?: string;
}

export interface OperationalRisk {
  id: string;
  ingredientId: string;
  ingredientName: string;
  riskLevel: RiskLevel;
  detectedAt: string;
  currentStock: number;
  unit: string;
  runoutMinutes: number;
  consumptionRate: number;
  normalRate: number;
  pendingOrdersCount: number;
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  stage: AgentStage;
  title: string;
  description: string;
  inputData?: Record<string, any>;
  decision?: string;
  action?: AgentActionType;
  actionTarget?: string;
  result?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'MONITORING';
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  goal: string;
  trigger: string;
  context: {
    ingredientName: string;
    stock: number;
    unit: string;
    consumptionRate: number;
    normalRate: number;
    pendingOrders: number;
    runoutMinutes: number;
  };
  availableAlternatives: string[];
  decision: string;
  reason: string;
  action: AgentActionType;
  actionParams: Record<string, any>;
  result: string;
  status: 'Monitoring' | 'Resolved' | 'Executed';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface AgentSettings {
  agentEnabled: boolean;
  monitoringFrequencyMinutes: number;
  riskSensitivity: 'conservative' | 'balanced' | 'aggressive';
  permissions: {
    notifyManager: boolean;
    limitMenuItems: boolean;
    disableMenuItems: boolean;
    restoreMenuItems: boolean;
    replenishmentAlerts: boolean;
  };
  operatingHours: string;
  restaurantName: string;
  currencySymbol: string;
}

export interface DemoStepState {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  isSimulating: boolean;
}

export interface OperationalIncident {
  id: string;
  date: string;
  ingredientName: string;
  cause: string;
  actionTaken: string;
  outcome: string;
  status: 'RESOLVED' | 'ACTIVE';
}

export interface OperationalState {
  restaurant: {
    name: string;
    tagline: string;
    location: string;
    manager: string;
    status: 'Operational' | 'Paused';
  };
  ingredients: Ingredient[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  menuItems: MenuItem[];
  orders: Order[];
  risks: OperationalRisk[];
  agentEvents: AgentEvent[];
  latestDecision: AgentDecision | null;
  decisionHistory: AgentDecision[];
  notifications: AppNotification[];
  settings: AgentSettings;
  demoState: DemoStepState;
  incidents: OperationalIncident[];
  metrics: {
    todayOrdersCount: number;
    pendingOrdersCount: number;
    activeRisksCount: number;
    agentActionsTodayCount: number;
    criticalShortageIngredient?: string;
    criticalShortageTimeMinutes?: number;
  };
}
