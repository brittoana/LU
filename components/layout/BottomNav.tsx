"use client";
import Link from "next/link";
import { BarChart3, CirclePlus, Home, List, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/movimentacoes", label: "Movimentações", icon: List },
  { href: "/novo", label: "Novo", icon: CirclePlus, main: true },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Mais", icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="glass-nav fixed inset-x-0 bottom-0 z-50 md:inset-x-auto md:bottom-4 md:left-1/2 md:w-[min(90vw,64rem)] md:-translate-x-1/2 md:rounded-3xl md:border md:border-white/50">
      <div className="mx-auto flex max-w-5xl items-end justify-around px-2 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        {items.map(({ href, label, icon: Icon, main }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex min-w-12 flex-1 flex-col items-center gap-1 text-[10px] font-medium sm:min-w-16 sm:text-[11px] ${active ? "text-[#6B8E23]" : "text-[#7B6A5D]"}`}>
              <span className={main ? "-mt-7 rounded-full bg-[#6B8E23] p-3 text-white shadow-[0_8px_20px_rgba(107, 142, 35, 0.34)]" : "p-1"}><Icon size={main ? 24 : 20} /></span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
