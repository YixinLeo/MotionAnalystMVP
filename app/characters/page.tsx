"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import CharacterCard from "@/components/CharacterCard";
import { deleteAllLocalData, getCharacters } from "@/lib/cookie-store";
import type { Character } from "@/lib/types";

export default function CharactersPage() {
  const [items, setItems] = useState<Character[]>([]);

  useEffect(() => {
    setItems(getCharacters());
  }, []);

  function clearData() {
    deleteAllLocalData();
    setItems([]);
  }

  const canCreate = items.length < 5;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-coral">TA 到底什么意思？</p>
          <h1 className="text-3xl font-black">关系对象</h1>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clearData}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="清空本机数据"
            title="清空本机数据"
          >
            <Trash2 size={18} />
          </button>
        ) : null}
      </header>

      <section className="mt-6 space-y-3">
        {items.length > 0 ? (
          items.map((character) => <CharacterCard key={character.id} character={character} />)
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white/70 p-8 text-center">
            <p className="font-bold">先创建一个你想解读的人。</p>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 mt-6 bg-paper py-4">
        {canCreate ? (
          <Link
            href="/characters/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-black text-white shadow-card"
          >
            <Plus size={18} />
            创建关系对象
          </Link>
        ) : (
          <p className="rounded-lg bg-amber-50 p-4 text-center text-sm font-bold text-amber-800">
            免费版最多创建 5 个关系对象。
          </p>
        )}
      </div>

      <p className="pb-4 text-center text-xs text-neutral-500">
        数据仅保存在当前浏览器 cookie 中。结果仅为 AI 视角模拟，不代表真实心理判断。
      </p>
    </main>
  );
}
