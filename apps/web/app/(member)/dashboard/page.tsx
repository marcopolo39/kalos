import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EmptyState } from "./_components/empty-state";

async function getDashboardData(supabase: SupabaseClient, userId: string) {
  const [{ data: firstScan }, { data: member }] = await Promise.all([
    supabase
      .from("scans")
      .select("id")
      .eq("member_id", userId)
      .limit(1)
      .maybeSingle(),
    supabase.from("members").select("name").eq("id", userId).single(),
  ]);

  return {
    hasScans: Boolean(firstScan),
    memberName: member?.name ?? "there",
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Middleware already validates/refreshes auth with getUser on /dashboard.
  // Read session locally here to avoid a second network call per request.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { hasScans, memberName } = await getDashboardData(supabase, session.user.id);

  if (!hasScans) {
    return <EmptyState memberName={memberName} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-black">Dashboard coming soon</h1>
      <p className="text-neutral-500">Your scan data will appear here.</p>
    </div>
  );
}
