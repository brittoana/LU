import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";

const PALETTE = ["#6B8E23", "#A5B97B", "#D97706", "#D97706", "#9A3412", "#FDE68A", "#7B6A5D", "#556B2F"];

export default function CategorySummary({ categories }: { categories: { name: string; amount: number; percent: number }[] }) {
  const total = categories.reduce((s, c) => s + c.amount, 0);

  let cursor = 0;
  const stops = categories.map((category, index) => {
    const color = PALETTE[index % PALETTE.length];
    const start = cursor;
    cursor += category.percent;
    return `${color} ${start}% ${cursor}%`;
  });
  const gradient = stops.length ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#E7DDD2 0% 100%)";

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-[#2C1E18]">Gastos por categoria</h3></div>
      {categories.length === 0 ? (
        <EmptyState title="Nenhum gasto categorizado" text="Os percentuais aparecerão quando você registrar despesas." />
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: gradient }}>
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
              <p className="text-sm font-bold leading-tight text-[#2C1E18]">{formatCurrency(total)}</p>
              <p className="text-[10px] text-[#7B6A5D]">Total de gastos</p>
            </div>
          </div>
          <div className="w-full space-y-1">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={`/movimentacoes?category=${encodeURIComponent(category.name)}`}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm transition hover:bg-black/[0.04]"
              >
                <span className="flex items-center gap-2 text-[#2C1E18]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PALETTE[index % PALETTE.length] }} />
                  {category.name}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[#7B6A5D]">
                  {category.percent}% · {formatCurrency(category.amount)}
                  <ChevronRight size={14} className="text-[#A08E82]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
