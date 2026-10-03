"use client";
import { useMemo, useState } from "react";
import { CalendarClock, CirclePlus, Lock, Pencil, Trash2, TrendingUp, Unlock } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/feedback/ToastProvider";
import { formatCurrency } from "@/lib/format";
import { INVESTMENT_KINDS, daysUntil, isAvailable, summarizeInvestments } from "@/lib/investments";
import type { Investment } from "@/lib/types";

const SLICE_COLORS = ["#556B2F", "#6B8E23", "#A5B97B", "#F4E0A5", "#D97706", "#9A3412", "#7B6A5D"];

function dateLabel(iso: string) { return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR"); }

function availability(inv: Investment) {
  if (isAvailable(inv)) return { text: "Disponível para saque", tone: "text-[#556B2F] font-semibold" };
  const days = daysUntil(inv.availableAt);
  return { text: `Libera em ${dateLabel(inv.availableAt)} (${days} ${days === 1 ? "dia" : "dias"})`, tone: "text-[#7B6A5D]" };
}

export default function InvestmentsSection() {
  const { state, addInvestment, updateInvestment, deleteInvestment } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<string>(INVESTMENT_KINDS[0]);
  const [amount, setAmount] = useState("");
  const [availableAt, setAvailableAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Investment | null>(null);

  const summary = useMemo(() => summarizeInvestments(state.investments), [state.investments]);
  const sorted = useMemo(() => [...state.investments].sort((a, b) => a.availableAt.localeCompare(b.availableAt)), [state.investments]);
  const availableList = sorted.filter((i) => isAvailable(i));
  const lockedList = sorted.filter((i) => !isAvailable(i));

  function reset() { setEditingId(null); setName(""); setKind(INVESTMENT_KINDS[0]); setAmount(""); setAvailableAt(""); setNotes(""); setError(""); setOpen(false); }

  function startEdit(inv: Investment) {
    setEditingId(inv.id); setName(inv.name); setKind(inv.kind ?? "Outro"); setAmount(String(inv.amount)); setAvailableAt(inv.availableAt); setNotes(inv.notes ?? ""); setError(""); setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!name.trim()) return setError("Dê um nome para o investimento.");
    if (!Number.isFinite(parsed) || parsed <= 0) return setError("Informe um valor maior que zero.");
    if (!availableAt) return setError("Informe a data em que poderá sacar.");
    const existing = editingId ? state.investments.find((i) => i.id === editingId) : null;
    const payload = { name: name.trim(), kind, amount: parsed, investedAt: existing?.investedAt ?? new Date().toISOString().slice(0, 10), availableAt, notes: notes.trim() || undefined };
    if (existing) { updateInvestment(existing.id, payload); toast("Atualizado!"); } else { addInvestment(payload); toast("Anotado!"); }
    reset();
  }

  function Row({ inv }: { inv: Investment }) {
    const a = availability(inv);
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-black/[0.03] px-3 py-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#2C1E18]">{inv.name}</p>
          <p className="mt-0.5 truncate text-xs text-[#7B6A5D]">{inv.kind ?? "Outro"}{inv.notes ? ` · ${inv.notes}` : ""}</p>
          <p className={`mt-0.5 text-xs ${a.tone}`}>{a.text}</p>
        </div>
        <b className="shrink-0 text-sm text-[#2C1E18]">{formatCurrency(inv.amount)}</b>
        <div className="flex shrink-0">
          <button type="button" onClick={() => startEdit(inv)} aria-label={`Editar ${inv.name}`} className="rounded-xl p-2 text-[#556B2F] hover:bg-[#E6EED3]"><Pencil size={16} /></button>
          <button type="button" onClick={() => setToDelete(inv)} aria-label={`Remover ${inv.name}`} className="rounded-xl p-2 text-[#DC2626] hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="rounded-2xl bg-[#F4E0A5] p-3 text-[#D97706]"><TrendingUp /></div>
          <div><h2 className="font-bold">Investimentos</h2><p className="text-sm text-[#7B6A5D]">Total investido: <b className="text-[#6B8E23]">{formatCurrency(summary.total)}</b></p></div>
        </div>
        <button type="button" onClick={() => (open ? reset() : setOpen(true))} className="flex shrink-0 items-center gap-1 rounded-full bg-[#E6EED3] px-3 py-2 text-xs font-semibold text-[#556B2F]"><CirclePlus size={15} /> {open && !editingId ? "Fechar" : "Novo"}</button>
      </div>

      {state.investments.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-[#E6EED3]/70 p-3"><p className="flex items-center gap-1 text-[11px] text-[#556B2F]"><Unlock size={12} /> Disponível agora</p><p className="mt-1 font-bold text-[#2C1E18]">{formatCurrency(summary.availableNow)}</p></div>
            <div className="rounded-2xl bg-[#F4E0A5]/60 p-3"><p className="flex items-center gap-1 text-[11px] text-[#92400E]"><Lock size={12} /> Em carência</p><p className="mt-1 font-bold text-[#2C1E18]">{formatCurrency(summary.locked)}</p></div>
          </div>
          {summary.nextRelease && (
            <p className="mt-3 flex items-center gap-2 rounded-2xl border border-[#E7DDD2] px-3 py-2 text-xs text-[#3E2723]"><CalendarClock size={15} className="shrink-0 text-[#556B2F]" /><span>Próxima liberação: <b>{summary.nextRelease.name}</b> em {dateLabel(summary.nextRelease.availableAt)} ({formatCurrency(summary.nextRelease.amount)})</span></p>
          )}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7B6A5D]">Distribuição por tipo</p>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-[#EFEBE4]" role="img" aria-label={summary.byKind.map((k) => `${k.kind} ${k.percent}%`).join(", ")}>
              {summary.byKind.map((k, i) => <div key={k.kind} style={{ width: `${k.percent}%`, background: SLICE_COLORS[i % SLICE_COLORS.length] }} />)}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {summary.byKind.map((k, i) => <span key={k.kind} className="flex items-center gap-1.5 text-xs text-[#3E2723]"><i className="h-2 w-2 rounded-full" style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }} />{k.kind} · {k.percent}%</span>)}
            </div>
          </div>
        </>
      )}

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-[#E7DDD2] bg-white/30 p-4">
          <p className="text-sm font-semibold text-[#556B2F]">{editingId ? "Editar investimento" : "Novo investimento"}</p>
          <Input label="Nome do investimento" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Tesouro Selic 2029, CDB do banco..." />
          <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value)}>{INVESTMENT_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</Select>
          <Input label="Valor investido" prefix="R$" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          <DatePicker label="Quando você pode retirar?" value={availableAt} onChange={setAvailableAt} />
          <Input label="Observação (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: liquidez diária, aporte mensal" />
          {error && <p className="rounded-xl bg-[#FEE2E2] px-3 py-2 text-xs font-medium text-[#DC2626]" role="alert">{error}</p>}
          <div className="flex gap-2"><Button type="submit" className="flex-1">{editingId ? "Salvar alterações" : "Salvar investimento"}</Button><button type="button" onClick={reset} className="rounded-2xl px-4 text-sm font-semibold text-[#7B6A5D]">Cancelar</button></div>
        </form>
      )}

      <div className="mt-4 space-y-4">
        {state.investments.length === 0 ? (
          <p className="text-sm text-[#7B6A5D]">Nenhum investimento registrado ainda. Use &quot;Novo&quot; para adicionar o primeiro e acompanhar quando cada valor fica disponível.</p>
        ) : (
          <>
            {availableList.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-[#556B2F]">Disponíveis ({availableList.length})</p>{availableList.map((i) => <Row key={i.id} inv={i} />)}</div>}
            {lockedList.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-[#92400E]">Em carência ({lockedList.length})</p>{lockedList.map((i) => <Row key={i.id} inv={i} />)}</div>}
          </>
        )}
      </div>

      <ConfirmDialog open={!!toDelete} title="Remover investimento?" description={toDelete ? `${toDelete.name} (${formatCurrency(toDelete.amount)}) será removido da sua lista.` : ""} confirmLabel="Remover" destructive onCancel={() => setToDelete(null)} onConfirm={() => { if (toDelete) { deleteInvestment(toDelete.id); toast("Apagado!"); } setToDelete(null); }} />
    </Card>
  );
}
