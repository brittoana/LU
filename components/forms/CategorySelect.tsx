"use client";

import { useEffect, useMemo, useState } from "react";
import type { TransactionType } from "@/lib/types";
import { categoriesForType, categoryEmoji, normalizeCategory } from "@/lib/categories";

export default function CategorySelect({
  type,
  value,
  onChange,
}: {
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = useMemo(() => categoriesForType(type), [type]);
  const initialCustom = value !== "" && !options.includes(value);
  const [customMode, setCustomMode] = useState(initialCustom);
  const [custom, setCustom] = useState(initialCustom ? value : "");

  useEffect(() => {
    setCustomMode(false);
    setCustom("");
  }, [type]);

  return (
    <div className="space-y-2 md:col-span-2">
      <p className="text-sm font-medium text-[#3E2723]">Categoria</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Selecione uma categoria">
        {options.map((option) => {
          const active = !customMode && value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => { setCustomMode(false); setCustom(""); onChange(option); }}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                active ? "bg-[#6B8E23] text-white shadow-[0_4px_12px_rgba(107, 142, 35, 0.30)]" : "field text-[#3E2723]"
              }`}
            >
              <span aria-hidden="true">{categoryEmoji(option)}</span>
              {option}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => { setCustomMode(true); setCustom(""); onChange(""); }}
          aria-pressed={customMode}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
            customMode ? "bg-[#6B8E23] text-white shadow-[0_4px_12px_rgba(107, 142, 35, 0.30)]" : "field text-[#3E2723]"
          }`}
        >
          <span aria-hidden="true">✏️</span>
          Outra
        </button>
      </div>
      {customMode && (
        <input
          value={custom}
          onChange={(event) => {
            const next = event.target.value;
            setCustom(next);
            onChange(next.trim() ? normalizeCategory(next) : "");
          }}
          placeholder="Digite outra categoria"
          aria-label="Outra categoria"
          className="field w-full rounded-2xl px-4 py-3 outline-none transition"
          required
        />
      )}
    </div>
  );
}
