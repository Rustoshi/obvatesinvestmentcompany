"use server";

import dbConnect from "@/lib/mongodb";
import CompanyDetails from "@/models/CompanyDetails";
import PaymentOption from "@/models/PaymentOption";
import InvestmentPlan from "@/models/InvestmentPlan";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// --- COMPANY DETAILS ACTIONS ---
export async function updateCompanyDetails(formData: FormData) {
    try {
        await dbConnect();
        const companyEmail = formData.get('companyEmail') as string;
        const contactPhone = formData.get('contactPhone') as string;
        const companyAddress = formData.get('companyAddress') as string;

        let details = await CompanyDetails.findOne();
        if (details) {
            details.companyEmail = companyEmail;
            details.contactPhone = contactPhone;
            details.companyAddress = companyAddress;
            await details.save();
        } else {
            await CompanyDetails.create({ companyEmail, contactPhone, companyAddress });
        }

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- PAYMENT OPTION ACTIONS ---
export async function addPaymentOption(formData: FormData) {
    try {
        await dbConnect();
        await PaymentOption.create({
            network: formData.get('network'),
            ticker: formData.get('ticker'),
            walletAddress: formData.get('walletAddress'),
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePaymentOption(id: string) {
    try {
        await dbConnect();
        await PaymentOption.findByIdAndDelete(id);
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- INVESTMENT PLAN ACTIONS ---
export async function addInvestmentPlan(formData: FormData) {
    try {
        await dbConnect();

        // Parse features from comma separated string or multiple inputs
        const rawFeatures = formData.get('features') as string;
        const features = rawFeatures.split(',').map(f => ({ text: f.trim() })).filter(f => f.text.length > 0);

        await InvestmentPlan.create({
            name: formData.get('name'),
            capitalRange: formData.get('capitalRange'),
            returnLow: Number(formData.get('returnLow')),
            returnHigh: formData.get('returnHigh') ? Number(formData.get('returnHigh')) : undefined,
            returnContext: formData.get('returnContext'),
            cycle: formData.get('cycle'),
            description: formData.get('description'),
            badge: formData.get('badge') || undefined,
            highlighted: formData.get('highlighted') === 'true',
            features: features
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateInvestmentPlan(id: string, formData: FormData) {
    try {
        await dbConnect();

        const rawFeatures = formData.get('features') as string;
        const features = rawFeatures.split(',').map(f => ({ text: f.trim() })).filter(f => f.text.length > 0);

        await InvestmentPlan.findByIdAndUpdate(id, {
            name: formData.get('name'),
            capitalRange: formData.get('capitalRange'),
            returnLow: Number(formData.get('returnLow')),
            returnHigh: formData.get('returnHigh') ? Number(formData.get('returnHigh')) : undefined,
            returnContext: formData.get('returnContext'),
            cycle: formData.get('cycle'),
            description: formData.get('description'),
            badge: formData.get('badge') || undefined,
            highlighted: formData.get('highlighted') === 'true',
            features: features
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteInvestmentPlan(id: string) {
    try {
        await dbConnect();
        await InvestmentPlan.findByIdAndDelete(id);
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- SECURITY ACTIONS ---
export async function updateAdminPassword(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            return { success: false, error: "New passwords do not match" };
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        if (user.password !== currentPassword) {
            return { success: false, error: "Incorrect current password" };
        }

        user.password = newPassword;
        await user.save();

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "An error occurred" };
    }
}
