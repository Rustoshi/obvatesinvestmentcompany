import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import UserPlan from "@/models/UserPlan";
import InvestmentPlan from "@/models/InvestmentPlan";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import UserDetailsTabs from "@/components/admin/UserDetailsTabs";

export default async function UserDetailsPage(props: any) {
    await getServerSession(authOptions);
    await dbConnect();

    // In newer Next.js versions params is a promise
    const params = await props.params;

    const user = await User.findById(params.id).lean();

    if (!user) {
        notFound();
    }

    // Fetch user's active plans to support the new Profit transaction UI
    const plans = await UserPlan.find({ userId: user._id, status: 'active' }).lean();
    const serializedPlans = plans.map(p => ({
        ...p,
        _id: p._id.toString(),
        userId: p.userId.toString()
    }));

    // Fetch all system investment plans to allow admin to subscribe the user
    const systemPlans = await InvestmentPlan.find({ isActive: true }).lean();
    const serializedSystemPlans = systemPlans.map(p => ({
        ...p,
        _id: p._id.toString()
    }));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

            {/* Header Area */}
            <div className="flex items-center gap-4 border-b border-white/[0.08] pb-6">
                <Link href="/admin/dashboard" className="p-2 border border-white/[0.08] hover:bg-white/[0.05] rounded-lg transition-colors group">
                    <ChevronLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold tracking-widest text-white uppercase font-montserrat flex items-center gap-3">
                        {user.firstName} {user.lastName}
                        <span className={`text-[10px] px-2 py-0.5 rounded ${user.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                            {user.kycStatus || 'Unverified'}
                        </span>
                    </h2>
                    <p className="text-xs text-white/40 tracking-wider">User ID: {user._id.toString()}</p>
                </div>
            </div>

            {/* Interactive User Management Tabs */}
            <UserDetailsTabs
                user={user}
                userPlans={serializedPlans}
                systemPlans={serializedSystemPlans}
            />
        </div>
    );
}
