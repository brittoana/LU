"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function BalanceCard({ balance, available, committed }: { balance: number | null; available: number | null; committed: number | null }) {
  const [visible, setVisible] = useState(true);
  const display = (value: number | null) => (visible ? formatCurrency(value) : value === null ? "—" : "••••••");
  const percent = balance && available !== null && balance > 0 ? Math.max(0, Math.min(100, Math.round((available / balance) * 100))) : 0;

  return (
    <div className="flex flex-col justify-between p-4 md:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7B6A5D]">Saldo total</p>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar valores do saldo" : "Mostrar valores do saldo"}
          className="rounded-full p-1.5 text-[#7B6A5D] transition hover:bg-black/5"
        >
          {visible ? <Eye size={17} /> : <EyeOff size={17} />}
        </button>
      </div>
      <h2 className="mt-1 text-2xl font-bold text-[#2C1E18] sm:text-3xl md:text-4xl">{display(balance)}</h2>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#FDE68A]">
        <div className="h-full rounded-full bg-[#6B8E23] transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6B8E23]" />
          <div>
            <p className="text-[11px] text-[#7B6A5D]">Sobrou</p>
            <p className="font-semibold text-[#2C1E18]">{display(available)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
          <div>
            <p className="text-[11px] text-[#7B6A5D]">Comprometido</p>
            <p className="font-semibold text-[#2C1E18]">{display(committed)}</p>
          </div>
        </div>
      </div>

      {balance === null && <p className="mt-4 text-xs text-[#7B6A5D]">Os valores aparecerão depois que você registrar suas movimentações.</p>}
    </div>
  );
}
