import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import CompanyDetails from "@/models/CompanyDetails";
import PaymentOption from "@/models/PaymentOption";
import InvestmentPlan from "@/models/InvestmentPlan";
import SettingsTabs from "@/components/admin/SettingsTabs";

export default async function AdminSettingsPage() {
    await getServerSession(authOptions);
    await dbConnect();

    // Fetch or create default Company Details
    let companyDetails = await CompanyDetails.findOne().lean();
    if (!companyDetails) {
        const defaultDetails = await CompanyDetails.create({});
        companyDetails = defaultDetails.toObject();
    }

    // Fetch Payment Options
    const rawPaymentOptions = await PaymentOption.find().sort({ createdAt: -1 }).lean();
    const paymentOptions = rawPaymentOptions.map(p => ({
        ...p,
        _id: p._id?.toString(),
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString()
    }));

    // Fetch Investment Plans
    const rawInvestmentPlans = await InvestmentPlan.find().sort({ createdAt: -1 }).lean();
    const investmentPlans = rawInvestmentPlans.map(p => ({
        ...p,
        _id: p._id?.toString(),
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString(),
        // Ensure features have their own IDs strings if needed by React, though they should have _id from Mongo
        features: p.features.map((f: any) => ({ ...f, _id: f._id?.toString() }))
    }));

    // Serialize Company Details
    const serializedCompanyDetails = {
        ...companyDetails,
        _id: companyDetails._id?.toString(),
        createdAt: companyDetails.createdAt?.toISOString(),
        updatedAt: companyDetails.updatedAt?.toISOString()
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-black uppercase tracking-[0.1em] text-white" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>Platform Settings</h1>
                <p className="text-sm text-white/50 tracking-wider">Manage global application configurations, deposit gateways, and capital programs.</p>
            </div>

            {/* Interactive Tabs */}
            <SettingsTabs
                companyDetails={serializedCompanyDetails}
                paymentOptions={paymentOptions}
                investmentPlans={investmentPlans}
            />
        </div>
    );
}
