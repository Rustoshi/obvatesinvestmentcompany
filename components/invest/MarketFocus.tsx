"use client";

import { motion } from "framer-motion";

const companies = [
    {
        name: "Tesla",
        ticker: "TSLA",
        thesis: "Electric mobility & sustainable energy dominance",
    },
    {
        name: "NVIDIA",
        ticker: "NVDA",
        thesis: "AI compute infrastructure & accelerated computing",
    },
    {
        name: "Apple",
        ticker: "AAPL",
        thesis: "Consumer hardware ecosystem & services growth",
    },
    {
        name: "Microsoft",
        ticker: "MSFT",
        thesis: "Enterprise cloud & generative AI integration",
    },
    {
        name: "Amazon",
        ticker: "AMZN",
        thesis: "Commerce infrastructure & cloud computing scale",
    },
    {
        name: "SpaceX",
        ticker: "PRIVATE",
        thesis: "Aerospace logistics & orbital internet deployment",
    },
];

export default function MarketFocus() {
    return (
        <section id="markets" className="relative w-full bg-black py-24 sm:py-32 overflow-hidden">
            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Label */}
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block text-[11px] tracking-[0.3em] uppercase text-red-500 font-semibold mb-6"
                >
                    Strategic Exposure
                </motion.span>

                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.06em] leading-[1.1] text-white mb-8 w-full"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                    Concentrated in
                    <br />
                    <span className="text-white/40">Innovation Leaders</span>
                </motion.h2>

                {/* Philosophy */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base sm:text-lg text-white/50 font-light max-w-2xl leading-relaxed mb-16"
                >
                    We allocate capital toward companies building the infrastructure of the future — AI, energy, automation, aerospace, and digital ecosystems.
                </motion.p>

                {/* Company Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {companies.map((company, i) => (
                        <motion.div
                            key={company.ticker}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -3 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.08 * i }}
                            className="group relative rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors duration-400 cursor-pointer"
                        >
                            {/* Ticker + Name */}
                            <div className="flex items-baseline gap-3 mb-3">
                                <span
                                    className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                                    style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                                >
                                    {company.name}
                                </span>
                                <span className={`text-xs font-mono tracking-wider ${company.ticker === "PRIVATE" ? "text-red-500/60" : "text-white/30"}`}>
                                    {company.ticker}
                                </span>
                            </div>

                            {/* Thesis */}
                            <p className="text-sm text-white/50 font-light leading-relaxed">
                                {company.thesis}
                            </p>

                            {/* Subtle red accent line */}
                            <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 group-hover:via-red-500/40 transition-all duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
