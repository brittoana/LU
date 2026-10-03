"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, Investment, QuizResult, Transaction, UserProfile } from "@/lib/types";
import { normalizeCategory } from "@/lib/categories";
import { evaluateFinancialProfile, refreshWeeklyBudget } from "@/lib/finance";
import { supabase } from "@/lib/supabase";
import { investmentFromRow, investmentToRow, transactionFromRow, transactionToRow, type InvestmentRow, type TransactionRow } from "@/lib/supabase-data";
import { blobToDataUrl, resizeImageToJpeg } from "@/lib/image";

const STORAGE_KEY = "luma_app_state_v2";
const EMPTY_STATE: AppState = { user: null, quizResult: null, transactions: [], investments: [] };

type AuthResult = { error?: string; needsConfirmation?: boolean };

type AppContextValue = {
  state: AppState;
  hydrated: boolean;
  /** O Luma usa o Supabase oficial para persistência multiusuário. */
  mode: "remote";
  syncError: string | null;
  dismissSyncError: () => void;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfileName: (name: string) => Promise<string | null>;
  setAvatar: (file: File) => Promise<string | null>;
  removeAvatar: () => Promise<string | null>;
  setQuizResult: (result: QuizResult) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addInvestment: (investment: Omit<Investment, "id">) => void;
  updateInvestment: (id: string, investment: Omit<Investment, "id">) => void;
  deleteInvestment: (id: string) => void;
  /** Apaga os dados financeiros e encerra a sessão. */
  clearAll: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function migrateState(parsed: AppState): AppState {
  let next = parsed;
  if (!next.investments) next = { ...next, investments: [] };
  if (next.quizResult && typeof next.quizResult.weeklyBudget !== "number") {
    const old = next.quizResult;
    const upgraded = evaluateFinancialProfile({
      monthlyIncome: old.monthlyIncome,
      incomeStability: old.incomeStability,
      dependents: old.dependents,
      essentialExpenses: old.essentialExpenses,
      variableExpenses: old.variableExpenses,
      debtBalance: old.debtBalance,
      monthlyDebtPayments: old.monthlyDebtPayments,
      currentReserve: old.currentReserve,
      profileScore: old.profileScore,
    });
    next = { ...next, quizResult: upgraded };
  }
  return next;
}

function sanitizeTransaction(transaction: Omit<Transaction, "id">): Omit<Transaction, "id"> {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    category: normalizeCategory(transaction.category),
    description: transaction.description.trim(),
    account: transaction.account.trim(),
  };
}

function sanitizeInvestment(investment: Omit<Investment, "id">): Omit<Investment, "id"> {
  return {
    ...investment,
    amount: Number(investment.amount),
    name: investment.name.trim(),
    kind: investment.kind?.trim() || undefined,
    notes: investment.notes?.trim() || undefined,
  };
}

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/** Traduz as mensagens mais comuns do Supabase Auth. */
function authMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Este e-mail já está cadastrado. Use a aba Entrar.";
  if (m.includes("password") && m.includes("characters")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  if (m.includes("fetch") || m.includes("network")) return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível concluir. Tente novamente.";
}

