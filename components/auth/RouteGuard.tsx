"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import LoadingScreen from "@/components/feedback/LoadingScreen";

export default function RouteGuard({
  children,
  requireQuiz = true,
}: {
  children: React.ReactNode;
  requireQuiz?: boolean;
}) {
  const router = useRouter();
  const { state, hydrated } = useApp();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.user) {
      router.replace("/login");
      return;
    }
    if (requireQuiz && !state.quizResult) {
      router.replace("/quiz");
    }
  }, [hydrated, requireQuiz, router, state.quizResult, state.user]);

  if (!hydrated) return <LoadingScreen />;
  if (!state.user) return <LoadingScreen />;
  if (requireQuiz && !state.quizResult) return <LoadingScreen />;

  return <>{children}</>;
}
