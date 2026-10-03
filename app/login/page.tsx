"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Mail, MailCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingScreen from "@/components/feedback/LoadingScreen";
import LumaLogo from "@/components/ui/LumaLogo";
import { useApp } from "@/components/providers/AppProvider";

export default function LoginPage() {
  const router = useRouter();
  const { state, hydrated, syncError, signIn, signUp } = useApp();
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  // Assim que a sessão existe (e os dados foram carregados), segue para o app.
  useEffect(() => {
    if (hydrated && state.user) router.replace(state.quizResult ? "/dashboard" : "/quiz");
  }, [hydrated, state.user, state.quizResult, router]);

  if (!hydrated || state.user) return <LoadingScreen />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError("Informe um e-mail válido.");
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    if (authMode === "signup" && cleanName.length < 2) return setError("Informe seu nome.");

    setError("");
    setBusy(true);
    const result = authMode === "signup" ? await signUp(cleanName, cleanEmail, password) : await signIn(cleanEmail, password);
    if (result.error) { setError(result.error); setBusy(false); return; }
    if (result.needsConfirmation) { setConfirmEmail(true); setBusy(false); return; }
    // Sucesso: o efeito acima redireciona quando o usuário for carregado.
  }

  if (confirmEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-8">
        <div className="glass w-full max-w-md rounded-3xl p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6EED3] text-[#556B2F]"><MailCheck /></div>
          <h1 className="text-xl font-bold">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-[#7B6A5D]">Enviamos um link para <b className="text-[#3E2723]">{email.trim().toLowerCase()}</b>. Clique nele e depois volte aqui para entrar.</p>
          <Button className="mt-6 w-full" onClick={() => { setConfirmEmail(false); setAuthMode("login"); setPassword(""); }}>Já confirmei, entrar</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22%] shadow-[0_10px_25px_rgba(44,30,24,0.15)]"><LumaLogo size={64} /></div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C1E18]">Luma</h1>
          <p className="mt-2 text-sm font-medium text-[#3E2723]">Simples como deve ser.</p>
          <p className="mt-1 text-sm text-[#7B6A5D]">Controle financeiro sem complicação.</p>
        </div>
        <form onSubmit={submit} className="glass rounded-3xl p-5 sm:p-6" noValidate>
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[#EFEBE4] p-1 text-sm">
            <button type="button" onClick={() => { setAuthMode("signup"); setError(""); }} className={`rounded-xl px-3 py-2 ${authMode === "signup" ? "bg-white font-semibold shadow-sm" : "text-[#7B6A5D]"}`}>Criar conta</button>
            <button type="button" onClick={() => { setAuthMode("login"); setError(""); }} className={`rounded-xl px-3 py-2 ${authMode === "login" ? "bg-white font-semibold shadow-sm" : "text-[#7B6A5D]"}`}>Entrar</button>
          </div>
          <div className="space-y-4">
            {authMode === "signup" && <label className="block space-y-2"><span className="text-sm font-medium">Nome</span><div className="field flex items-center rounded-2xl px-4 transition focus-within:border-[#A5B97B]"><UserRound size={18} className="text-[#7B6A5D]" /><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="Seu nome" autoComplete="name" /></div></label>}
            <label className="block space-y-2"><span className="text-sm font-medium">E-mail</span><div className="field flex items-center rounded-2xl px-4 transition focus-within:border-[#A5B97B]"><Mail size={18} className="text-[#7B6A5D]" /><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="seu@email.com" type="email" autoComplete="email" /></div></label>
            <label className="block space-y-2"><span className="text-sm font-medium">Senha</span><div className="field flex items-center rounded-2xl px-4 transition focus-within:border-[#A5B97B]"><LockKeyhole size={18} className="text-[#7B6A5D]" /><input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="Mínimo 6 caracteres" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} /></div></label>
          </div>
          {(error || syncError) && <p className="mt-4 rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#DC2626]" role="alert">{error || syncError}</p>}
          <Button type="submit" disabled={busy} className="mt-6 w-full">{busy ? "Aguarde..." : authMode === "signup" ? "Criar conta e continuar" : "Entrar"}</Button>
        </form>
      </div>
    </main>
  );
}
