import Link from "next/link";
import Avatar from "@/components/Avatar";
import { relationshipLabel } from "@/lib/options";
import type { Character } from "@/lib/types";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/characters/${character.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-coral"
    >
      <div className="flex items-center gap-3">
        <Avatar relationship={character.relationship} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{character.name}</h2>
            {character.mbti ? (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {character.mbti}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {relationshipLabel(character.relationship)} · {character.relationship_status}
          </p>
        </div>
      </div>
    </Link>
  );
}
