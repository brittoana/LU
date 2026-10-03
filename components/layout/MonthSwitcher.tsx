"use client";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel } from "@/lib/format";

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function MonthSwitcher({ selected, onSelect }: { selected: Date; onSelect: (date: Date) => void }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setViewYear(selected.getFullYear()); setOpen((v) => !v); }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[#3E2723] transition hover:brightness-105"
      >
        <CalendarDays size={16} className="text-[#6B8E23]" />
        {monthLabel(selected)}
        <ChevronDown size={16} className={`text-[#7B6A5D] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="dialog" aria-label="Selecionar mês" className="glass-strong absolute right-0 z-40 mt-2 w-64 rounded-3xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setViewYear((y) => y - 1)} aria-label="Ano anterior" className="rounded-full p-1.5 text-[#6D5C50] hover:bg-white/60"><ChevronLeft size={18} /></button>
            <p className="text-sm font-bold text-[#2C1E18]">{viewYear}</p>
            <button type="button" onClick={() => setViewYear((y) => y + 1)} aria-label="Próximo ano" className="rounded-full p-1.5 text-[#6D5C50] hover:bg-white/60"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS_SHORT.map((label, index) => {
              const active = viewYear === selected.getFullYear() && index === selected.getMonth();
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => { onSelect(new Date(viewYear, index, 1)); setOpen(false); }}
                  className={`rounded-xl py-2.5 text-sm transition ${active ? "bg-[#6B8E23] font-semibold text-white" : "text-[#3E2723] hover:bg-white/60"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
