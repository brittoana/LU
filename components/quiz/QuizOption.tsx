export default function QuizOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-4 text-left text-sm transition ${
        selected
          ? "border border-[#556B2F] bg-[#E6EED3]/80 font-semibold text-[#6B8E23] shadow-[0_0_0_3px_rgba(107, 142, 35, 0.22)]"
          : "field text-[#3E2723]"
      }`}
    >
      {label}
    </button>
  );
}
