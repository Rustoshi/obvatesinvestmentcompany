"use client";

import { useState } from "react";
import { Building2, Wallet, TrendingUp, Plus, Edit, Trash2, Check, X, Loader2, Save, Shield } from "lucide-react";
import { updateCompanyDetails, addPaymentOption, deletePaymentOption, addInvestmentPlan, updateInvestmentPlan, deleteInvestmentPlan, updateAdminPassword } from "@/app/admin/actions/settings";
import { useRouter } from "next/navigation";

export default function SettingsTabs({ companyDetails, paymentOptions, investmentPlans }: { companyDetails: any, paymentOptions: any[], investmentPlans: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'plans' | 'security'>('general');

    // UI States
    const [isSavingGeneral, setIsSavingGeneral] = useState(false);
    const [isSavingSecurity, setIsSavingSecurity] = useState(false);
    const [securityError, setSecurityError] = useState<string | null>(null);
    const [securitySuccess, setSecuritySuccess] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [showAddPlan, setShowAddPlan] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Handlers
    const handleSaveGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSavingGeneral(true);
        const formData = new FormData(e.currentTarget);
        await updateCompanyDetails(formData);
        setIsSavingGeneral(false);
        router.refresh();
    };

    const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingId('new-payment');
        const formData = new FormData(e.currentTarget);
        await addPaymentOption(formData);
        setShowAddPayment(false);
        setLoadingId(null);
        router.refresh();
    };

    const handleDeletePayment = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment option?")) return;
        setLoadingId(id);
        await deletePaymentOption(id);
        setLoadingId(null);
        router.refresh();
    };

    const handleAddPlan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingId('new-plan');
        const formData = new FormData(e.currentTarget);
        await addInvestmentPlan(formData);
        setShowAddPlan(false);
        setLoadingId(null);
        router.refresh();
    };

    const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingPlanId) return;
        setLoadingId(editingPlanId);
        const formData = new FormData(e.currentTarget);
        await updateInvestmentPlan(editingPlanId, formData);
        setEditingPlanId(null);
        setLoadingId(null);
        router.refresh();
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm("Are you sure you want to delete this investment plan?")) return;
        setLoadingId(id);
        await deleteInvestmentPlan(id);
        setLoadingId(null);
        router.refresh();
    };

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSavingSecurity(true);
        setSecurityError(null);
        setSecuritySuccess(false);

        const formData = new FormData(e.currentTarget);
        const res = await updateAdminPassword(formData);

        if (res.success) {
            setSecuritySuccess(true);
            (e.target as HTMLFormElement).reset();
        } else {
            setSecurityError(res.error || "Failed to update password");
        }
        setIsSavingSecurity(false);
    };

    const renderTabButton = (id: 'general' | 'payment' | 'plans' | 'security', label: string, Icon: any) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === id
                ? 'border-red-500 text-red-500 bg-red-500/5'
                : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
                }`}
        >
            <Icon className="w-4 h-4" /> {label}
        </button>
    );

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden mt-8">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-white/[0.08] bg-black/40 whitespace-nowrap">
                {renderTabButton('general', 'General Details', Building2)}
                {renderTabButton('payment', 'Payment Methods', Wallet)}
                {renderTabButton('plans', 'Investment Plans', TrendingUp)}
                {renderTabButton('security', 'Security', Shield)}
            </div>

            {/* Tab Content Area */}
            <div className="p-6 md:p-8">

                {/* GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                        <h3 className="text-sm font-bold tracking-widest text-white uppercase font-montserrat mb-6">Company Information</h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">Company Email <span className="text-red-500">*</span></label>
                                <input name="companyEmail" type="email" defaultValue={companyDetails.companyEmail} required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">Contact Phone <span className="text-red-500">*</span></label>
                                <input name="contactPhone" type="text" defaultValue={companyDetails.contactPhone} required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">Company Address <span className="text-red-500">*</span></label>
                                <textarea name="companyAddress" defaultValue={companyDetails.companyAddress} required rows={3} className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/[0.05]">
                            <button disabled={isSavingGeneral} type="submit" className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
                                {isSavingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Save Details
                            </button>
                        </div>
                    </form>
                )}

                {/* PAYMENT METHODS */}
                {activeTab === 'payment' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-sm font-bold tracking-widest text-white uppercase font-montserrat">Crypto Gateways</h3>
                            <button onClick={() => setShowAddPayment(!showAddPayment)} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors shrink-0">
                                {showAddPayment ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {showAddPayment ? 'Cancel' : 'Add Payment Option'}
                            </button>
                        </div>

                        {showAddPayment && (
                            <form onSubmit={handleAddPayment} className="bg-white/[0.02] border border-red-500/30 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">New Payment Gateway</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Network (e.g. Bitcoin, ERC20) <span className="text-red-500">*</span></label>
                                        <input name="network" type="text" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Coin/Ticker (e.g. BTC, USDT) <span className="text-red-500">*</span></label>
                                        <input name="ticker" type="text" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Wallet Address <span className="text-red-500">*</span></label>
                                        <input name="walletAddress" type="text" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                </div>
                                <button disabled={loadingId === 'new-payment'} type="submit" className="bg-white hover:bg-white/90 text-black px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2">
                                    {loadingId === 'new-payment' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Option'}
                                </button>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paymentOptions.length === 0 ? (
                                <div className="col-span-full p-8 text-center border border-white/[0.05] border-dashed rounded-xl text-white/40 text-sm">No payment options configured.</div>
                            ) : paymentOptions.map(option => (
                                <div key={option._id} className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-5 transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 ${option.isActive ? 'bg-green-500/20' : 'bg-white/10'}`}></div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h4 className="font-bold text-white tracking-widest uppercase">{option.network}</h4>
                                            <span className="text-[10px] text-white/40 tracking-widest uppercase">{option.ticker}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button disabled={loadingId === option._id} onClick={() => handleDeletePayment(option._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">
                                                {loadingId === option._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg relative z-10">
                                        <div className="text-[10px] tracking-widest uppercase text-white/40 mb-1">Wallet Address</div>
                                        <div className="text-xs font-mono text-white/70 break-all">{option.walletAddress}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INVESTMENT PLANS */}
                {activeTab === 'plans' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-sm font-bold tracking-widest text-white uppercase font-montserrat">Structured Programs</h3>
                            <button onClick={() => setShowAddPlan(!showAddPlan)} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors shrink-0">
                                {showAddPlan ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {showAddPlan ? 'Cancel' : 'Add Plan'}
                            </button>
                        </div>

                        {showAddPlan && (
                            <form onSubmit={handleAddPlan} className="bg-white/[0.02] border border-red-500/30 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">New Investment Plan</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Plan Name <span className="text-red-500">*</span></label>
                                        <input name="name" type="text" placeholder="e.g. Starter AI" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Capital Range <span className="text-red-500">*</span></label>
                                        <input name="capitalRange" type="text" placeholder="e.g. $1,000 - $10,000" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Expected Return (Low %) <span className="text-red-500">*</span></label>
                                        <input name="returnLow" type="number" placeholder="e.g. 150" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Expected Return (High %)</label>
                                        <input name="returnHigh" type="number" placeholder="e.g. 250 (Optional)" className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Execution Cycle <span className="text-red-500">*</span></label>
                                        <input name="cycle" type="text" placeholder="e.g. 3 Days" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Return Context <span className="text-red-500">*</span></label>
                                        <input name="returnContext" type="text" placeholder="e.g. Based on historical backtesting..." required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Description <span className="text-red-500">*</span></label>
                                        <textarea name="description" rows={2} required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">Features (Comma Separated) <span className="text-red-500">*</span></label>
                                        <textarea name="features" rows={2} placeholder="e.g. Automated execution, Risk-adjusted, Portfolio rebalancing" required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none" />
                                    </div>

                                    {/* Toggles / Extras */}
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-2 pt-4 border-t border-white/5 sm:col-span-2">
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer whitespace-nowrap">
                                            <input type="checkbox" name="highlighted" value="true" className="w-4 h-4 bg-black border border-white/20 rounded accent-red-500 shrink-0" />
                                            Highlight Plan
                                        </label>
                                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 whitespace-nowrap">Badge Text:</span>
                                            <input name="badge" type="text" placeholder="e.g. Most Popular" className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                                        </div>
                                    </div>

                                </div>
                                <button disabled={loadingId === 'new-plan'} type="submit" className="bg-white hover:bg-white/90 text-black px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 mt-2">
                                    {loadingId === 'new-plan' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Plan'}
                                </button>
                            </form>
                        )}


                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {investmentPlans.length === 0 ? (
                                <div className="col-span-full p-8 text-center border border-white/[0.05] border-dashed rounded-xl text-white/40 text-sm">No investment plans configured.</div>
                            ) : investmentPlans.map(plan => {
                                if (editingPlanId === plan._id) {
                                    return (
                                        <form key={plan._id} onSubmit={handleUpdatePlan} className="bg-white/[0.04] border border-red-500/50 rounded-xl p-6 relative">
                                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                                                <h4 className="font-bold tracking-wider text-white uppercase text-sm">Edit Plan</h4>
                                                <button type="button" onClick={() => setEditingPlanId(null)} className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <input name="name" type="text" defaultValue={plan.name} required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Plan Name" />
                                                <input name="capitalRange" type="text" defaultValue={plan.capitalRange} required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Capital Range" />
                                                <div className="flex gap-2">
                                                    <input name="returnLow" type="number" defaultValue={plan.returnLow} required className="w-1/2 bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Min %" />
                                                    <input name="returnHigh" type="number" defaultValue={plan.returnHigh || ''} className="w-1/2 bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Max % (opt)" />
                                                </div>
                                                <input name="cycle" type="text" defaultValue={plan.cycle} required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Cycle (e.g. 5 Days)" />
                                                <input name="returnContext" type="text" defaultValue={plan.returnContext} required className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Return Context/Subtext" />
                                                <textarea name="description" defaultValue={plan.description} required rows={2} className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 resize-none" placeholder="Description"></textarea>
                                                <textarea name="features" defaultValue={plan.features.map((f: any) => f.text).join(', ')} required rows={2} className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 resize-none" placeholder="Features (comma separated)"></textarea>

                                                <div className="flex flex-col gap-2 pt-2">
                                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white cursor-pointer">
                                                        <input type="checkbox" name="highlighted" defaultChecked={plan.highlighted} value="true" className="w-3.5 h-3.5 bg-black border border-white/20 rounded accent-red-500" />
                                                        Highlight Plan
                                                    </label>
                                                    <input name="badge" type="text" defaultValue={plan.badge || ''} className="w-full bg-black/50 border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-500/50" placeholder="Badge Text (e.g. Most Popular)" />
                                                </div>

                                                <button disabled={loadingId === plan._id} type="submit" className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors mt-2">
                                                    {loadingId === plan._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Update Plan
                                                </button>
                                            </div>
                                        </form>
                                    );
                                }

                                return (
                                    <div key={plan._id} className={`flex flex-col rounded-xl p-6 relative ${plan.highlighted ? 'bg-white/[0.04] border border-red-500/30' : 'bg-white/[0.02] border border-white/[0.08]'}`}>
                                        {plan.badge && (
                                            <span className="absolute -top-2.5 left-6 text-[9px] tracking-[0.2em] uppercase font-bold text-white/70 border border-white/20 rounded-full px-3 py-0.5 bg-black">
                                                {plan.badge}
                                            </span>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold tracking-wider text-white uppercase text-sm">{plan.name}</h4>
                                                <span className="text-[10px] text-white/40 tracking-widest uppercase">Cycle: {plan.cycle}</span>
                                            </div>
                                            <div className="flex gap-2 relative z-10">
                                                <button onClick={() => setEditingPlanId(plan._id)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                                                <button disabled={loadingId === plan._id} onClick={() => handleDeletePlan(plan._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-500/60 hover:text-red-400">
                                                    {loadingId === plan._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-sm text-green-400 font-mono mb-1">{plan.returnLow}% {plan.returnHigh ? `- ${plan.returnHigh}%` : ''} <span className="text-white/40 text-xs">Returns</span></div>
                                        <div className="text-xs text-white/60 font-mono mb-4">{plan.capitalRange}</div>

                                        <p className="text-xs text-white/50 mb-6 flex-1">{plan.description}</p>

                                        <div className="space-y-2 mt-auto border-t border-white/[0.04] pt-4">
                                            {plan.features.slice(0, 3).map((f: any, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-[10px] text-white/40 tracking-wide uppercase">
                                                    <Check className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> {f.text}
                                                </div>
                                            ))}
                                            {plan.features.length > 3 && <div className="text-[10px] text-white/30 italic">+{plan.features.length - 3} more features...</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* SECURITY SETTINGS */}
                {activeTab === 'security' && (
                    <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl animate-in fade-in duration-300">
                        <h3 className="text-sm font-bold tracking-widest text-white uppercase font-montserrat mb-6">Security & Authentication</h3>

                        {securityError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-4 rounded-lg">
                                {securityError}
                            </div>
                        )}
                        {securitySuccess && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-4 rounded-lg">
                                Password successfully updated.
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">Current Password <span className="text-red-500">*</span></label>
                                <input name="currentPassword" type="password" required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">New Password <span className="text-red-500">*</span></label>
                                <input name="newPassword" type="password" required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">Confirm New Password <span className="text-red-500">*</span></label>
                                <input name="confirmPassword" type="password" required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/[0.05]">
                            <button disabled={isSavingSecurity} type="submit" className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
                                {isSavingSecurity ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Update Password
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
