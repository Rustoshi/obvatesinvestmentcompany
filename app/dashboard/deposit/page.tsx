"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import QRCode from "react-qr-code";
import { submitDeposit } from "@/app/dashboard/actions/deposit";
import { getPaymentOptions, type PaymentOptionData } from "@/app/dashboard/actions/getPaymentOptions";
import { Loader2 } from "lucide-react";

// Color mapping for common tickers
function getTickerStyle(ticker: string): { color: string; bg: string } {
    const t = ticker.toUpperCase();
    const map: Record<string, { color: string; bg: string }> = {
        USDT: { color: "text-green-500", bg: "bg-green-500/10" },
        BTC: { color: "text-orange-500", bg: "bg-orange-500/10" },
        ETH: { color: "text-purple-500", bg: "bg-purple-500/10" },
        DOGE: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
        SOL: { color: "text-teal-500", bg: "bg-teal-500/10" },
        XRP: { color: "text-blue-500", bg: "bg-blue-500/10" },
        BNB: { color: "text-yellow-400", bg: "bg-yellow-400/10" },
        ADA: { color: "text-sky-500", bg: "bg-sky-500/10" },
        LTC: { color: "text-gray-400", bg: "bg-gray-400/10" },
        TRX: { color: "text-red-500", bg: "bg-red-500/10" },
        MATIC: { color: "text-violet-500", bg: "bg-violet-500/10" },
        USDC: { color: "text-blue-400", bg: "bg-blue-400/10" },
    };
    return map[t] || { color: "text-white", bg: "bg-white/10" };
}

