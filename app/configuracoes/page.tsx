"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, Trash2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/feedback/ToastProvider";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { state, mode, clearAll, signOut, setAvatar, removeAvatar, updateProfileName } = useApp();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    setUploading(true);
    const error = await setAvatar(file);
    setUploading(false);
    if (error) setPhotoError(error); else toast("Foto atualizada!");
  }

  async function onRemovePhoto() {
    setPhotoError("");
    const error = await removeAvatar();
    if (error) setPhotoError(error); else toast("Foto removida!");
  }

  async function saveName() {
    const error = await updateProfileName(nameDraft);
    if (error) { setNameError(error); return; }
    setNameError("");
    setEditingName(false);
    toast("Nome atualizado!");
  }
  const [expanded, setExpanded] = useState<string | null>(null);

  const accounts = useMemo(() => Array.from(new Set(state.transactions.map((t) => t.account.trim()).filter(Boolean))), [state.transactions]);

  const items: { title: string; content: React.ReactNode }[] = [
    {
      title: "Minhas contas",
      content: accounts.length === 0
        ? <p className="text-sm text-[#7B6A5D]">Nenhuma conta cadastrada ainda. As contas informadas em suas movimentações aparecerão aqui.</p>
        : <ul className="space-y-2">{accounts.map((a) => <li key={a} className="rounded-xl bg-black/[0.03] px-3 py-2 text-sm text-[#2C1E18]">{a}</li>)}</ul>,
    },
    {
      title: "Categorias",
      content: (
        <div className="space-y-3 text-sm">
          <div><p className="mb-1.5 font-semibold text-[#2C1E18]">Despesas</p><div className="flex flex-wrap gap-1.5">{EXPENSE_CATEGORIES.map((c) => <span key={c} className="rounded-full bg-[#F4E0A5] px-3 py-1 text-xs text-[#D97706]">{c}</span>)}</div></div>
          <div><p className="mb-1.5 font-semibold text-[#2C1E18]">Receitas</p><div className="flex flex-wrap gap-1.5">{INCOME_CATEGORIES.map((c) => <span key={c} className="rounded-full bg-[#E6EED3] px-3 py-1 text-xs text-[#556B2F]">{c}</span>)}</div></div>
        </div>
      ),
    },
    {
      title: "Teto da semana",
      content: state.quizResult
        ? <p className="text-sm text-[#3E2723]">Seu teto da semana atual é <span className="font-semibold text-[#6B8E23]">{formatCurrency(state.quizResult.weeklyBudget)}</span>. Ele é recalculado automaticamente a cada novo mês, com base no seu diagnóstico financeiro.</p>
        : <p className="text-sm text-[#7B6A5D]">Complete o diagnóstico financeiro para definir seu teto da semana.</p>,
    },
    {
      title: "Investimentos",
      content: state.quizResult?.investmentUnlocked
        ? <p className="text-sm text-[#3E2723]">Sua reserva de emergência atingiu 100% da meta, então a área de investimentos está liberada. Total investido: <span className="font-semibold text-[#6B8E23]">{formatCurrency(state.investments.reduce((s, i) => s + i.amount, 0))}</span> em {state.investments.length} {state.investments.length === 1 ? "aplicação" : "aplicações"}. Gerencie tudo em Meu plano financeiro.</p>
        : <p className="text-sm text-[#7B6A5D]">Assim que sua reserva de emergência atingir 100% da meta calculada no diagnóstico, a área de investimentos é liberada automaticamente em "Meu plano financeiro".</p>,
    },
    {
      title: "Notificações",
      content: <p className="text-sm text-[#7B6A5D]">Alertas de vencimento, teto estourado e resumo semanal chegarão aqui assim que a central de notificações for conectada ao backend.</p>,
    },
    {
      title: "Segurança e privacidade",
      content: mode === "remote"
        ? <p className="text-sm text-[#7B6A5D]">Seus dados ficam salvos na sua conta, protegidos por login. Só você consegue ver e alterar suas informações, e elas acompanham você em qualquer aparelho.</p>
        : <p className="text-sm text-[#7B6A5D]">Modo local: seus dados ficam salvos apenas neste navegador, porque o Supabase ainda não está configurado.</p>,
    },
    {
      title: "Ajuda e suporte",
      content: <p className="text-sm text-[#7B6A5D]">Precisa de ajuda? Em breve você poderá abrir um chamado direto por aqui. Por enquanto, use o botão de feedback do app.</p>,
    },
  ];

  return (
    <RouteGuard>
      <AppShell>
        <PageHeader title="Configurações" subtitle="Gerencie sua conta e preferências" />
        <Card className="mb-4 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Avatar src={state.user?.avatarUrl} name={state.user?.name} size={72} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Alterar foto de perfil" className="absolute -bottom-1 -right-1 rounded-full bg-[#6B8E23] p-2 text-white shadow-md disabled:opacity-60"><Camera size={14} /></button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="space-y-2">
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="field w-full rounded-xl px-3 py-2 text-sm outline-none" aria-label="Seu nome" autoFocus />
                  <div className="flex gap-2">
                    <button type="button" onClick={saveName} className="rounded-xl bg-[#6B8E23] px-3 py-1.5 text-xs font-semibold text-white">Salvar</button>
                    <button type="button" onClick={() => { setEditingName(false); setNameError(""); }} className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#7B6A5D]">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="truncate font-semibold text-[#2C1E18]">{state.user?.name || "Usuário"}</p>
                  <p className="mt-0.5 truncate text-sm text-[#7B6A5D]">{state.user?.email || "Nenhum e-mail salvo"}</p>
                  <button type="button" onClick={() => { setNameDraft(state.user?.name ?? ""); setEditingName(true); }} className="mt-1 text-xs font-semibold text-[#556B2F]">Editar nome</button>
                </>
              )}
            </div>
          </div>
          {(uploading || photoError || nameError || state.user?.avatarUrl) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              {uploading && <span className="text-[#7B6A5D]">Enviando foto...</span>}
              {photoError && <span role="alert" className="text-[#DC2626]">{photoError}</span>}
              {nameError && <span role="alert" className="text-[#DC2626]">{nameError}</span>}
              {state.user?.avatarUrl && !uploading && <button type="button" onClick={onRemovePhoto} className="flex items-center gap-1 font-semibold text-[#DC2626]"><Trash2 size={13} /> Remover foto</button>}
            </div>
          )}
        </Card>
        <div className="space-y-3">
          {items.map((item) => {
            const open = expanded === item.title;
            return (
              <Card key={item.title} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : item.title)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-[#2C1E18]">{item.title}</span>
                  <ChevronDown size={18} className={`shrink-0 text-[#7B6A5D] transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && <div className="border-t border-black/5 px-4 py-4">{item.content}</div>}
              </Card>
            );
          })}
          <button onClick={async () => { await signOut(); router.replace("/login"); }} className="w-full rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4 text-left text-sm font-semibold text-[#3E2723] shadow-sm">Sair da conta</button>
          <button onClick={() => setConfirmClear(true)} className="w-full rounded-2xl border border-[#FDE68A] bg-white px-4 py-4 text-left text-sm font-semibold text-[#D97706] shadow-sm">{mode === "remote" ? "Apagar meus dados e sair" : "Sair e limpar dados locais"}</button>
        </div>
        <ConfirmDialog open={confirmClear} title={mode === "remote" ? "Apagar todos os seus dados?" : "Apagar todos os dados locais?"} description={mode === "remote" ? "Isso removerá seu diagnóstico, movimentações e investimentos da sua conta e encerrará a sessão. A ação não pode ser desfeita." : "Isso removerá usuário, diagnóstico e movimentações salvas neste navegador. A ação não pode ser desfeita."} confirmLabel="Apagar tudo" destructive onCancel={() => setConfirmClear(false)} onConfirm={async () => { await clearAll(); toast("Apagado!"); setConfirmClear(false); router.replace("/login"); }} />
      </AppShell>
    </RouteGuard>
  );
}
