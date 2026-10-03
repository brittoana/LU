export default function PageHeader({ title, subtitle, trailing }: { title: React.ReactNode; subtitle?: string; trailing?: React.ReactNode }) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3 md:mb-5 md:gap-4">
      <div>
        {typeof title === "string" ? <h1 className="text-2xl font-bold tracking-tight text-[#2C1E18] md:text-3xl">{title}</h1> : title}
        {subtitle ? <p className="mt-1 text-sm text-[#7B6A5D]">{subtitle}</p> : null}
      </div>
      {trailing}
    </header>
  );
}
