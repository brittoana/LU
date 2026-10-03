import QuizOption from "@/components/quiz/QuizOption";
import type { YesNo as YesNoValue } from "@/lib/onboarding";

export default function YesNo({ question, value, onChange }: { question: string; value: YesNoValue; onChange: (v: "yes" | "no") => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{question}</p>
      <div className="grid grid-cols-2 gap-2">
        <QuizOption label="Sim" selected={value === "yes"} onClick={() => onChange("yes")} />
        <QuizOption label="Não" selected={value === "no"} onClick={() => onChange("no")} />
      </div>
    </div>
  );
}
