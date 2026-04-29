import type { Metadata } from "next";
import LogoutButton from "@/app/_components/logout-button";

export const metadata: Metadata = {
  title: "Set Goals – Kalos",
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="bg-black text-white h-14 px-6 flex items-center justify-between">
        <span className="font-semibold text-white">Kalos</span>
        <LogoutButton />
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
