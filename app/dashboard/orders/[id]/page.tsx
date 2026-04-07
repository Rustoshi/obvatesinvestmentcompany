import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import ShopOrder from "@/models/ShopOrder";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, CreditCard, Box, Wallet } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || !session.user) {
        redirect("/invest/login");
    }

    await dbConnect();

    let order;
    try {
        order = await ShopOrder.findOne({ _id: id, userId: session.user.id })
            .populate("productId", "name heroImage specs category")
            .lean();
    } catch (error) {
        return notFound();
    }

    if (!order) return notFound();

    const product = order.productId as any;
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
    const isCrypto = !!order.selectedCrypto;

    let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    let statusText = "Pending Verification";
    if (order.orderStatus === "COMPLETED") { statusColor = "bg-green-500/10 text-green-500 border-green-500/20"; statusText = "Delivered"; }
    if (order.orderStatus === "REJECTED") { statusColor = "bg-red-500/10 text-red-500 border-red-500/20"; statusText = "Payment Rejected"; }
    if (order.orderStatus === "SENT") { statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20"; statusText = "In Transit"; }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">
            {/* Header & Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <BackButton label="Go Back" />
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                        Order Details
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-white/40 font-mono tracking-widest uppercase">ID: {order._id.toString()}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-xs text-white/40 tracking-widest uppercase">{orderDate}</span>
                    </div>
                </div>

                <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${statusColor}`}>
                    {order.orderStatus === "COMPLETED" && <ShieldCheck className="w-5 h-5" />}
                    <span className="text-xs font-bold tracking-widest uppercase">{statusText}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Product Card */}
                    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
                        {product?.heroImage ? (
                            <div className="w-full sm:w-1/2 aspect-[4/3] relative rounded-lg overflow-hidden bg-white/[0.02]">
                                <Image src={product.heroImage} alt={product.name} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-full sm:w-1/2 aspect-[4/3] relative rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                                <Box className="w-12 h-12 text-white/10" />
                            </div>
                        )}

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="text-[10px] text-red-500 font-bold tracking-widest uppercase mb-2">{product?.category || "VEHICLE"}</div>
                            <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">{product?.name || "Unknown Product"}</h2>
                            <p className="text-sm text-white/40 tracking-widest uppercase mb-6">{order.variantName}</p>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.08]">
                                <div>
                                    <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Total Value</div>
                                    <div className="text-xl font-bold text-white">${order.totalAmount?.toLocaleString()}</div>
                                </div>
                                {order.paymentType === "FINANCE" && (
                                    <div>
                                        <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Est. Monthly</div>
                                        <div className="text-xl font-bold text-white">${order.monthlyPayment?.toLocaleString()}</div>
                                        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{order.financeTermMonths} Months</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                        <MapPin className="absolute top-8 right-8 w-32 h-32 text-white/[0.02] -rotate-12 pointer-events-none" />
                        <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <MapPin className="w-4 h-4 text-white/60" />
                            </span>
                            Delivery Information
                        </h3>

                        {order.shippingAddress?.street ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">Street</div>
                                    <div className="text-sm font-bold text-white tracking-widest uppercase">{order.shippingAddress.street}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">City</div>
                                    <div className="text-sm font-bold text-white tracking-widest uppercase">{order.shippingAddress.city}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">State</div>
                                    <div className="text-sm font-bold text-white tracking-widest uppercase">{order.shippingAddress.state}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">Zip Code</div>
                                    <div className="text-sm font-bold text-white tracking-widest uppercase">{order.shippingAddress.zipCode}</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-white/40 tracking-widest uppercase">No shipping information provided.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <CreditCard className="w-4 h-4 text-white/60" />
                            </span>
                            Payment Details
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                                <span className="text-xs text-white/40 tracking-widest uppercase">Method</span>
                                <span className="text-xs font-bold text-white tracking-widest uppercase">{order.paymentType}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                                <span className="text-xs text-white/40 tracking-widest uppercase">Paid Via</span>
                                <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                    <Wallet className="w-3 h-3 text-red-500" />
                                    {order.selectedCrypto || "System Balance"}
                                </span>
                            </div>

                            {order.paymentType === "FINANCE" && order.downPaymentAmount && (
                                <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                                    <span className="text-xs text-white/40 tracking-widest uppercase">Downpayment Made</span>
                                    <span className="text-xs font-bold text-white tracking-widest uppercase">${order.downPaymentAmount?.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-4 mt-2">
                                <span className="text-sm text-white/60 tracking-widest uppercase font-bold">Amount Due</span>
                                <span className="text-lg font-black text-green-500 tracking-widest">PAID</span>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Verification Box */}
                    {order.paymentProofUrl && (
                        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                            <h3 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4">
                                Verification Receipt
                            </h3>
                            <a
                                href={order.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 group cursor-zoom-in bg-white/[0.02]"
                            >
                                <Image
                                    src={order.paymentProofUrl}
                                    alt="Payment Receipt"
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-xs font-bold text-white tracking-widest uppercase px-4 py-2 bg-black/80 rounded-lg">View Full Image</span>
                                </div>
                            </a>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
