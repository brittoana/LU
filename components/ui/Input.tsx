import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Ex.: "R$" para campos monetários, exibido fixo à esquerda do campo. */
  prefix?: string;
}

export default function Input({ label, className = "", prefix, ...props }: Props) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#3E2723]">{label}{prefix ? <span className="ml-1 font-normal text-[#7B6A5D]">(em {prefix})</span> : null}</span>
      {prefix ? (
        <div className="field flex items-center rounded-2xl pl-4 transition focus-within:border-[#A5B97B] focus-within:shadow-[0_0_0_3px_rgba(107, 142, 35, 0.22)] focus-within:bg-white/60">
          <span className="shrink-0 text-sm font-semibold text-[#7B6A5D]">{prefix}</span>
          <input className={`w-full bg-transparent px-3 py-3 outline-none ${className}`} {...props} />
        </div>
      ) : (
        <input className={`field w-full rounded-2xl px-4 py-3 outline-none transition ${className}`} {...props} />
      )}
    </label>
  );
}
