import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";

const items = [
  { key: "income", label: "Entrou", icon: ArrowUpRight, fg: "text-[#6B8E23]", bg: "bg-[#E6EED3]" },
  { key: "expenses", label: "Saiu", icon: ArrowDownRight, fg: "text-[#D97706]", bg: "bg-[#F4E0A5]" },
  { key: "receivable", label: "A receber", icon: Wallet, fg: "text-[#D97706]", bg: "bg-[#F4E0A5]" },
] as const;

export default function SummaryMetrics(props: { income: number | null; expenses: number | null; receivable: number | null }) {
  return (
    <>
    {/* Celular: três números lado a lado, sem setas nem ícones */}
    <div className="grid grid-cols-3 gap-2 border-t border-black/5 px-4 py-3 text-center sm:hidden">
      {items.map(({ key, label }) => (
        <Link key={key} href="/movimentacoes" className="rounded-xl px-1 py-1.5">
          <p className="text-[11px] text-[#7B6A5D]">{label}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#2C1E18]">{formatCurrency(props[key])}</p>
        </Link>
      ))}
    </div>
    <div className="hidden flex-col justify-center gap-2.5 border-l border-black/5 p-5 sm:flex md:p-6">
      {items.map(({ key, label, icon: Icon, fg, bg }) => (
        <Link
          key={key}
          href="/movimentacoes"
          className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2 transition hover:bg-black/5"
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${bg} ${fg}`}><Icon size={17} /></span>
            <div>
              <p className="text-xs text-[#7B6A5D]">{label}</p>
              <p className="font-semibold text-[#2C1E18]">{formatCurrency(props[key])}</p>
            </div>
          </div>
          <ChevronRight size={16} className="shrink-0 text-[#A08E82]" />
        </Link>
      ))}
    </div>
    </>
  );
}
