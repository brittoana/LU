import type { ButtonHTMLAttributes } from "react";
export default function Button({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-2xl bg-[#6B8E23] px-4 py-3 font-semibold text-white shadow-[0_6px_16px_rgba(107, 142, 35, 0.30)] transition hover:bg-[#556B2F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}
