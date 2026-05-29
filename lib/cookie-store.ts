"use client";

import type { Character, Interpretation } from "@/lib/types";

const CHARS_COOKIE = "ta_chars";
const HISTORY_PREFIX = "ta_hist_";
const MAX_AGE = 60 * 60 * 24 * 365;

export type LocalCharacter = Character;
export type LocalInterpretation = Interpretation;

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const item = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!item) return null;
  return decodeURIComponent(item.slice(name.length + 1));
}

function writeCookie(name: string, value: unknown) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${encoded}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function readJson<T>(name: string, fallback: T): T {
  const raw = readCookie(name);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function historyCookieName(characterId: string) {
  return `${HISTORY_PREFIX}${characterId}`;
}

export function getCharacters() {
  return readJson<LocalCharacter[]>(CHARS_COOKIE, []);
}

export function saveCharacters(characters: LocalCharacter[]) {
  writeCookie(CHARS_COOKIE, characters.slice(0, 5));
}

export function getCharacter(id: string) {
  return getCharacters().find((character) => character.id === id) ?? null;
}

export function createCharacter(input: Omit<LocalCharacter, "id" | "user_id" | "created_at" | "updated_at">) {
  const characters = getCharacters();
  if (characters.length >= 5) {
    throw new Error("免费版最多创建 5 个关系对象。");
  }

  const now = new Date().toISOString();
  const character: LocalCharacter = {
    ...input,
    id: crypto.randomUUID(),
    user_id: "cookie-user",
    created_at: now,
    updated_at: now
  };

  saveCharacters([character, ...characters]);
  return character;
}

export function getHistory(characterId: string) {
  const rawHistory = readJson<Array<Record<string, unknown>>>(historyCookieName(characterId), []);

  return rawHistory
    .map((item) => ({
      id: String(item.id || crypto.randomUUID()),
      user_id: String(item.user_id || "cookie-user"),
      character_id: String(item.character_id || characterId),
      other_text: String(item.other_text || ""),
      optional_context: typeof item.optional_context === "string" ? item.optional_context : null,
      literal: String(item.literal || item.surface_meaning || ""),
      real_talk: String(item.real_talk || item.possible_subtext || ""),
      hidden_mood: String(item.hidden_mood || item.emotional_state || ""),
      danger_signal: String(item.danger_signal || item.relationship_signal || ""),
      reply: String(item.reply || item.suggested_reply || ""),
      one_liner: String(item.one_liner || item.punchline || ""),
      created_at: String(item.created_at || new Date().toISOString())
    }))
    .filter((item) => item.other_text && item.one_liner) as LocalInterpretation[];
}

export function saveHistory(characterId: string, history: LocalInterpretation[]) {
  const compacted = history.slice(0, 10).map((item) => ({
    ...item,
    other_text: item.other_text.slice(0, 160),
    optional_context: item.optional_context?.slice(0, 120) ?? null
  }));
  writeCookie(historyCookieName(characterId), compacted);
}

export function addInterpretation(characterId: string, interpretation: LocalInterpretation) {
  const history = getHistory(characterId);
  saveHistory(characterId, [interpretation, ...history]);
}

export function deleteAllLocalData() {
  getCharacters().forEach((character) => deleteCookie(historyCookieName(character.id)));
  deleteCookie(CHARS_COOKIE);
}
