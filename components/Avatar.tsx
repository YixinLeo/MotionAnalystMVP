import { relationshipOptions } from "@/lib/options";

const emojiMap: Record<string, string> = {
  lover: "💗",
  crush: "👀",
  boss: "💼",
  hr: "📋",
  colleague: "🧑‍💻",
  friend: "🍻",
  family: "🏠",
  other: "🧩"
};

const colorMap: Record<string, string> = {
  lover: "bg-rose-100",
  crush: "bg-amber-100",
  boss: "bg-sky-100",
  hr: "bg-lime-100",
  colleague: "bg-cyan-100",
  friend: "bg-orange-100",
  family: "bg-emerald-100",
  other: "bg-violet-100"
};

export function avatarEmoji(relationship: string) {
  return emojiMap[relationship] ?? emojiMap.other;
}

export default function Avatar({
  relationship,
  size = "md"
}: {
  relationship: string;
  size?: "sm" | "md" | "lg";
}) {
  const label = relationshipOptions.find((item) => item.value === relationship)?.label ?? "关系对象";
  const sizes = {
    sm: "h-10 w-10 text-xl",
    md: "h-12 w-12 text-2xl",
    lg: "h-16 w-16 text-3xl"
  };

  return (
    <div
      aria-label={label}
      className={`${sizes[size]} ${colorMap[relationship] ?? colorMap.other} flex shrink-0 items-center justify-center rounded-full shadow-sm`}
    >
      <span aria-hidden>{avatarEmoji(relationship)}</span>
    </div>
  );
}
