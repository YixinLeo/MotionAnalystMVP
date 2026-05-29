"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DisclaimerNotice } from "@/components/DisclaimerProvider";
import HowToUse from "@/components/HowToUse";
import NewCharacterForm from "@/components/NewCharacterForm";
import { getCharacters } from "@/lib/cookie-store";

export default function NewCharacterPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCharacters().length);
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/characters" className="text-sm font-bold text-neutral-500">
          返回对象列表
        </Link>
        <HowToUse compact />
      </div>
      <section className="mt-6">
        <h1 className="text-3xl font-black">创建关系对象</h1>
        <p className="mt-2 text-neutral-600">先给 TA 一个基本设定，解读才更像那么回事。</p>
      </section>
      <div className="mt-6">
        <NewCharacterForm initialCount={count} />
      </div>
      <DisclaimerNotice className="mt-8" />
    </main>
  );
}
