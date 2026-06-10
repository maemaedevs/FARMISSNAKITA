import { HandHeart, UserCheck, Users, Wheat } from 'lucide-react';
import { PageHeader } from '@/components/common';
import {
  RecentActivity,
  RevenueChart,
  StatCard,
} from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="A snapshot of barangay activity and farmer registrations."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Farmers" value="1,248" delta={4} icon={Users} />
        <StatCard
          label="Active Farmers"
          value="1,102"
          delta={2}
          icon={UserCheck}
        />
        <StatCard
          label="Hectares Registered"
          value="3,514"
          delta={6}
          icon={Wheat}
        />
        <StatCard
          label="Assistance Disbursed"
          value="₱48,920"
          delta={9}
          icon={HandHeart}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <RecentActivity />
      </div>
    </>
  );
}
