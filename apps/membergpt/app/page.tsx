import { Chat } from "@/components/Chat";

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col bg-white">
      <header className="flex items-center border-b border-neutral-200 bg-black px-6 py-4">
        <h1 className="text-lg font-semibold text-white">MemberGPT</h1>
        <span className="ml-3 text-sm text-white/50">Coach assistant</span>
      </header>
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </main>
  );
}
