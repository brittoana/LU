import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import RouteGuard from "@/components/auth/RouteGuard";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <main className="min-h-screen bg-[#FAF8F5]">
        <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6 md:pb-24 md:pt-6">
          <TopBar />
          {children}
        </div>
        <BottomNav />
      </main>
    </RouteGuard>
  );
}
