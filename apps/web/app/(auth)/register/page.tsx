"use client";

import { useActionState } from "react";
import { registerAction } from "./actions";
import { RegisterForm } from "./_components/register-form";
import { RegisterSuccess } from "./_components/register-success";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  if (state && "success" in state) {
    return <RegisterSuccess />;
  }

  return (
    <RegisterForm
      action={action}
      pending={pending}
      error={state && "error" in state ? state.error : undefined}
    />
  );
}