/** Traduz erros do banco para algo que dá para agir em cima. */
function dbMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("schema cache") || m.includes("does not exist") || m.includes("relation")) {
    return `As tabelas do Luma não existem neste projeto Supabase. Rode o arquivo supabase/schema.sql no SQL Editor. (${message})`;
  }
  if (m.includes("row-level security") || m.includes("permission denied")) {
    return `O banco recusou a gravação (permissão/RLS). Rode o supabase/schema.sql de novo. (${message})`;
  }
  if (m.includes("jwt") || m.includes("not authenticated")) {
    return "Sua sessão expirou. Saia e entre de novo.";
  }
  return message;
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const mode: "remote" = "remote";

  /** Busca tudo do usuário logado no Supabase (o RLS garante que só vêm os dados dele). */
  const loadRemote = useCallback(async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<AppState> => {
    const sb = supabase;
    if (!sb) return EMPTY_STATE;
    const [profileRes, financialRes, txRes, invRes] = await Promise.all([
      sb.from("profiles").select("name, avatar_url").eq("id", authUser.id).maybeSingle(),
      sb.from("financial_profiles").select("data").eq("user_id", authUser.id).maybeSingle(),
      sb.from("transactions").select("*").eq("user_id", authUser.id).order("date", { ascending: false }).order("created_at", { ascending: false }),
      sb.from("investments").select("*").eq("user_id", authUser.id).order("available_at", { ascending: true }),
    ]);
    const failed = profileRes.error || financialRes.error || txRes.error || invRes.error;
    if (failed) throw new Error(dbMessage(failed.message));

    const metaName = typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name : "";
    let name = profileRes.data?.name || metaName || (authUser.email ?? "").split("@")[0] || "Usuário";
    if (!profileRes.data) {
      // Quem criou a conta antes de rodar o schema.sql não tem perfil: cria agora.
      await sb.from("profiles").upsert({ id: authUser.id, name });
    }
    return migrateState({
      user: { id: authUser.id, name, email: authUser.email ?? "", avatarUrl: profileRes.data?.avatar_url ?? undefined },
      quizResult: (financialRes.data?.data as QuizResult | undefined) ?? null,
      transactions: (txRes.data as TransactionRow[]).map(transactionFromRow),
      investments: (invRes.data as InvestmentRow[]).map(investmentFromRow),
    });
  }, []);

  // ───────── Carga inicial ─────────
  useEffect(() => {
    const sb = supabase;

    let active = true;
    const apply = async (session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!session) {
        userIdRef.current = null;
        setState(EMPTY_STATE);
        setHydrated(true);
        return;
      }
      // O Supabase reemite SIGNED_IN ao voltar para a aba; não recarregamos se já temos esse usuário.
      if (userIdRef.current === session.user.id) { setHydrated(true); return; }
      try {
        const next = await loadRemote(session.user);
        if (!active) return;
        userIdRef.current = session.user.id;
        setState(next);
      } catch (e) {
        if (!active) return;
        setSyncError(`Não foi possível carregar seus dados: ${errorText(e, "erro de conexão")}`);
      } finally {
        if (active) setHydrated(true);
      }
    };

    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      // Chamadas ao Supabase dentro do callback podem travar; adiamos para o próximo tick.
      setTimeout(() => { void apply(session); }, 0);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [loadRemote]);

  // ───────── Sincronização ─────────
  const reloadRemote = useCallback(async () => {
    const sb = supabase;
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    if (!data.user) return;
    try { setState(await loadRemote(data.user)); } catch { /* o aviso de erro já foi mostrado */ }
  }, [loadRemote]);

  /** Roda uma escrita no Supabase; se falhar, avisa e recarrega o estado verdadeiro do servidor. */
  const sync = useCallback(async (write: (userId: string) => PromiseLike<{ error: { message: string } | null }>) => {
    const userId = userIdRef.current;
    if (!supabase) return;
    if (!userId) {
      // Antes, a gravação era descartada em silêncio quando a sessão não tinha carregado.
      setSyncError("Sua sessão não foi carregada, então esta alteração NÃO foi salva. Saia e entre de novo.");
      return;
    }
    try {
      const { error } = await write(userId);
      if (error) throw new Error(dbMessage(error.message));
    } catch (e) {
      setSyncError(`Não foi possível salvar: ${errorText(e, "erro de conexão")}. Mostrando os dados salvos.`);
      await reloadRemote();
    }
  }, [reloadRemote]);

  const persistQuiz = useCallback((result: QuizResult) => {
    void sync((userId) => supabase!.from("financial_profiles").upsert({ user_id: userId, data: result, updated_at: new Date().toISOString() }));
  }, [sync]);

  // O teto semanal é recalculado quando vira o mês.
  useEffect(() => {
    if (!hydrated || !state.quizResult) return;
    const refreshed = refreshWeeklyBudget(state.quizResult);
    if (refreshed === state.quizResult) return;
    setState((current) => (current.quizResult === state.quizResult ? { ...current, quizResult: refreshed } : current));
    persistQuiz(refreshed);
  }, [hydrated, state.quizResult, persistQuiz]);

  const value = useMemo<AppContextValue>(() => ({
    state,
    hydrated,
    mode,
    syncError,
    dismissSyncError: () => setSyncError(null),

    signUp: async (name, email, password) => {
      const sb = supabase;
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
      if (error) return { error: authMessage(error.message) };
      // Com "Confirm email" ligado no Supabase, não há sessão até o clique no e-mail.
      if (!data.session) return { needsConfirmation: true };
      return {};
    },

    signIn: async (email, password) => {
      const sb = supabase;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      return error ? { error: authMessage(error.message) } : {};
    },

    signOut: async () => {
      await supabase.auth.signOut();
    },

    updateProfileName: async (name) => {
      const clean = name.trim();
      if (clean.length < 2) return "Informe um nome com pelo menos 2 letras.";
      const sb = supabase;
      if (sb && userIdRef.current) {
        const { error } = await sb.from("profiles").update({ name: clean }).eq("id", userIdRef.current);
        if (error) return "Não foi possível salvar seu nome. Tente novamente.";
      }
      setState((current) => (current.user ? { ...current, user: { ...current.user, name: clean } } : current));
      return null;
    },

    setAvatar: async (file) => {
      try {
        const blob = await resizeImageToJpeg(file);
        const sb = supabase;
        let url: string;
        if (sb && userIdRef.current) {
          const path = `${userIdRef.current}/avatar.jpg`;
          const up = await sb.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
          if (up.error) throw new Error(up.error.message);
          url = `${sb.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
          const upd = await sb.from("profiles").update({ avatar_url: url }).eq("id", userIdRef.current);
          if (upd.error) throw new Error(upd.error.message);
        } else {
          url = await blobToDataUrl(blob);
        }
        setState((current) => (current.user ? { ...current, user: { ...current.user, avatarUrl: url } } : current));
        return null;
      } catch (e) {
        return errorText(e, "Não foi possível enviar a foto.");
      }
    },

    removeAvatar: async () => {
      try {
        const sb = supabase;
        if (sb && userIdRef.current) {
          await sb.storage.from("avatars").remove([`${userIdRef.current}/avatar.jpg`]);
          const upd = await sb.from("profiles").update({ avatar_url: null }).eq("id", userIdRef.current);
          if (upd.error) throw new Error(upd.error.message);
        }
        setState((current) => (current.user ? { ...current, user: { ...current.user, avatarUrl: undefined } } : current));
        return null;
      } catch (e) {
        return errorText(e, "Não foi possível remover a foto.");
      }
    },

    setQuizResult: (quizResult) => {
      setState((current) => ({ ...current, quizResult }));
      persistQuiz(quizResult);
    },

    addTransaction: (transaction) => {
      const clean = sanitizeTransaction(transaction);
      const id = crypto.randomUUID();
      setState((current) => ({ ...current, transactions: [{ ...clean, id }, ...current.transactions] }));
      void sync((userId) => supabase!.from("transactions").insert(transactionToRow(clean, id, userId)));
    },
    updateTransaction: (id, transaction) => {
      const clean = sanitizeTransaction(transaction);
      setState((current) => ({ ...current, transactions: current.transactions.map((item) => (item.id === id ? { ...clean, id } : item)) }));
      void sync((userId) => supabase!.from("transactions").update(transactionToRow(clean, id, userId)).eq("id", id));
    },
    deleteTransaction: (id) => {
      setState((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== id) }));
      void sync(() => supabase!.from("transactions").delete().eq("id", id));
    },

    addInvestment: (investment) => {
      const clean = sanitizeInvestment(investment);
      const id = crypto.randomUUID();
      setState((current) => ({ ...current, investments: [{ ...clean, id }, ...current.investments] }));
      void sync((userId) => supabase!.from("investments").insert(investmentToRow(clean, id, userId)));
    },
    updateInvestment: (id, investment) => {
      const clean = sanitizeInvestment(investment);
      setState((current) => ({ ...current, investments: current.investments.map((item) => (item.id === id ? { ...clean, id } : item)) }));
      void sync((userId) => supabase!.from("investments").update(investmentToRow(clean, id, userId)).eq("id", id));
    },
    deleteInvestment: (id) => {
      setState((current) => ({ ...current, investments: current.investments.filter((item) => item.id !== id) }));
      void sync(() => supabase!.from("investments").delete().eq("id", id));
    },

    clearAll: async () => {
      const sb = supabase;
      if (sb && userIdRef.current) {
        const userId = userIdRef.current;
        await Promise.all([
          sb.from("transactions").delete().eq("user_id", userId),
          sb.from("investments").delete().eq("user_id", userId),
          sb.from("financial_profiles").delete().eq("user_id", userId),
        ]);
        await sb.auth.signOut();
      }
    },
  }), [state, hydrated, mode, syncError, sync, persistQuiz]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider");
  return context;
}
