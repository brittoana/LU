"use client";
import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";

function toISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function QuickDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const today = toISO(new Date());
  const yesterday = toISO(new Date(Date.now() - 86400000));
  const isOther = value !== "" && value !== today && value !== yesterday;
  const [showOther, setShowOther] = useState(isOther);

  const options: { label: string; date: string }[] = [
    { label: "Hoje", date: today },
    { label: "Ontem", date: yesterday },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#3E2723]">Quando</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = !showOther && value === option.date;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => { setShowOther(false); onChange(option.date); }}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                active ? "bg-[#6B8E23] text-white shadow-[0_4px_12px_rgba(107, 142, 35, 0.30)]" : "field text-[#3E2723]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowOther((v) => !v)}
          className={`rounded-full px-4 py-2.5 text-sm font-medium text-[#7B6A5D] underline decoration-dotted underline-offset-4 transition ${showOther ? "text-[#6B8E23]" : ""}`}
        >
          Outra data
        </button>
      </div>
      {showOther && (
        <div className="pt-1">
          <DatePicker label="" value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
