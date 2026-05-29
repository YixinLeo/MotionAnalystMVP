"use client";

import { CircleHelp, X } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    title: "先建一个人",
    body: "比如老板、暧昧对象、HR、朋友。关系设得越像，解读越不跑偏。"
  },
  {
    title: "粘贴原话",
    body: "别改写，别润色。TA怎么说，你就怎么贴。"
  },
  {
    title: "补一句上下文",
    body: "比如“三小时没回后发的”“方案评审后说的”。这句很值钱。"
  },
  {
    title: "看人话翻译",
    body: "重点看“人话翻译”“危险在哪里”“你可以怎么回”，别只盯金句爽。"
  }
];

export default function HowToUse({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white font-bold text-ink shadow-sm transition hover:border-coral ${
          compact ? "h-10 px-3 text-sm" : "px-3 py-2 text-sm"
        }`}
        aria-label="查看怎么用"
        title="怎么用"
      >
        <CircleHelp size={16} />
        怎么用
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 py-5 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-to-use-title"
        >
          <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-paper p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black text-coral">30 秒上手</p>
                <h2 id="how-to-use-title" className="mt-1 text-2xl font-black leading-tight">
                  别跟它聊天，拿它拆话。
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
                aria-label="关闭教程"
                title="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-black leading-tight">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-white p-4">
              <p className="text-sm font-black">适合输入这种：</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                “我最近有点忙” / “你再优化一下” / “我们内部再评估一下”
              </p>
              <p className="mt-3 text-xs leading-5 text-neutral-500">
                数据只存在当前浏览器。结果是 AI 视角模拟，别拿它当判决书。
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
