import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./_components/upload-form";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-black">
        Upload your DEXA scan
      </h1>
      <p className="text-neutral-500">
        Drop your Hologic PDF report and we&apos;ll extract your body
        composition data automatically.
      </p>
      <UploadForm />
    </div>
  );
}
