/**
 * OpsPilot AI - Orders Management View
 * Section 7: Complete order lifecycle, status updates, and deterministic ingredient impact tracking.
 */

import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../types.js';

interface OrdersViewProps {
  orders: Order[];
  onOpenNewOrder: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenNewOrder,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        o.orderNumber.toString().includes(term) ||
        o.tableOrChannel?.toLowerCase().includes(term) ||
        o.items.some((i) => i.menuItemName.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ready':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders & Kitchen Inflow
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time orders queue with automatic recipe-to-ingredient consumption tracking.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by order #, item, or table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Orders Table + Details Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders Table (2 Cols on XL) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Orders Queue ({filteredOrders.length})
            </span>
            <span className="text-xs text-slate-500">
              Sorted by Newest First
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Items & Servings</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ingredient Impact</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/60 font-medium'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold font-mono text-slate-900 whitespace-nowrap">
                          #{order.orderNumber}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">
                            {order.items.map((i) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {order.tableOrChannel}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₹{order.total.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs text-rose-700 font-medium text-[11px]">
                          <span className="truncate block" title={order.ingredientImpactSummary}>
                            {order.ingredientImpactSummary}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {order.createdAt}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail Drawer / Inspector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Order Details
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    #{selectedOrder.orderNumber}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Channel / Location:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.tableOrChannel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Received Time:</span>
                  <span className="font-mono">{selectedOrder.createdAt}</span>
                </div>
              </div>

              {/* Items breakdown */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Order Line Items
                </span>
                <div className="space-y-2 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {it.quantity}× {it.menuItemName}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        ₹{it.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold text-slate-900">
                    <span>Total (incl. GST):</span>
                    <span className="font-mono">₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Ingredient Consumption Impact Detail */}
              <div className="border border-rose-100 bg-rose-50/40 rounded-lg p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                  Deterministic Ingredient Impact
                </span>
                <p className="text-xs text-rose-950 font-medium leading-relaxed">
                  {selectedOrder.ingredientImpactSummary}
                </p>
              </div>

              {/* Status Update Quick Switcher */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Advance Kitchen Lifecycle
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateStatus(selectedOrder.id, 'Preparing')}
                    disabled={selectedOrder.status === 'Preparing'}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
                  >
                    Set Preparing
                  </button>
                  <button
                    onClick={() => onUpdateStatus(selectedOrder.id, 'Ready')}
                    disabled={selectedOrder.status === 'Ready'}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 disabled:opacity-50"
                  >
                    Set Ready
                  </button>
                  <button
                    onClick={() => onUpdateStatus(selectedOrder.id, 'Completed')}
                    disabled={selectedOrder.status === 'Completed'}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => onUpdateStatus(selectedOrder.id, 'Cancelled')}
                    disabled={selectedOrder.status === 'Cancelled'}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an order to view detailed recipe telemetry and ingredient consumption breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
