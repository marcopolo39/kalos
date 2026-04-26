"use server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SEX = ["Male", "Female"] as const;

type RegisterState = { error: string } | { success: true } | undefined;

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const dob = (formData.get("dob") as string | null)?.trim() ?? "";
  const sex = (formData.get("sex") as string | null)?.trim() ?? "";

  if (!name) {
    return { error: "Full name is required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!DOB_RE.test(dob) || isNaN(Date.parse(dob))) {
    return { error: "Please enter a valid date of birth (YYYY-MM-DD)." };
  }
  if (!VALID_SEX.includes(sex as (typeof VALID_SEX)[number])) {
    return { error: "Please select a valid sex." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, dob, sex },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
