import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export default function Select({ label, className = "", children, id, ...props }: Props) {
  const control = (
    <div className="relative">
      <select id={id} className={`field w-full rounded-2xl px-4 py-3 pr-10 outline-none transition ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7B6A5D]" />
    </div>
  );
  if (!label) return control;
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#3E2723]">{label}</span>
      {control}
    </label>
  );
}
