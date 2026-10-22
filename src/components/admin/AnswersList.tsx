import { ANSWER_LABEL, QUESTIONS, isAnswer } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export function AnswersList({ answers }: { answers: unknown }) {
  const rec = (answers && typeof answers === "object" ? answers : {}) as Record<string, unknown>;
  return (
    <ol className="grid gap-2">
      {QUESTIONS.map((q, i) => {
        const a = rec[q.id];
        const label = isAnswer(a) ? ANSWER_LABEL[a] : "—";
        return (
          <li key={q.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-sm">
            <span><span className="text-muted-foreground">{i + 1}.</span> {q.text}</span>
            <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
              a === "sim" ? "bg-success/15 text-success" : a === "nao" ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
