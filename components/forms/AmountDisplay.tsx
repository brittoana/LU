"use client";
import { useRef } from "react";

/** Mantém só dígitos e no máximo uma vírgula/ponto decimal, formatando como valor monetário grande. */
function digitsToAmount(digits: string) {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "";
  const cents = clean.padStart(3, "0");
  const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, "");
  const decPart = cents.slice(-2);
  return `${intPart || "0"},${decPart}`;
}

export default function AmountDisplay({
  value,
  onChange,
  autoFocus = true,
}: {
  /** Valor numérico em string, ex.: "42.5" */
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value ? String(Math.round(Number(value) * 100)) : "";
  const display = digits ? digitsToAmount(digits) : "0,00";

  function handleDigits(raw: string) {
    const onlyDigits = raw.replace(/\D/g, "").slice(-9);
    if (!onlyDigits) {
      onChange("");
      return;
    }
    const numeric = Number(onlyDigits) / 100;
    onChange(String(numeric));
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.focus()}
      className="field flex w-full flex-col items-center gap-1 rounded-3xl px-4 py-8 text-center transition"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-[#7B6A5D]">Valor</span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-[#7B6A5D]">R$</span>
        <span className={`text-5xl font-bold tabular-nums sm:text-6xl ${digits ? "text-[#2C1E18]" : "text-[#A08E82]"}`}>{display}</span>
      </span>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        inputMode="numeric"
        pattern="[0-9]*"
        value={digits}
        onChange={(event) => handleDigits(event.target.value)}
        className="sr-only"
        aria-label="Valor em reais"
      />
    </button>
  );
}
