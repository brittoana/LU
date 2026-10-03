import Link from "next/link";
import { Banknote, ChevronRight, CreditCard, House, Landmark, Zap } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

const CATEGORY_META: Record<string, { icon: typeof House; tag: string; bg: string; fg: string }> = {
  casa: { icon: House, tag: "Casa", bg: "bg-[#E6EED3]", fg: "text-[#556B2F]" },
  moradia: { icon: House, tag: "Casa", bg: "bg-[#E6EED3]", fg: "text-[#556B2F]" },
  cartão: { icon: CreditCard, tag: "Cartão", bg: "bg-[#F4E0A5]", fg: "text-[#D97706]" },
  cartao: { icon: CreditCard, tag: "Cartão", bg: "bg-[#F4E0A5]", fg: "text-[#D97706]" },
  empréstimo: { icon: Landmark, tag: "Dívida", bg: "bg-[#FEE2E2]", fg: "text-[#9A3412]" },
  emprestimo: { icon: Landmark, tag: "Dívida", bg: "bg-[#FEE2E2]", fg: "text-[#9A3412]" },
  financiamento: { icon: Landmark, tag: "Dívida", bg: "bg-[#FEE2E2]", fg: "text-[#9A3412]" },
  parcelamento: { icon: Landmark, tag: "Dívida", bg: "bg-[#FEE2E2]", fg: "text-[#9A3412]" },
  contas: { icon: Zap, tag: "Contas", bg: "bg-[#F4E0A5]", fg: "text-[#D97706]" },
};

function metaFor(category: string) {
  const key = category.trim().toLowerCase();
  if (key.includes("energia") || key.includes("luz")) return { icon: Zap, tag: "Casa", bg: "bg-[#F4E0A5]", fg: "text-[#D97706]" };
  return CATEGORY_META[key] || { icon: Banknote, tag: category || "Outros", bg: "bg-[#E6EED3]", fg: "text-[#556B2F]" };
}

export default function UpcomingBills({ items }: { items: Transaction[] }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[#2C1E18]">Próximos compromissos</h3>
        <Link href="/movimentacoes" className="flex items-center gap-0.5 text-xs font-semibold text-[#6B8E23]">Ver todos <ChevronRight size={14} /></Link>
      </div>
      {items.length === 0 ? (
        <EmptyState title="Nenhum compromisso futuro" text="Cadastre despesas com status agendado para vê-las aqui." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const meta = metaFor(item.category);
            const Icon = meta.icon;
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] px-4 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.fg}`}><Icon size={16} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#7B6A5D]">{new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.fg}`}>{meta.tag}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-[#2C1E18]">{item.description || item.category}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#2C1E18]">{formatCurrency(item.amount)}</p>
                <ChevronRight size={16} className="shrink-0 text-[#A08E82]" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
