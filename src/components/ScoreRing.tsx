import { classify } from "@/lib/scoring";

export function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const cls = classify(score);
  const color = cls === "Boas práticas iniciais" ? "var(--brand)" : cls === "Proteção em desenvolvimento" ? "var(--warning)" : "var(--danger)";
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`Pontuação ${score} de 100`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="var(--border)" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-extrabold">{score}</span>
        <span className="text-xs text-muted-foreground">de 100</span>
      </div>
    </div>
  );
}
