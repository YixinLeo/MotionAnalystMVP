"use client";

import { useState } from "react";
import InterpretationCards from "@/components/InterpretationCards";
import type { Interpretation } from "@/lib/types";

export default function HistoryList({ items }: { items: Interpretation[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-neutral-300 bg-white/70 p-5 text-center text-sm text-neutral-500">
        还没有历史解读。
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">最近 10 条</h2>
        <span className="text-xs text-neutral-500">点击展开</span>
      </div>

      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <article key={item.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full text-left"
            >
              <p className="line-clamp-2 text-sm font-semibold">TA 说：“{item.other_text}”</p>
              <p className="mt-2 text-base font-black leading-snug text-coral">{item.one_liner}</p>
            </button>
            {isOpen ? (
              <div className="mt-4 border-t border-neutral-100 pt-4">
                <InterpretationCards result={item} />
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
