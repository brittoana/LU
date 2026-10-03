"use client";

import { useState } from "react";
import { supabase, supabaseHost } from "@/lib/supabase";

type Line = { label: string; ok: boolean; detail: string };

const TABLES = ["profiles", "financial_profiles", "transactions", "investments"] as const;

export default function DiagnosticoPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const out: Line[] = [];
    out.push({ label: "Projeto Supabase usado pelo app", ok: true, detail: supabaseHost });

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;
    out.push({
      label: "Você está logada",
      ok: !!session,
      detail: sessionError ? sessionError.message : session ? (session.user.email ?? "sim") : "Não. Entre no app primeiro (/login) e volte aqui.",
    });

    for (const table of TABLES) {
      const { error, count } = await supabase.from(table).select("*", { count: "exact", head: true });
      out.push({
        label: `Ler tabela ${table}`,
        ok: !error,
        detail: error ? error.message : `ok (${count ?? 0} linhas suas)`,
      });
    }

    if (session) {
      const id = crypto.randomUUID();
      const ins = await supabase.from("transactions").insert({
        id,
        type: "expense",
        status: "realized",
        amount: 0,
        category: "teste",
        description: "teste de diagnóstico (apagado em seguida)",
        account: "teste",
        date: new Date().toISOString().slice(0, 10),
        recurring: false,
      });
      if (ins.error) {
        out.push({ label: "Gravar uma movimentação de teste", ok: false, detail: ins.error.message });
      } else {
        const del = await supabase.from("transactions").delete().eq("id", id);
        out.push({
          label: "Gravar e apagar uma movimentação de teste",
          ok: !del.error,
          detail: del.error ? `gravou, mas não apagou: ${del.error.message}` : "ok",
        });
      }
    }

    setLines(out);
    setRunning(false);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-bold text-[#2C1E18]">Diagnóstico do Supabase</h1>
        <p className="mt-2 text-sm text-[#7B6A5D]">
          Testa se o app consegue ler e gravar no banco. Entre no app antes, para o teste de gravação funcionar.
        </p>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="mt-5 rounded-2xl bg-[#6B8E23] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {running ? "Testando..." : "Rodar teste"}
        </button>
        <ul className="mt-6 space-y-2">
          {lines.map((line) => (
            <li key={line.label} className={`rounded-2xl px-4 py-3 text-sm ${line.ok ? "bg-[#E6EED3] text-[#3E2723]" : "bg-[#FEE2E2] text-[#B91C1C]"}`}>
              <p className="font-semibold">{line.ok ? "✓" : "✗"} {line.label}</p>
              <p className="mt-0.5 break-words">{line.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
