import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <defs>
        <linearGradient id="cr-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-glow)" />
        </linearGradient>
      </defs>
      <path d="M16 2.5 4.5 7v8.2c0 7 4.9 12.4 11.5 14.3 6.6-1.9 11.5-7.3 11.5-14.3V7L16 2.5Z" fill="var(--navy-2)" stroke="url(#cr-g)" strokeWidth="1.6" />
      <circle cx="16" cy="15.5" r="6.5" fill="none" stroke="url(#cr-g)" strokeOpacity=".45" strokeWidth="1" />
      <circle cx="16" cy="15.5" r="3.4" fill="none" stroke="url(#cr-g)" strokeOpacity=".7" strokeWidth="1" />
      <path d="M16 15.5 21.2 11" stroke="url(#cr-g)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="15.5" r="1.4" fill="var(--brand)" />
    </svg>
  );
}

export function Logo({ className, suffix = true }: { className?: string; suffix?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-lg font-bold", className)}>
      <LogoMark />
      <span>
        Ciber<span className="text-brand">Radar</span>
        {suffix && <span className="ml-1 text-xs font-semibold text-muted-foreground align-top">PME</span>}
      </span>
    </span>
  );
}
