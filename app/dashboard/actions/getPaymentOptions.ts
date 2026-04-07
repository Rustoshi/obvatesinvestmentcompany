"use server";

import dbConnect from "@/lib/mongodb";
import PaymentOption from "@/models/PaymentOption";

export interface PaymentOptionData {
    id: string;
    network: string;
    ticker: string;
    walletAddress: string;
}

export async function getPaymentOptions(): Promise<PaymentOptionData[]> {
    try {
        await dbConnect();
        const options = await PaymentOption.find({ isActive: true }).lean();

        return options.map((opt: any) => ({
            id: opt._id.toString(),
            network: opt.network,
            ticker: opt.ticker,
            walletAddress: opt.walletAddress,
        }));
    } catch (error) {
        console.error("Failed to fetch payment options:", error);
        return [];
    }
}
