"use client";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function DatePicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;
  const [viewYear, setViewYear] = useState(() => (selectedDate ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ?? new Date()).getMonth());
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openPicker() {
    if (selectedDate) { setViewYear(selectedDate.getFullYear()); setViewMonth(selectedDate.getMonth()); }
    setOpen((v) => !v);
  }

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const cells: { day: number; y: number; m: number; outside: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPrevMonth - i, y: viewMonth === 0 ? viewYear - 1 : viewYear, m: viewMonth === 0 ? 11 : viewMonth - 1, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d, y: viewYear, m: viewMonth, outside: false });
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay, y: viewMonth === 11 ? viewYear + 1 : viewYear, m: viewMonth === 11 ? 0 : viewMonth + 1, outside: true });
    nextDay += 1;
  }

  const display = selectedDate ? `${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}` : "";

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && <p className="text-sm font-medium text-[#3E2723]">{label}</p>}
      <div className="relative">
        <button type="button" onClick={openPicker} className="field flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition">
          <span className={display ? "text-[#2C1E18]" : "text-[#A08E82]"}>{display || "Selecione a data"}</span>
          <CalendarDays size={17} className="text-[#7B6A5D]" />
        </button>
        {open && (
          <div className="glass-strong absolute z-40 mt-2 w-72 rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Mês anterior" className="rounded-full p-1.5 text-[#6D5C50] hover:bg-white/60"><ChevronLeft size={18} /></button>
              <p className="text-sm font-bold text-[#2C1E18]">{MONTHS[viewMonth]} {viewYear}</p>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Próximo mês" className="rounded-full p-1.5 text-[#6D5C50] hover:bg-white/60"><ChevronRight size={18} /></button>
            </div>
            <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold text-[#7B6A5D]">
              {WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                const isSelected = !!selectedDate && !cell.outside && cell.y === selectedDate.getFullYear() && cell.m === selectedDate.getMonth() && cell.day === selectedDate.getDate();
                const isToday = cell.y === today.getFullYear() && cell.m === today.getMonth() && cell.day === today.getDate();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { onChange(toISO(cell.y, cell.m, cell.day)); setOpen(false); }}
                    className={`aspect-square rounded-full text-sm transition ${
                      isSelected ? "bg-[#6B8E23] font-semibold text-white" :
                      cell.outside ? "text-[#C9BFB5] hover:bg-white/40" :
                      isToday ? "font-semibold text-[#6B8E23] ring-1 ring-inset ring-[#A5B97B]" :
                      "text-[#2C1E18] hover:bg-white/60"
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
