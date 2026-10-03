import { Inbox } from "lucide-react";
export default function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E7DDD2] bg-[#FAF8F5] px-4 py-6 text-center">
      <Inbox className="mx-auto text-[#7B6A5D]" size={22} />
      <p className="mt-2 text-sm font-semibold text-[#3E2723]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#7B6A5D]">{text}</p>
    </div>
  );
}
