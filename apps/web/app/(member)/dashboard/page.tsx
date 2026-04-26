import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EmptyState } from "./_components/empty-state";

async function getDashboardData(supabase: SupabaseClient, userId: string) {
  const [{ count }, { data: member }] = await Promise.all([
    supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("member_id", userId),
    supabase.from("members").select("name").eq("id", userId).single(),
  ]);

  return {
    scanCount: count ?? 0,
    memberName: member?.name ?? "there",
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { scanCount, memberName } = await getDashboardData(supabase, user.id);

  if (scanCount === 0) {
    return <EmptyState memberName={memberName} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-black">Dashboard coming soon</h1>
      <p className="text-neutral-500">Your scan data will appear here.</p>
    </div>
  );
}
