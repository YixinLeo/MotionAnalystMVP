import { NextResponse } from "next/server";
import { buildInterpretPrompt, callDeepSeek } from "@/lib/deepseek";
import { checkDailyRateLimit } from "@/lib/rate-limit";
import type { Character, Interpretation } from "@/lib/types";

const NO_TOKEN_MESSAGE = "作者没有 Token了，请给他发邮件让他充 token";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      characterId?: string;
      otherText?: string;
      optionalContext?: string;
      character?: Character;
      history?: Pick<Interpretation, "other_text" | "one_liner" | "created_at">[];
    };

    const characterId = body.characterId?.trim();
    const otherText = body.otherText?.trim();
    const optionalContext = body.optionalContext?.trim() || null;

    if (!characterId || !otherText) {
      return NextResponse.json({ error: "请填写要解读的那句话。" }, { status: 400 });
    }

    const character = body.character;
    if (!character || character.id !== characterId) {
      return NextResponse.json({ error: "没有找到这个关系对象。" }, { status: 404 });
    }

    const rateLimit = await checkDailyRateLimit(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "作者的 AI Token 快被薅秃了" },
        { status: 429 }
      );
    }

    const history = [...(body.history ?? [])].slice(-10);
    const prompt = buildInterpretPrompt({ character, history, otherText, optionalContext });
    const output = await callDeepSeek(prompt);
    await rateLimit.commit();

    return NextResponse.json({
      output,
      rateLimit: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
        resetDate: rateLimit.resetDate
      }
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "";

    if (isDeepSeekTokenError(message)) {
      return NextResponse.json({ error: NO_TOKEN_MESSAGE }, { status: 503 });
    }

    return NextResponse.json(
      { error: message || "解读失败，请稍后再试。" },
      { status: 500 }
    );
  }
}

function isDeepSeekTokenError(message: string) {
  const normalized = message.toLowerCase();

  return [
    "insufficient",
    "insufficient_quota",
    "quota",
    "balance",
    "billing",
    "payment",
    "credits",
    "credit",
    "no token",
    "token 不足",
    "余额不足",
    "额度不足",
    "欠费",
    "402"
  ].some((keyword) => normalized.includes(keyword));
}
