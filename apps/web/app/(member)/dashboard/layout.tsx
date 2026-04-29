import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/_components/logout-button";
import { AddScanButton } from "./_components/AddScanButton";

export const metadata: Metadata = {
  title: "Dashboard – Kalos",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let scanCount = 0;
  let hasGoal = false;

  if (session?.user) {
    const [{ count }, { data: goals }] = await Promise.all([
      supabase
        .from("scans")
        .select("id", { count: "exact", head: true })
        .eq("member_id", session.user.id),
      supabase
        .from("member_goals")
        .select("id")
        .eq("member_id", session.user.id)
        .limit(1),
    ]);
    scanCount = count ?? 0;
    hasGoal = (goals?.length ?? 0) > 0;
  }

  return (
    <>
      <nav className="bg-black text-white h-14 px-6 flex items-center justify-between">
        <span className="font-semibold text-white">Kalos</span>
        <div className="flex items-center gap-4">
          <AddScanButton scanCount={scanCount} hasGoal={hasGoal} />
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
