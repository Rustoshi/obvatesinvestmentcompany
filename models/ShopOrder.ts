import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Shop Order ─────────────────────────────────────────────────────────
export interface IShopOrder extends Document {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    paymentType: 'CASH' | 'FINANCE';
    orderStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    downPaymentAmount: number | null;
    monthlyPayment: number | null;
    financeTermMonths: number | null;
    aprAtPurchase: number | null;
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    paymentProofUrl?: string;
    selectedCrypto?: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const ShopOrderSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'ShopProduct',
            required: true,
        },
        paymentType: {
            type: String,
            enum: ['CASH', 'FINANCE'],
            required: true,
        },
        orderStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
            default: 'PENDING',
        },
        totalAmount: { type: Number, required: true },
        downPaymentAmount: { type: Number, default: null },
        monthlyPayment: { type: Number, default: null },
        financeTermMonths: { type: Number, default: null },
        aprAtPurchase: { type: Number, default: null },
        shippingAddress: {
            street: { type: String, required: false },
            city: { type: String, required: false },
            state: { type: String, required: false },
            zipCode: { type: String, required: false },
        },
        paymentProofUrl: { type: String, required: false },
        selectedCrypto: { type: String, required: false },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

// Indexes for performance
ShopOrderSchema.index({ userId: 1 });
ShopOrderSchema.index({ productId: 1 });
ShopOrderSchema.index({ orderStatus: 1 });

const ShopOrder =
    mongoose.models.ShopOrder ||
    mongoose.model<IShopOrder>('ShopOrder', ShopOrderSchema);

export default ShopOrder;
