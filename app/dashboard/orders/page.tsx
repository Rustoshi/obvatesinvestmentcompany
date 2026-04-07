import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import ShopOrder from "@/models/ShopOrder";
import Link from "next/link";
import { Eye, Package, ShieldCheck } from "lucide-react";

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/invest/login");
    }

    await dbConnect();

    // Fetch orders and populate the product details
    const orders = await ShopOrder.find({ userId: session.user.id })
        .populate("productId", "name heroImage")
        .sort({ createdAt: -1 })
        .lean();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-10 text-center relative">
                <div className="inline-flex items-center justify-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] mb-6">
                    <Package className="w-8 h-8 text-white sm:w-10 sm:h-10" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
                    Order History
                </h1>
                <p className="text-sm text-white/40 mt-4 tracking-widest uppercase">
                    Track and manage your Tesla purchases
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] p-10 rounded-2xl text-center flex flex-col items-center">
                    <Package className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2">No Orders Found</h3>
                    <p className="text-sm text-white/40 mb-8 max-w-md">You haven't placed any orders yet. Visit the shop to explore our available models.</p>
                    <Link href="/dashboard?tab=shop" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors">
                        Browse Shop
                    </Link>
                </div>
            ) : (
                <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#111111] border-b border-white/[0.08]">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Product</th>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Total</th>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {orders.map((order: any) => {
                                    const productName = order.productId ? order.productId.name : "Unknown Product";
                                    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
                                    const amountStr = `$${(order.totalAmount || 0).toLocaleString()}`;

                                    let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                                    if (order.orderStatus === "COMPLETED") statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
                                    if (order.orderStatus === "REJECTED") statusColor = "bg-red-500/10 text-red-500 border-red-500/20";
                                    if (order.orderStatus === "SENT") statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";

                                    return (
                                        <tr key={order._id.toString()} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-xs font-mono text-white/60">{order._id.toString().substring(0, 8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-xs font-bold text-white tracking-widest">{orderDate}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-bold text-white tracking-widest">{productName}</div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{order.variantName}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-white/5 text-white/80 border border-white/10">
                                                    {order.paymentType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm font-black text-white">{amountStr}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusColor}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/dashboard/orders/${order._id}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-white transition-all active:scale-95"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
