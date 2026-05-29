"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclaimer } from "@/components/DisclaimerProvider";
import { createCharacter, getCharacters } from "@/lib/cookie-store";
import {
  genderOptions,
  mbtiOptions,
  relationshipOptions,
  relationshipStatuses,
  speakingStyles
} from "@/lib/options";
import type { Gender, Relationship } from "@/lib/types";

export default function NewCharacterForm({ initialCount }: { initialCount: number }) {
  const router = useRouter();
  const { ensureAccepted } = useDisclaimer();
  const [error, setError] = useState(initialCount >= 5 ? "免费版最多创建 5 个关系对象。" : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ensureAccepted()) return;

    if (initialCount >= 5) return;

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const currentCount = getCharacters().length;

    if (currentCount >= 5) {
      setLoading(false);
      setError("免费版最多创建 5 个关系对象。");
      return;
    }

    try {
      const relationship = String(form.get("relationship") || "other");
      const character = createCharacter({
        name: String(form.get("name") || "").trim(),
        relationship: relationship as Relationship,
        gender: String(form.get("gender") || "neutral") as Gender,
        mbti: String(form.get("mbti") || "") || null,
        speaking_style: String(form.get("speaking_style") || "客气"),
        relationship_status: String(form.get("relationship_status") || "普通"),
        context_note: String(form.get("context_note") || "").trim() || null,
        avatar_config: { relationship }
      });

      setLoading(false);
      router.push(`/characters/${character.id}`);
      router.refresh();
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : "创建失败，请稍后再试。");
    }
  }

  const disabled = initialCount >= 5 || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-card">
      <label className="block">
        <span className="text-sm font-bold">名称</span>
        <input
          required
          name="name"
          maxLength={24}
          className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-3 outline-none focus:border-coral"
          placeholder="老板 / 女朋友 / 暧昧对象 / HR"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <SelectField name="relationship" label="关系类型" options={relationshipOptions} />
        <SelectField name="gender" label="性别" options={genderOptions} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-bold">MBTI</span>
          <select
            name="mbti"
            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 outline-none focus:border-coral"
          >
            <option value="">不确定</option>
            {mbtiOptions.filter(Boolean).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <SelectField
          name="relationship_status"
          label="关系状态"
          options={relationshipStatuses.map((item) => ({ value: item, label: item }))}
        />
      </div>

      <SelectField
        name="speaking_style"
        label="说话风格"
        options={speakingStyles.map((item) => ({ value: item, label: item }))}
      />

      <label className="block">
        <span className="text-sm font-bold">补充背景</span>
        <textarea
          name="context_note"
          rows={4}
          maxLength={300}
          className="mt-2 w-full resize-none rounded-lg border border-neutral-200 px-3 py-3 outline-none focus:border-coral"
          placeholder="最近吵过架 / 我刚面试完 / 他是我的直属领导"
        />
      </label>

      {error ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p> : null}

      <button disabled={disabled} className="w-full rounded-lg bg-ink px-4 py-3 font-black text-white disabled:opacity-50">
        {loading ? "正在创建..." : "创建并开始解读"}
      </button>
    </form>
  );
}

function SelectField({
  name,
  label,
  options
}: {
  name: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <select
        name={name}
        className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 outline-none focus:border-coral"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
