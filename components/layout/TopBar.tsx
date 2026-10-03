"use client";
import Link from "next/link";
import { X } from "lucide-react";
import LumaLogo from "@/components/ui/LumaLogo";
import Avatar from "@/components/ui/Avatar";
import { useApp } from "@/components/providers/AppProvider";

export default function TopBar() {
  const { state, syncError, dismissSyncError } = useApp();
  return (
    <>
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="Luma, ir para o início">
          <LumaLogo size={30} />
          <span className="text-lg font-bold tracking-tight text-[#2C1E18]">Luma</span>
        </Link>
        <Link href="/configuracoes" aria-label="Meu perfil e configurações"><Avatar src={state.user?.avatarUrl} name={state.user?.name} size={36} /></Link>
      </div>
      {syncError && (
        <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#DC2626]">
          <span>{syncError}</span>
          <button type="button" onClick={dismissSyncError} aria-label="Fechar aviso" className="shrink-0 rounded-full p-0.5 hover:bg-white/60"><X size={16} /></button>
        </div>
      )}
    </>
  );
}
