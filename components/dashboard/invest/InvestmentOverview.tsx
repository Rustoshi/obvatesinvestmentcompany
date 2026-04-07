"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface InvestmentOverviewProps {
    userData?: {
        totalBalance: number;
        totalProfits: number;
        totalInvested: number;
        activePlansCount: number;
        currency: string;
    }
    currency: string;
}

export default function InvestmentOverview({ userData, currency }: InvestmentOverviewProps) {
    const formattedBalance = userData?.totalBalance ? `${currency}${userData.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currency}0.00`;
    const formattedProfits = userData?.totalProfits ? `${currency}${userData.totalProfits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currency}0.00`;
    const formattedInvested = userData?.totalInvested ? `${currency}${userData.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currency}0.00`;
    const activePlans = userData?.activePlansCount ? `${userData.activePlansCount}` : "0";

    const kpis = [
        {
            label: "Total Balance", value: formattedBalance, trend: "", positive: true,
            icon: (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5m-4 0h4M17 12a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            label: "Total Profits", value: formattedProfits, trend: "", positive: true,
            icon: (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        },
        {
            label: "Total Invested", value: formattedInvested, positive: true,
            icon: (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            label: "Active Plans", value: activePlans, positive: true,
            icon: (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
    ];

    const quickLinks = [
        {
            label: "Deposit", href: "/dashboard/deposit",
            icon: (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            )
        },
        {
            label: "Withdraw", href: "/dashboard/withdraw",
            icon: (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            )
        },
        {
            label: "Buy Crypto", href: "/dashboard/buy-crypto",
            icon: (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: "Transactions", href: "/dashboard/transactions",
            icon: (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    return (
        <section className="mb-10">
            <h2
                className="text-lg font-bold tracking-[0.15em] uppercase text-white mb-6"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
                Account Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-full overflow-hidden">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] transition-colors duration-300 group relative overflow-hidden max-w-full w-full"
                    >
                        {/* Background Watermark Icon */}
                        <div className="absolute right-[-10px] bottom-[10px] text-white/[0.04] group-hover:text-white/[0.06] transition-colors duration-500 pointer-events-none w-20 h-20 rotate-[-15deg]">
                            {kpi.icon}
                        </div>

                        <div className="flex items-center gap-3 mb-3 relative z-10 w-full overflow-hidden">
                            <p className="text-[11px] tracking-[0.1em] uppercase text-white/40 font-medium truncate">
                                {kpi.label}
                            </p>
                        </div>
                        <div className="flex items-end justify-between w-full overflow-hidden">
                            <p className="text-2xl font-bold text-white tracking-tight truncate mr-2">
                                {kpi.value}
                            </p>
                            {kpi.trend && (
                                <span
                                    className={`text-xs font-semibold mb-1 shrink-0 ${kpi.positive ? "text-green-500" : "text-white/40"
                                        }`}
                                >
                                    {kpi.trend}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Action Links */}
            <div className="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 max-w-full overflow-hidden">
                {quickLinks.map((link, i) => (
                    <motion.div
                        key={link.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                        className="w-full sm:w-auto overflow-hidden"
                    >
                        <Link
                            href={link.href}
                            className="flex items-center justify-center px-5 py-2.5 bg-transparent border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all rounded-full text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-white/80 hover:text-white group truncate w-full"
                        >
                            <span className="text-white/50 group-hover:text-red-500 transition-colors mr-1 shrink-0">
                                {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
