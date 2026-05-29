"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!hasSupabaseConfig) {
      setLoading(false);
      setMessage("Supabase 还没配置。请先填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。");
      return;
    }

    const supabase = createClient();
    const action =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("注册成功。如果 Supabase 开启了邮件确认，请先查收邮件。");
    }

    router.push("/characters");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
      <div className="grid grid-cols-2 rounded-lg bg-neutral-100 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-md px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-white shadow-sm" : "text-neutral-500"}`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-md px-3 py-2 text-sm font-bold ${mode === "signup" ? "bg-white shadow-sm" : "text-neutral-500"}`}
        >
          注册
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-bold">邮箱</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 outline-none focus:border-coral"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">密码</span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 outline-none focus:border-coral"
            placeholder="至少 6 位"
          />
        </label>

        {message ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-ink px-4 py-3 font-black text-white disabled:opacity-60"
        >
          {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
        </button>
      </form>
    </div>
  );
}
