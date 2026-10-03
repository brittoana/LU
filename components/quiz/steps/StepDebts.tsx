"use client";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import YesNo from "@/components/quiz/YesNo";
import { DAYS } from "@/components/quiz/steps/StepExpenses";
import { newInstallmentRow, type InstallmentRow, type OnboardingDraft } from "@/lib/onboarding";

export default function StepDebts({ draft, update }: { draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void }) {
  const setRow = (id: string, patch: Partial<InstallmentRow>) => update({ installments: draft.installments.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const removeRow = (id: string) => {
    const next = draft.installments.filter((r) => r.id !== id);
    update({ installments: next.length ? next : [newInstallmentRow()] });
  };

  return (
    <div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4E0A5] text-[#D97706]"><CreditCard /></div>
      <h1 className="text-2xl font-bold">3. Você tem compras parceladas no cartão?</h1>
      <div className="mt-6 space-y-5">
        <YesNo question="Possui parcelamentos em andamento?" value={draft.hasInstallments} onChange={(v) => update({ hasInstallments: v })} />

        {draft.hasInstallments === "yes" && (
          <div className="space-y-3">
            {draft.installments.map((row, index) => (
              <div key={row.id} className="space-y-4 rounded-2xl border border-[#E7DDD2] bg-white/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#556B2F]">{index === 0 ? "Adicionar parcelamento" : `Parcelamento ${index + 1}`}</p>
                  {draft.installments.length > 1 && <button type="button" onClick={() => removeRow(row.id)} aria-label={`Remover parcelamento ${index + 1}`} className="rounded-xl p-1.5 text-[#DC2626] hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>}
                </div>
                <Input label="O que você comprou?" value={row.description} onChange={(e) => setRow(row.id, { description: e.target.value })} placeholder="Ex.: celular, viagem, móveis" />
                <Input label="Valor da parcela" prefix="R$" type="number" min="0" step="0.01" value={row.amount} onChange={(e) => setRow(row.id, { amount: e.target.value })} placeholder="0,00" />
                <Input label="Quantas parcelas faltam?" type="number" min="1" step="1" value={row.remaining} onChange={(e) => setRow(row.id, { remaining: e.target.value })} placeholder="Ex.: 6" />
                <Input label="Qual cartão?" value={row.card} onChange={(e) => setRow(row.id, { card: e.target.value })} placeholder="Ex.: Nubank, Itaú" />
                <Select label="Dia do vencimento da fatura" value={row.dueDay} onChange={(e) => setRow(row.id, { dueDay: e.target.value })}>
                  <option value="">Selecione o dia</option>
                  {DAYS.map((d) => <option key={d} value={d}>Dia {d}</option>)}
                </Select>
              </div>
            ))}
            <button type="button" onClick={() => update({ installments: [...draft.installments, newInstallmentRow()] })} className="flex items-center gap-1.5 rounded-full bg-[#E6EED3] px-4 py-2 text-sm font-semibold text-[#556B2F]"><Plus size={16} /> Adicionar outro parcelamento</button>
          </div>
        )}
      </div>
    </div>
  );
}
