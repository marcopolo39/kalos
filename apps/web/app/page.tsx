import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "./_components/nav";
import { Hero } from "./_components/hero";
import { Footer } from "./_components/footer";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <Nav />
      <Hero />
      <Footer />
    </>
  );
}
