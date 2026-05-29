export type Relationship =
  | "lover"
  | "crush"
  | "boss"
  | "hr"
  | "colleague"
  | "friend"
  | "family"
  | "other";

export type Gender = "male" | "female" | "neutral";

export type Character = {
  id: string;
  user_id: string;
  name: string;
  relationship: Relationship;
  gender: Gender;
  mbti: string | null;
  speaking_style: string;
  relationship_status: string;
  context_note: string | null;
  avatar_config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type Interpretation = {
  id: string;
  user_id: string;
  character_id: string;
  other_text: string;
  optional_context: string | null;
  literal: string;
  real_talk: string;
  hidden_mood: string;
  danger_signal: string;
  reply: string;
  one_liner: string;
  created_at: string;
};

export type InterpretationOutput = Pick<
  Interpretation,
  | "literal"
  | "real_talk"
  | "hidden_mood"
  | "danger_signal"
  | "reply"
  | "one_liner"
>;
