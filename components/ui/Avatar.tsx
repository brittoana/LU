/* eslint-disable @next/next/no-img-element */
export default function Avatar({ src, name, size = 40, className = "" }: { src?: string; name?: string; size?: number; className?: string }) {
  const initial = (name ?? "").trim().charAt(0).toLocaleUpperCase("pt-BR") || "L";
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  if (src) {
    return <img src={src} alt={name ? `Foto de ${name}` : "Foto de perfil"} style={style} className={`shrink-0 rounded-full object-cover ring-2 ring-white/70 ${className}`} />;
  }
  return (
    <span style={style} aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A5B97B] to-[#6B8E23] font-bold text-white ring-2 ring-white/70 ${className}`}>
      {initial}
    </span>
  );
}
