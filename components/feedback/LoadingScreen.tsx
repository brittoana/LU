export default function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8" aria-busy="true" aria-label="Carregando seus dados">
      <div className="mx-auto w-full max-w-5xl animate-pulse space-y-4">
        <div className="h-8 w-44 rounded-xl bg-[#E7DDD2]" />
        <div className="h-4 w-28 rounded-lg bg-[#EFEBE4]" />
        <div className="mt-6 h-44 rounded-3xl bg-[#E7DDD2]" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-24 rounded-2xl bg-[#EFEBE4]" />
          <div className="h-24 rounded-2xl bg-[#EFEBE4]" />
          <div className="h-24 rounded-2xl bg-[#EFEBE4]" />
        </div>
        <div className="h-40 rounded-3xl bg-[#EFEBE4]" />
      </div>
    </main>
  );
}
