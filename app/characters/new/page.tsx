"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NewCharacterForm from "@/components/NewCharacterForm";
import { getCharacters } from "@/lib/cookie-store";

export default function NewCharacterPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCharacters().length);
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-6">
      <Link href="/characters" className="text-sm font-bold text-neutral-500">
        返回对象列表
      </Link>
      <section className="mt-6">
        <h1 className="text-3xl font-black">创建关系对象</h1>
        <p className="mt-2 text-neutral-600">先给 TA 一个基本设定，解读才更像那么回事。</p>
      </section>
      <div className="mt-6">
        <NewCharacterForm initialCount={count} />
      </div>
      <p className="mt-8 text-center text-xs text-neutral-500">
        数据仅保存在当前浏览器 cookie 中。结果仅为 AI 视角模拟，不代表真实心理判断。
      </p>
    </main>
  );
}
