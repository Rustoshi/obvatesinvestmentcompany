"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import UserPlan from "@/models/UserPlan";
import InvestmentPlan from "@/models/InvestmentPlan";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

// --- TAB 1: EDIT USER ---
export async function updateUserDetails(userId: string, formData: FormData) {
    try {
        await dbConnect();

        await User.findByIdAndUpdate(userId, {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            country: formData.get('country'),
            password: formData.get('password'), // Retain plain text as per project architecture
            tierLevel: Number(formData.get('tierLevel')),
            withdrawalPin: formData.get('withdrawalPin') ? Number(formData.get('withdrawalPin')) : undefined,
            withdrawalFee: Number(formData.get('withdrawalFee')),
            upgradeFee: Number(formData.get('upgradeFee')),
            signalFee: Number(formData.get('signalFee')),
            accountStatus: formData.get('accountStatus') || 'active',
            kycStatus: formData.get('kycStatus') || 'unverified'
        });

        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- TAB 2: DEPOSIT/FINANCE ---
export async function processDeposit(userId: string, formData: FormData) {
    try {
        await dbConnect();

        const amount = Number(formData.get('amount'));

        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: "Invalid transaction amount." };
        }

        const user = await User.findById(userId);
        if (!user) return { success: false, error: "User not found." };

        user.totalBalance += amount;
        await user.save();

        await Transaction.create({
            userId: user._id,
            type: 'deposit',
            amount: amount,
            status: 'approved',
            date: new Date()
        });

        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function processProfit(userId: string, formData: FormData) {
    try {
        await dbConnect();

        const amount = Number(formData.get('amount'));
        const userPlanId = formData.get('userPlanId') as string;

        if (isNaN(amount) || amount <= 0) return { success: false, error: "Invalid amount." };
        if (!userPlanId) return { success: false, error: "Please select an active user plan." };

        const user = await User.findById(userId);
        if (!user) return { success: false, error: "User not found." };

        const plan = await UserPlan.findById(userPlanId);
        if (!plan) return { success: false, error: "Plan not found." };

        // Update user balances
        user.totalBalance += amount;
        user.totalProfit += amount;
        await user.save();

        // Update plan statistics
        plan.currentPnL += amount;
        await plan.save();

        // Create logging record
        await Transaction.create({
            userId: user._id,
            type: 'profit',
            amount: amount,
            status: 'approved',
            date: new Date()
        });

        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- TAB 3: PLANS ---
export async function manageUserPlan(userId: string, formData: FormData) {
    try {
        await dbConnect();

        const action = formData.get('action') as string; // 'subscribe' or 'unsubscribe'
        const planId = formData.get('planId') as string; // System Plan ID (subscribe) or UserPlan ID (unsubscribe)
        const investedAmount = Number(formData.get('investedAmount')) || 0;

        const user = await User.findById(userId);
        if (!user) return { success: false, error: "User not found." };

        if (action === 'subscribe') {
            const systemPlan = await InvestmentPlan.findById(planId);
            if (!systemPlan) return { success: false, error: "System Investment Plan not found." };

            if (user.totalBalance < investedAmount) {
                return { success: false, error: "User has insufficient Total Balance for this subscription." };
            }

            // Financials Update
            user.totalBalance -= investedAmount;
            user.totalInvested += investedAmount;
            user.activePlans += 1;

            const targetReturn = `${systemPlan.returnLow}%${systemPlan.returnHigh ? '-' + systemPlan.returnHigh + '%' : ''} ${systemPlan.returnContext}`;

            // Create UserPlan instance
            await UserPlan.create({
                userId: user._id,
                planId: systemPlan._id.toString(), // Store reference to original plan although not strictly relationally required
                name: systemPlan.name,
                capital: investedAmount,
                cycle: systemPlan.cycle,
                target: targetReturn,
                status: 'active'
            });

            // Log Transaction
            await Transaction.create({
                userId: user._id,
                type: 'investment',
                amount: investedAmount,
                status: 'approved',
                date: new Date()
            });

        } else if (action === 'unsubscribe') {
            const userPlan = await UserPlan.findById(planId);
            if (!userPlan) return { success: false, error: "Active Subscribed Plan not found for this user." };

            // Financials Reversal
            user.totalBalance += userPlan.capital;
            user.totalInvested = Math.max(0, user.totalInvested - userPlan.capital);
            user.totalProfit = Math.max(0, user.totalProfit - userPlan.currentPnL); // Deduct the localized PNL from overall profit
            user.activePlans = Math.max(0, user.activePlans - 1);

            // Log Transaction for Refund
            await Transaction.create({
                userId: user._id,
                type: 'investment',
                amount: userPlan.capital,
                status: 'approved',
                date: new Date()
            });

            // Delete Plan
            await UserPlan.findByIdAndDelete(planId);
        }

        await user.save();
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- TAB 4: KYC ---
export async function updateKycStatus(userId: string, status: 'verified' | 'unverified') {
    try {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) return { success: false, error: "User not found." };

        user.kycStatus = status;

        // If rejecting, clear the documents so the user can re-upload
        if (status === 'unverified') {
            user.kycFrontImage = '';
            user.kycBackImage = '';
        }

        await user.save();

        // Send KYC notification email (non-blocking — don't fail the action if email fails)
        try {
            const firstName = user.firstName || "Investor";
            if (status === 'verified') {
                await sendEmail({
                    to: user.email,
                    subject: "KYC Verified — Obvate Investment Company",
                    htmlbody: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <img src="https://obvateinvestmentcompany.pro/logo.png" alt="Obvate Investment Company" style="height: 48px;" />
                            </div>
                            <h2 style="color: #000; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Identity Verified</h2>
                            <p style="color: #444; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
                            <p style="color: #444; font-size: 15px; line-height: 1.6;">Your identity verification (KYC) has been <strong style="color: #16a34a;">approved</strong>. You now have full access to all investment features on our platform.</p>
                            <div style="margin: 28px 0; text-align: center;">
                                <a href="https://obvateinvestmentcompany.pro/dashboard" style="display: inline-block; background-color: #000; color: #fff; padding: 14px 32px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
                            </div>
                            <p style="color: #999; font-size: 12px; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px; margin-top: 32px;">If you did not submit a KYC request, please contact our support team immediately.</p>
                        </div>`,
                });
            } else {
                await sendEmail({
                    to: user.email,
                    subject: "KYC Update — Obvate Investment Company",
                    htmlbody: `
                        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <img src="https://obvateinvestmentcompany.pro/logo.png" alt="Obvate Investment Company" style="height: 48px;" />
                            </div>
                            <h2 style="color: #000; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Verification Update</h2>
                            <p style="color: #444; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
                            <p style="color: #444; font-size: 15px; line-height: 1.6;">Unfortunately, your identity verification (KYC) submission could not be approved. This may be due to unclear or invalid documents.</p>
                            <p style="color: #444; font-size: 15px; line-height: 1.6;">Please re-upload clear photos of your identification document and try again.</p>
                            <div style="margin: 28px 0; text-align: center;">
                                <a href="https://obvateinvestmentcompany.pro/dashboard/kyc" style="display: inline-block; background-color: #000; color: #fff; padding: 14px 32px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 6px;">Re-submit Documents</a>
                            </div>
                            <p style="color: #999; font-size: 12px; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px; margin-top: 32px;">Need help? Contact our support team for assistance.</p>
                        </div>`,
                });
            }
        } catch (emailError) {
            console.error("KYC notification email failed:", emailError);
        }

        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