export default function DepositPage() {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [selectedCrypto, setSelectedCrypto] = useState<PaymentOptionData | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Dynamic payment options from DB
    const [paymentOptions, setPaymentOptions] = useState<PaymentOptionData[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchOptions() {
            try {
                const options = await getPaymentOptions();
                setPaymentOptions(options);
            } catch (err) {
                console.error("Failed to load payment options:", err);
            } finally {
                setOptionsLoading(false);
            }
        }
        fetchOptions();
    }, []);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleNext = () => {
        if (step === 1 && !amount) return;
        if (step === 2 && !selectedCrypto) return;
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setErrorMsg("");
        }
    };

    const handleSubmitDeposit = async () => {
        if (!file || !amount || !selectedCrypto) return;

        setLoading(true);
        setErrorMsg("");

        try {
            // 1. Upload to Cloudinary Unsigned
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "deposit_proofs");

            const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "do2jdvxzh";
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload image to Cloudinary.");
            }

            const uploadData = await uploadRes.json();
            const secureUrl = uploadData.secure_url;

            // 2. Submit to Server Action Database API
            const submitData = new FormData();
            submitData.append('amount', amount);
            submitData.append('currency', selectedCrypto.network);
            submitData.append('proofUrl', secureUrl);

            const res = await submitDeposit(submitData);

            if (res.success) {
                setStep(4); // Advance to Success Screen
            } else {
                setErrorMsg(res.error || "Failed to submit deposit. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "An unexpected error occurred during submission.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32">
            {/* Header */}
            <div className="mb-10 text-center relative">
                {step > 1 && step < 4 && (
                    <button
                        onClick={handleBack}
                        disabled={loading}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold tracking-widest uppercase disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="hidden sm:inline">Back</span>
                    </button>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                    Fund Account
                </h1>
                <div className="mt-4 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-red-500" : i < step ? "w-4 bg-red-500/40" : "w-4 bg-white/10"}`} />
                    ))}
                </div>
            </div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {/* STEP 1: AMOUNT */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/[0.02] border border-white/[0.05] p-6 sm:p-10 rounded-2xl glass"
                        >
                            <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Enter Amount</h2>
                            <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">How much would you like to deposit?</p>

                            <div className="relative mb-10">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/40">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="1"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-6 pl-12 pr-6 text-3xl font-bold text-white outline-none focus:border-red-500/50 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!amount || Number(amount) <= 0}
                                className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                            >
                                Continue to Payment
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: SELECT CRYPTO */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/[0.02] border border-white/[0.05] p-6 sm:p-10 rounded-2xl glass"
                        >
                            <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Select Network</h2>
                            <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">Choose your preferred cryptocurrency</p>

                            {/* Loading state */}
                            {optionsLoading && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-4" />
                                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Loading payment options...</p>
                                </div>
                            )}

                            {/* Empty state — no payment wallets configured */}
                            {!optionsLoading && paymentOptions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5">
                                        <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2">No Payment Wallet Added Yet</h3>
                                    <p className="text-xs text-white/30 max-w-xs leading-relaxed">
                                        Payment options have not been configured. Please contact support for assistance.
                                    </p>
                                </div>
                            )}

                            {/* Payment options grid */}
                            {!optionsLoading && paymentOptions.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                        {paymentOptions.map((crypto) => {
                                            const style = getTickerStyle(crypto.ticker);
                                            return (
                                                <button
                                                    key={crypto.id}
                                                    onClick={() => setSelectedCrypto(crypto)}
                                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border overflow-hidden transition-all duration-300 ${selectedCrypto?.id === crypto.id
                                                        ? "border-red-500 bg-red-500/10"
                                                        : "border-white/[0.05] bg-black/40 hover:bg-white/[0.05] hover:border-white/20"
                                                        }`}
                                                >
                                                    <div className={`w-12 h-12 rounded-full ${style.bg} ${style.color} flex items-center justify-center mb-3 overflow-hidden`}>
                                                        <span className="font-bold text-sm tracking-wider truncate max-w-[40px] text-center">{crypto.ticker}</span>
                                                    </div>
                                                    <div className="text-xs font-bold text-white tracking-widest uppercase text-center w-full truncate">{crypto.network}</div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {selectedCrypto && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="bg-black/60 border border-red-500/30 rounded-xl p-6 mb-8 flex flex-col items-center"
                                        >
                                            <p className="text-xs text-white/40 uppercase tracking-widest mb-6 text-center">Scan to send exactly <strong className="text-white">${amount}</strong></p>

                                            {/* QR Code Container */}
                                            <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                                <QRCode
                                                    value={selectedCrypto.walletAddress}
                                                    size={160}
                                                    level="Q"
                                                    className="w-40 h-40 md:w-48 md:h-48"
                                                />
                                            </div>

                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Or copy address</p>

                                            {/* Tap to Copy Address Container */}
                                            <button
                                                onClick={() => handleCopy(selectedCrypto.walletAddress)}
                                                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 py-3 px-4 rounded-lg flex items-center justify-between gap-4 transition-all group active:scale-[0.98]"
                                                title="Tap to copy"
                                            >
                                                <div className="flex-1 text-sm sm:text-base font-bold text-white tracking-wider truncate font-mono">
                                                    {selectedCrypto.walletAddress}
                                                </div>
                                                <div className="shrink-0 text-white/40 group-hover:text-white transition-colors">
                                                    {copied ? (
                                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    )}
                                                </div>
                                            </button>
                                            {copied && <span className="text-[10px] text-green-500 font-bold tracking-widest uppercase mt-2 animate-pulse">Copied to clipboard!</span>}

                                            <p className="text-[10px] text-red-500/80 mt-6 uppercase tracking-widest font-bold text-center">Warning: Send only {selectedCrypto.network} to this address.</p>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        disabled={!selectedCrypto}
                                        className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                                    >
                                        I Have Made Payment
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: UPLOAD PROOF */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/[0.02] border border-white/[0.05] p-6 sm:p-10 rounded-2xl glass"
                        >
                            <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Verify Transfer</h2>
                            <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">Upload a screenshot of your successful transaction</p>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            <div
                                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors mb-4 cursor-pointer ${file ? "border-green-500 bg-green-500/5" : "border-white/20 bg-black/40 hover:bg-white/5 hover:border-white/40"}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-black mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="text-sm font-bold text-green-500 uppercase tracking-widest">Proof Attached</div>
                                        <div className="text-xs text-white/40 mt-2 truncate w-full max-w-[200px]">{file.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40 mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        </div>
                                        <div className="text-sm font-bold text-white uppercase tracking-widest">Click to Upload Image</div>
                                        <div className="text-xs text-white/40 mt-2">JPG or PNG (Max 5MB)</div>
                                    </>
                                )}
                            </div>

                            {errorMsg && (
                                <p className="text-xs text-red-400 text-center mb-6 font-bold uppercase tracking-widest">{errorMsg}</p>
                            )}

                            <button
                                onClick={handleSubmitDeposit}
                                disabled={!file || loading}
                                className="mt-4 w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-green-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                                ) : (
                                    "Submit for Verification"
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.02] border border-white/[0.08] p-10 sm:p-16 rounded-3xl glass text-center flex flex-col items-center justify-center min-h-[400px]"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
                                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-black relative z-10 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                                Deposit Submitted
                            </h2>
                            <p className="text-sm text-white/50 mb-10 leading-relaxed max-w-md mx-auto">
                                Your deposit of <strong className="text-white">${amount}</strong> via {selectedCrypto?.network} has been securely uploaded. An administrator will review your payment proof shortly. Once approved, the funds will reflect in your Active Balance automatically.
                            </p>

                            <Link
                                href="/dashboard"
                                className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase tracking-widest py-4 px-8 rounded-xl transition-all"
                            >
                                Return to Dashboard
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
