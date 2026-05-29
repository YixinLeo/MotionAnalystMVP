import Link from "next/link";

const examples = [
  {
    title: "TA 说：“我最近有点忙。”",
    text: "更像是在降温，但不一定是拒绝。"
  },
  {
    title: "老板说：“你再优化一下。”",
    text: "表面是建议，实际可能是结果还没达标。"
  },
  {
    title: "HR 说：“我们内部再评估一下。”",
    text: "大概率还没确定，也可能是委婉拖延。"
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <section className="flex flex-1 flex-col justify-center">
        <p className="mb-3 inline-flex w-fit rounded-full bg-mint px-3 py-1 text-sm font-bold text-emerald-900">
          潜台词解读器
        </p>
        <h1 className="text-5xl font-black leading-tight tracking-normal">TA 到底什么意思？</h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-700">
          输入一句话，看看 TA 可能藏着什么潜台词。
        </p>

        <Link
          href="/characters"
          className="mt-8 block w-full rounded-lg bg-ink px-5 py-4 text-center text-lg font-black text-white shadow-card"
        >
          开始解读
        </Link>
      </section>

      <section className="space-y-3 pb-6">
        {examples.map((item) => (
          <article key={item.title} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
            <p className="text-sm font-bold text-neutral-500">{item.title}</p>
            <p className="mt-2 text-lg font-black leading-snug">{item.text}</p>
          </article>
        ))}
      </section>

      <p className="text-center text-xs text-neutral-500">
        数据仅保存在当前浏览器 cookie 中。结果仅为 AI 视角模拟，不代表真实心理判断。
      </p>
    </main>
  );
}
