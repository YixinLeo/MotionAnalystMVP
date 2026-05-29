import { Copy } from "lucide-react";
import type { Interpretation, InterpretationOutput } from "@/lib/types";

type Result = Interpretation | InterpretationOutput;

const cardMap = [
  ["表面意思", "literal"],
  ["人话翻译", "real_talk"],
  ["TA 现在的状态", "hidden_mood"],
  ["危险在哪里", "danger_signal"],
  ["你可以怎么回", "reply"],
  ["一句话总结", "one_liner"]
] as const;

export function resultToText(result: Result) {
  return [
    `表面意思：${result.literal}`,
    `人话翻译：${result.real_talk}`,
    `TA 现在的状态：${result.hidden_mood}`,
    `这句话危险在哪里：${result.danger_signal}`,
    `你可以怎么回：${result.reply}`,
    `一句话总结：${result.one_liner}`
  ].join("\n");
}

export default function InterpretationCards({
  result,
  onCopy
}: {
  result: Result;
  onCopy?: () => void;
}) {
  return (
    <section className="space-y-3" aria-label="解读结果">
      <div className="rounded-lg border-2 border-ink bg-lemon p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-neutral-600">一句话总结</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">{result.one_liner}</h2>
          </div>
          {onCopy ? (
            <button
              type="button"
              onClick={onCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm"
              aria-label="复制结果"
              title="复制结果"
            >
              <Copy size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3">
        {cardMap.map(([title, key]) => {
          if (key === "one_liner") return null;

          return (
            <article key={key} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
              <p className="text-xs font-bold text-neutral-500">{title}</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-ink">{result[key]}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
