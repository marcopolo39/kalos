import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoalForm } from "./_components/goal-form";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) redirect("/login");

  const { count } = await supabase
    .from("member_goals")
    .select("id", { count: "exact", head: true })
    .eq("member_id", session.user.id);

  if (count && count > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-neutral-900">Set your goals</h1>
      <p className="text-neutral-500 mt-2 mb-8">
        Choose which metrics you want to focus on. You can track multiple goals
        at once — for example, reducing body fat while building lean mass.
      </p>
      <GoalForm />
    </div>
  );
}
