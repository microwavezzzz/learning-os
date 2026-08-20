import { dashboardRepo } from "@/db/repositories/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

// Ensure real-time database querying
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const initialData = dashboardRepo.getDashboardData("demo-user-1");

  return <DashboardView initialData={initialData} />;
}
