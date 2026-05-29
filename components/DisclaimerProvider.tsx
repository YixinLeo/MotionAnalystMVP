"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const CONSENT_KEY = "ta_disclaimer_ack";

type DisclaimerContextValue = {
  accepted: boolean;
  openDisclaimer: () => void;
  ensureAccepted: () => boolean;
};

const DisclaimerContext = createContext<DisclaimerContextValue | null>(null);

export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY) === "yes";
    setAccepted(stored);
    setOpen(!stored);
  }, []);

  function acknowledge() {
    window.localStorage.setItem(CONSENT_KEY, "yes");
    setAccepted(true);
    setOpen(false);
  }

  const value = useMemo<DisclaimerContextValue>(
    () => ({
      accepted,
      openDisclaimer: () => setOpen(true),
      ensureAccepted: () => {
        if (accepted) return true;
        setOpen(true);
        return false;
      }
    }),
    [accepted]
  );

  return (
    <DisclaimerContext.Provider value={value}>
      {children}
      {open ? <DisclaimerModal onClose={() => setOpen(false)} onAcknowledge={acknowledge} /> : null}
    </DisclaimerContext.Provider>
  );
}

export function useDisclaimer() {
  const context = useContext(DisclaimerContext);
  if (!context) {
    throw new Error("useDisclaimer must be used inside DisclaimerProvider.");
  }
  return context;
}

export function DisclaimerNotice({ className = "" }: { className?: string }) {
  const { openDisclaimer } = useDisclaimer();

  return (
    <p className={`text-center text-xs leading-5 text-neutral-500 ${className}`}>
      数据仅保存在当前浏览器。结果仅为 AI 视角模拟，不代表真实心理判断。{" "}
      <button
        type="button"
        onClick={openDisclaimer}
        className="font-bold text-coral underline underline-offset-2"
      >
        免责声明
      </button>
    </p>
  );
}

function DisclaimerModal({
  onClose,
  onAcknowledge
}: {
  onClose: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 px-4 py-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-paper p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-coral">使用前先说清楚</p>
            <h2 id="disclaimer-title" className="mt-1 text-2xl font-black leading-tight">
              它会拆话，但不替你判案。
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="取消并关闭免责声明"
            title="取消"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-6 text-neutral-700">
          <p>
            你创建的关系对象和历史记录只保存在当前浏览器 cookie / 本地存储里，不会存进网页制作者的数据库。
          </p>
          <p>
            点击“解读潜台词”时，本次原话、补充上下文和关系设定会发送给 DeepSeek 生成结果；网页制作者不把这些内容另存成用户档案。
          </p>
          <p>
            分析结果由 DeepSeek 生成，是 AI 视角模拟，不是真实心理判断。它可以当参考，别当判决书。
          </p>
        </div>

        <div className="mt-5 rounded-lg bg-white p-4 text-xs leading-5 text-neutral-500">
          如果内容涉及自伤、暴力、违法、跟踪、骚扰或操控，本工具不会提供策略型建议。
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-black text-neutral-700"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onAcknowledge}
            className="rounded-lg bg-ink px-4 py-3 font-black text-white"
          >
            我已知晓
          </button>
        </div>
      </section>
    </div>
  );
}
