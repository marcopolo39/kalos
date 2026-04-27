import LogoutButton from "../dashboard/_components/LogoutButton";

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="bg-black text-white h-14 px-6 flex items-center justify-between">
        <span className="font-semibold text-white">Kalos</span>
        <LogoutButton />
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
