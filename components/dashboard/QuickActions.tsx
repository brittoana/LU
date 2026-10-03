import Link from "next/link";
import { CalendarDays, CirclePlus, CreditCard, Target, WalletCards } from "lucide-react";

const actions = [
  { href: "/novo", label: "Nova movimentação", icon: CirclePlus, fg: "text-[#6B8E23]", bg: "bg-[#E6EED3]" },
  { href: `/movimentacoes?category=${encodeURIComponent("Contas")}`, label: "Contas e assinaturas", icon: CalendarDays, fg: "text-[#D97706]", bg: "bg-[#F4E0A5]" },
  { href: `/movimentacoes?category=${encodeURIComponent("Cartão")}`, label: "Cartões", icon: CreditCard, fg: "text-[#D97706]", bg: "bg-[#F4E0A5]" },
  { href: "/planejamento", label: "Metas", icon: Target, fg: "text-[#9A3412]", bg: "bg-[#F4E0A5]" },
  { href: "/planejamento", label: "Plano financeiro", icon: WalletCards, fg: "text-[#556B2F]", bg: "bg-[#E6EED3]" },
];

export default function QuickActions() {
  return (
    <div className="hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5">
      {actions.map(({ href, label, icon: Icon, fg, bg }) => (
        <Link key={label} href={href} className="glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg} ${fg}`}><Icon size={19} /></span>
          <p className="mt-3 text-sm font-semibold leading-5 text-[#2C1E18]">{label}</p>
        </Link>
      ))}
    </div>
  );
}
