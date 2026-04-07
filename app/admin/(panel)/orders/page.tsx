import dbConnect from "@/lib/mongodb";
import ShopOrder from "@/models/ShopOrder";
import OrdersClient from "@/components/admin/OrdersClient";

export default async function AdminOrdersPage() {
    await dbConnect();

    const rawOrders = await ShopOrder.find()
        .populate("productId", "name slug category heroImage")
        .populate("userId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .lean();

    const serializedOrders = rawOrders.map((o: any) => ({
        _id: o._id.toString(),
        user: o.userId ? {
            _id: o.userId._id?.toString() || "",
            name: `${o.userId.firstName || ""} ${o.userId.lastName || ""}`.trim() || "Unknown",
            email: o.userId.email || "",
        } : { _id: "", name: "Deleted User", email: "" },
        product: o.productId ? {
            _id: o.productId._id?.toString() || "",
            name: o.productId.name || "Unknown Product",
            slug: o.productId.slug || "",
            category: o.productId.category || "VEHICLE",
            heroImage: o.productId.heroImage || "",
        } : { _id: "", name: "Deleted Product", slug: "", category: "VEHICLE", heroImage: "" },
        paymentType: o.paymentType || "CASH",
        orderStatus: o.orderStatus || "PENDING",
        totalAmount: o.totalAmount || 0,
        downPaymentAmount: o.downPaymentAmount,
        monthlyPayment: o.monthlyPayment,
        financeTermMonths: o.financeTermMonths,
        aprAtPurchase: o.aprAtPurchase,
        notes: o.notes || "",
        createdAt: o.createdAt?.toISOString() || "",
    }));

    return <OrdersClient orders={serializedOrders} />;
}
