"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import { DisclaimerNotice, useDisclaimer } from "@/components/DisclaimerProvider";
import HistoryList from "@/components/HistoryList";
import InterpretationCards, { resultToText } from "@/components/InterpretationCards";
import { addInterpretation } from "@/lib/cookie-store";
import { relationshipLabel } from "@/lib/options";
import type { Character, Interpretation, InterpretationOutput } from "@/lib/types";

export default function InterpretPanel({
  character,
  initialHistory
}: {
  character: Character;
  initialHistory: Interpretation[];
}) {
  const [otherText, setOtherText] = useState("");
  const [optionalContext, setOptionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<Interpretation | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const { ensureAccepted } = useDisclaimer();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ensureAccepted()) return;

    setLoading(true);
    setError("");
    setCopied(false);

    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: character.id,
        character,
        history: history
          .slice(0, 10)
          .reverse()
          .map((item) => ({
            other_text: item.other_text,
            one_liner: item.one_liner,
            created_at: item.created_at
          })),
        otherText,
        optionalContext
      })
    });

    const payload = (await response.json()) as {
      interpretation?: Interpretation;
      output?: InterpretationOutput;
      error?: string;
    };

    setLoading(false);

    if (!response.ok || !payload.output) {
      setError(payload.error || "解读失败，请稍后再试。");
      return;
    }

    const saved: Interpretation = {
      ...payload.output,
      id: crypto.randomUUID(),
      user_id: "cookie-user",
      character_id: character.id,
      other_text: otherText,
      optional_context: optionalContext.trim() || null,
      created_at: new Date().toISOString()
    };

    addInterpretation(character.id, saved);
    setResult(saved);
    setHistory((items) => [saved, ...items].slice(0, 10));
    setOtherText("");
    setOptionalContext("");
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(resultToText(result));
    setCopied(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <Avatar relationship={character.relationship} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black">{character.name}</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {relationshipLabel(character.relationship)} · {character.relationship_status}
              {character.mbti ? ` · ${character.mbti}` : ""}
            </p>
            <p className="mt-1 text-sm text-neutral-500">说话风格：{character.speaking_style}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
        <label className="block">
          <span className="text-sm font-bold">TA 说了什么</span>
          <textarea
            required
            rows={5}
            maxLength={500}
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            className="mt-2 w-full resize-none rounded-lg border border-neutral-200 px-3 py-3 outline-none focus:border-coral"
            placeholder="粘贴 TA 对你说的那句话"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">补充上下文</span>
          <textarea
            rows={3}
            maxLength={300}
            value={optionalContext}
            onChange={(event) => setOptionalContext(event.target.value)}
            className="mt-2 w-full resize-none rounded-lg border border-neutral-200 px-3 py-3 outline-none focus:border-coral"
            placeholder="补充一点上下文，例如：这是他三小时没回之后发的，可选"
          />
        </label>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <button disabled={loading} className="w-full rounded-lg bg-coral px-4 py-3 font-black text-white disabled:opacity-60">
          {loading ? "正在分析 TA 的潜台词..." : "解读潜台词"}
        </button>
      </form>

      {result ? (
        <div className="space-y-2">
          <InterpretationCards result={result} onCopy={copyResult} />
          {copied ? <p className="text-center text-sm font-bold text-green-700">已复制结果</p> : null}
        </div>
      ) : null}

      <HistoryList items={history} />

      <DisclaimerNotice className="pb-8" />
    </div>
  );
}
