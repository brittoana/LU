import Image from "next/image";

interface LumaLogoProps {
  size?: number;
  className?: string;
}

export default function LumaLogo({ size = 28, className = "" }: LumaLogoProps) {
  return (
    <Image
      src="/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      priority
    />
  );
}
