"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InterpretPanel from "@/components/InterpretPanel";
import { getCharacter, getHistory } from "@/lib/cookie-store";
import type { Character, Interpretation } from "@/lib/types";

export default function CharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [history, setHistory] = useState<Interpretation[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = getCharacter(params.id);
    if (!found) {
      router.replace("/characters");
      return;
    }

    setCharacter(found);
    setHistory(getHistory(params.id));
    setReady(true);
  }, [params.id, router]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6">
      <Link href="/characters" className="text-sm font-bold text-neutral-500">
        返回对象列表
      </Link>
      <div className="mt-5">
        {ready && character ? (
          <InterpretPanel character={character} initialHistory={history} />
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-500 shadow-card">
            正在读取本机数据...
          </div>
        )}
      </div>
    </main>
  );
}
