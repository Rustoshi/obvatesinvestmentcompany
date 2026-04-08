"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Deposit", href: "/dashboard/deposit", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
    { label: "Withdraw", href: "/dashboard/withdraw", icon: "M20 12H4m8-8l-8 8 8 8" },
    { label: "Buy Crypto", href: "/dashboard/buy-crypto", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { label: "Subscribe to Plan", href: "/dashboard/subscribe", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "My Plans", href: "/dashboard/plans", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Orders", href: "/dashboard/orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { label: "KYC", href: "/dashboard/kyc", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: "Transactions", href: "/dashboard/transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { label: "Settings", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 bottom-0 w-64 bg-[#050505] border-r border-white/[0.06] z-[100] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-white/[0.06] bg-[#050505] relative z-[60]">
                    <Link
                        href="/dashboard"
                        className="text-sm font-bold tracking-[0.25em] uppercase text-white"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                        Obvate<span className="text-red-500">Investment</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => onClose()}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? "bg-red-600/10 text-red-500"
                                    : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                                    }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                                    {link.label === "Settings" && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    )}
                                </svg>
                                <span className="text-sm font-medium tracking-wide">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Action */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button
                        onClick={() => signOut({ callbackUrl: "/invest/login" })}
                        className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium tracking-wide">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
