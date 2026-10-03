"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import RouteGuard from "@/components/auth/RouteGuard";
import StepIncome from "@/components/quiz/steps/StepIncome";
import StepExpenses from "@/components/quiz/steps/StepExpenses";
import StepDebts from "@/components/quiz/steps/StepDebts";
import StepResult from "@/components/quiz/steps/StepResult";
import { evaluateFinancialProfile } from "@/lib/finance";
import { suggestAreaBudget } from "@/lib/budget";
import { createEmptyDraft, draftToDetails, isExpensesStepValid, isIncomeStepValid, isInstallmentsStepValid, onboardingToQuizInput, summarizeOnboarding, type OnboardingDraft } from "@/lib/onboarding";
import { useApp } from "@/components/providers/AppProvider";

const totalSteps = 4;

export default function QuizPage() {
  const router = useRouter();
  const { setQuizResult } = useApp();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>(createEmptyDraft);
  const update = (patch: Partial<OnboardingDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const complete = isIncomeStepValid(draft) && isExpensesStepValid(draft) && isInstallmentsStepValid(draft);
  const details = useMemo(() => draftToDetails(draft), [draft]);
  const summary = useMemo(() => summarizeOnboarding(details), [details]);
  const result = useMemo(() => (complete ? evaluateFinancialProfile(onboardingToQuizInput(details)) : null), [complete, details]);

  const suggestion = useMemo(() => result ? suggestAreaBudget({ leftover: result.freeCashFlow, stage: result.stage, fixedCategories: details.fixedExpenses.map((e) => e.category) }) : null, [result, details]);

  const canContinue = step === 1 ? isIncomeStepValid(draft) : step === 2 ? isExpensesStepValid(draft) : step === 3 ? isInstallmentsStepValid(draft) : !!result;

  function finish() { if (result) { setQuizResult(result); router.replace("/planejamento"); } }

  return (
    <RouteGuard requireQuiz={false}>
      <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => step > 1 && setStep(step - 1)} className="rounded-full p-2 text-[#3E2723] disabled:opacity-30" disabled={step === 1} aria-label="Voltar para a etapa anterior"><ArrowLeft size={20} /></button>
            <div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7B6A5D]">Visão financeira</p><p className="mt-1 text-sm text-[#6B8E23]">Etapa {step} de {totalSteps}</p></div><div className="w-9" />
          </div>
          <p className="mb-4 rounded-2xl border border-[#E7DDD2] bg-[#F4E0A5]/60 px-4 py-2.5 text-center text-xs font-medium text-[#92400E]">Todos os valores informados nas respostas são em reais (R$).</p>
          <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#E7DDD2]" aria-hidden="true"><div className="h-full rounded-full bg-[#556B2F] transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} /></div>
          <section className="glass rounded-3xl p-5 sm:p-7">
            {step === 1 && <StepIncome draft={draft} update={update} />}
            {step === 2 && <StepExpenses draft={draft} update={update} />}
            {step === 3 && <StepDebts draft={draft} update={update} />}
            {step === 4 && result && suggestion && <StepResult summary={summary} suggestion={suggestion} />}
            <div className="mt-8 flex gap-3">{step < totalSteps ? <Button disabled={!canContinue} className="ml-auto flex items-center gap-2" onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={18} /></Button> : <Button disabled={!result} className="w-full" onClick={finish}>Ver minha visão financeira</Button>}</div>
          </section>
        </div>
      </main>
    </RouteGuard>
  );
}
