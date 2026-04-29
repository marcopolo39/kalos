import { ReactNode } from "react";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {children}
    </div>
  );
}
