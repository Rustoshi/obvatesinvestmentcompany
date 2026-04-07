"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronLeft, ChevronRight, X, Package,
    Loader2, Car, Zap, DollarSign, CreditCard, Clock,
    CheckCircle2, XCircle, AlertCircle, Ban, Eye
} from "lucide-react";
import { updateOrderStatus, updateOrderNotes } from "@/app/admin/actions/orders";
import { useRouter } from "next/navigation";

interface OrderUser {
    _id: string;
    name: string;
    email: string;
}

interface OrderProduct {
    _id: string;
    name: string;
    slug: string;
    category: string;
    heroImage: string;
}

interface OrderItem {
    _id: string;
    user: OrderUser;
    product: OrderProduct;
    paymentType: string;
    orderStatus: string;
    totalAmount: number;
    downPaymentAmount: number | null;
    monthlyPayment: number | null;
    financeTermMonths: number | null;
    aprAtPurchase: number | null;
    notes: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
    PENDING: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
    APPROVED: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2 },
    COMPLETED: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
    REJECTED: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
    CANCELLED: { color: "text-white/40", bg: "bg-white/5", border: "border-white/10", icon: Ban },
};

const ALL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"] as const;

export default function OrdersClient({ orders }: { orders: OrderItem[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPayment, setFilterPayment] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
    const [editNotes, setEditNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const itemsPerPage = 15;

    // Auto-clear feedback
    if (feedback) setTimeout(() => setFeedback(null), 4000);

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const matchesSearch =
                o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o._id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || o.orderStatus === filterStatus;
            const matchesPayment = filterPayment === "all" || o.paymentType === filterPayment;
            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [orders, searchTerm, filterStatus, filterPayment]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setLoadingId(orderId);
        const result = await updateOrderStatus(orderId, newStatus as any);
        setLoadingId(null);
        if (result.success) {
            setFeedback({ type: "success", message: "Order status updated." });
            // Update selected order if open
            if (selectedOrder?._id === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
            }
            router.refresh();
        } else {
            setFeedback({ type: "error", message: result.error || "Failed to update." });
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedOrder) return;
        setSavingNotes(true);
        const result = await updateOrderNotes(selectedOrder._id, editNotes);
        setSavingNotes(false);
        if (result.success) {
            setFeedback({ type: "success", message: "Notes saved." });
            setSelectedOrder({ ...selectedOrder, notes: editNotes });
            router.refresh();
        } else {
            setFeedback({ type: "error", message: result.error || "Failed to save notes." });
        }
    };

    const openDetail = (order: OrderItem) => {
        setSelectedOrder(order);
        setEditNotes(order.notes);
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

    // Stats
    const pendingCount = orders.filter(o => o.orderStatus === "PENDING").length;
    const approvedCount = orders.filter(o => o.orderStatus === "APPROVED").length;
    const completedCount = orders.filter(o => o.orderStatus === "COMPLETED").length;
    const totalRevenue = orders.filter(o => o.orderStatus === "COMPLETED").reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
            {/* Feedback */}
            <AnimatePresence>
                {feedback && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                        {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="text-xs font-bold tracking-wide">{feedback.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-wide">Orders</h1>
                    <p className="text-xs text-white/40 mt-1">Manage customer orders and track payments</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Pending", value: pendingCount, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
                    { label: "Approved", value: approvedCount, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2 },
                    { label: "Completed", value: completedCount, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
                    { label: "Revenue", value: formatCurrency(totalRevenue), color: "text-white", bg: "bg-white/5", border: "border-white/10", icon: DollarSign },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{stat.label}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color} opacity-60`} />
                        </div>
                        <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by customer, product, or order ID..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors">
                    <option value="all">All Statuses</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
                <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors">
                    <option value="all">All Payments</option>
                    <option value="CASH">Cash</option>
                    <option value="FINANCE">Finance</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-[#0A0A0A]/60 border border-white/[0.06] rounded-2xl overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="w-10 h-10 text-white/10 mb-4" />
                        <p className="text-xs text-white/30 font-bold uppercase tracking-widest">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-left">Customer</th>
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-left">Product</th>
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-left">Payment</th>
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-left">Amount</th>
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-left">Status</th>
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-left hidden lg:table-cell">Date</th>
                                    <th className="p-4 text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map((order, i) => {
                                    const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
                                    const StatusIcon = statusCfg.icon;
                                    return (
                                        <motion.tr
                                            key={order._id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * i }}
                                            className="border-b last:border-0 border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4">
                                                <div>
                                                    <span className="text-xs text-white font-bold tracking-wide block">{order.user.name}</span>
                                                    <span className="text-[10px] text-white/30 block">{order.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0 ${order.product.category === "VEHICLE" ? "bg-cyan-500/10 text-cyan-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                                                        {order.product.category === "VEHICLE" ? <Car className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-xs text-white/70 font-medium">{order.product.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${order.paymentType === "CASH" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                                                    {order.paymentType === "CASH" ? "Cash" : "Finance"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-white font-bold font-mono">{formatCurrency(order.totalAmount)}</span>
                                                {order.paymentType === "FINANCE" && order.monthlyPayment && (
                                                    <span className="text-[10px] text-white/30 block">{formatCurrency(order.monthlyPayment)}/mo × {order.financeTermMonths}mo</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden lg:table-cell text-xs text-white/30 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openDetail(order)}
                                                        className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {/* Quick status dropdown */}
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        disabled={loadingId === order._id}
                                                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white font-bold uppercase tracking-wider focus:outline-none focus:border-white/20 disabled:opacity-50 transition-colors cursor-pointer"
                                                    >
                                                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                                                    </select>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 flex items-center justify-between border-t border-white/[0.06] bg-black/20">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Page {currentPage} of {totalPages} • {filtered.length} orders
                        </span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <div className="hidden sm:flex gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    return (
                                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-colors ${currentPage === pageNum ? "bg-red-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}>
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Order Detail Modal ─── */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-y-auto"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-wide">Order Details</h3>
                                    <span className="text-[10px] text-white/30 font-mono">{selectedOrder._id}</span>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <X className="w-4 h-4 text-white/60" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Customer */}
                                <div>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Customer</p>
                                    <p className="text-sm text-white font-bold">{selectedOrder.user.name}</p>
                                    <p className="text-xs text-white/40">{selectedOrder.user.email}</p>
                                </div>

                                {/* Product */}
                                <div>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Product</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border border-white/10 ${selectedOrder.product.category === "VEHICLE" ? "bg-cyan-500/10 text-cyan-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                                            {selectedOrder.product.category === "VEHICLE" ? <Car className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-bold">{selectedOrder.product.name}</p>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedOrder.product.category === "VEHICLE" ? "text-cyan-400" : "text-yellow-400"}`}>
                                                {selectedOrder.product.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Payment Type</p>
                                        <span className={`text-xs font-bold ${selectedOrder.paymentType === "CASH" ? "text-green-400" : "text-purple-400"}`}>
                                            {selectedOrder.paymentType === "CASH" ? "💵 Cash" : "💳 Finance"}
                                        </span>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                        <span className="text-xs font-bold text-white">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>

                                {/* Finance Details */}
                                {selectedOrder.paymentType === "FINANCE" && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Down Payment</p>
                                            <span className="text-xs font-bold text-purple-400">{selectedOrder.downPaymentAmount ? formatCurrency(selectedOrder.downPaymentAmount) : "—"}</span>
                                        </div>
                                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Monthly</p>
                                            <span className="text-xs font-bold text-purple-400">{selectedOrder.monthlyPayment ? `${formatCurrency(selectedOrder.monthlyPayment)}/mo` : "—"}</span>
                                        </div>
                                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Term / APR</p>
                                            <span className="text-xs font-bold text-purple-400">{selectedOrder.financeTermMonths}mo @ {selectedOrder.aprAtPurchase}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Status & Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Status</p>
                                        <select
                                            value={selectedOrder.orderStatus}
                                            onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                                            disabled={loadingId === selectedOrder._id}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold uppercase tracking-wider focus:outline-none focus:border-white/20 disabled:opacity-50 transition-colors cursor-pointer"
                                        >
                                            {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Order Date</p>
                                        <p className="text-xs text-white/60 py-2.5">{formatDate(selectedOrder.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Admin Notes</p>
                                    <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        placeholder="Add internal notes about this order..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors h-20 resize-none"
                                    />
                                    {editNotes !== selectedOrder.notes && (
                                        <button onClick={handleSaveNotes} disabled={savingNotes}
                                            className="mt-2 flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors">
                                            {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                            Save Notes
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
