import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-card">
        <p className="text-sm font-bold text-coral">本地 cookie 版本</p>
        <h1 className="mt-2 text-3xl font-black">现在不需要登录。</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          关系对象和历史记录会保存在当前浏览器 cookie 中，换设备或清理浏览器数据后不会同步。
        </p>
        <Link
          href="/characters"
          className="mt-6 block rounded-lg bg-ink px-4 py-3 font-black text-white"
        >
          直接开始
        </Link>
      </section>
    </main>
  );
}
