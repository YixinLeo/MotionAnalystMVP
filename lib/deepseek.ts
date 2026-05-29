import type { Character, Interpretation, InterpretationOutput } from "@/lib/types";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

export const DEEPSEEK_SYSTEM_PROMPT = `你是一个“潜台词解读器”。

你的风格：
像一个很会读空气的朋友，嘴有点损，但不恶毒。
你不装专家，不讲大道理，不说废话。
你的语言像小红书/朋友圈截图文案：短、准、有梗、有情绪张力。
输出要短、狠、准、有画面感。
可以有一点调侃，但不要油腻。

禁止使用：
“建议保持沟通”
“可能存在误会”
“需要进一步观察”
“对方可能比较忙”
“尊重彼此边界”
“理性看待”

你必须输出合法 JSON，不要输出 Markdown，不要输出解释性文字。

输出字段必须且只能包含：
{
  "literal": "TA表面在说什么",
  "real_talk": "翻译成人话是什么意思",
  "hidden_mood": "TA当下可能的情绪",
  "danger_signal": "这句话的风险点",
  "reply": "你可以怎么回",
  "one_liner": "一句适合截图传播的总结"
}

风格要求：
1. 每个字段控制在 36 个中文字以内。
2. 不要把不确定的事情说死，但不要用套话糊弄。
3. 结果要适合截图传播，有一点洞察力和情绪张力。
4. 用人话，不要像客服、心理咨询师、情感专家。
5. 如果是职场角色，要偏现实、利益、边界、风险、责任分配。
6. 如果是恋爱/暧昧角色，要偏情绪、关系、安全感、试探、回避。
7. 如果是朋友/家庭角色，要偏边界、面子、关心、压力、期待。
8. 不要鼓励操控、PUA、跟踪、威胁、自伤、暴力或违法行为。
9. 不要输出“TA 一定喜欢你 / 一定讨厌你”这种绝对判断。
10. 如果用户输入过短，例如“嗯”“哈哈”“随便”，也要结合关系对象和上下文分析，但要点出信息太少，别硬演。
11. 如果用户输入为空、无意义或明显不完整，提示用户输入更具体的一句话。
12. 如果用户表达自伤、暴力或极端行为倾向，要温和拒绝潜台词分析，并建议寻求现实帮助。

示例1：
TA说：“我最近有点忙。”
输出：
{
  "literal": "最近事情比较多。",
  "real_talk": "不是没空，是暂时不想把你排太前。",
  "hidden_mood": "想降温，但不想把门关死。",
  "danger_signal": "你越追问，他越想躲。",
  "reply": "没事，你先忙。有空我们再约。",
  "one_liner": "忙不忙不重要，优先级才重要。"
}

示例2：
老板说：“你再优化一下。”
输出：
{
  "literal": "这个东西还要继续改。",
  "real_talk": "他不满意，但暂时不想把话说难听。",
  "hidden_mood": "在压结果，也在看你接不接得住。",
  "danger_signal": "只回“好的”，大概率继续返工。",
  "reply": "可以，我想确认下优先优化哪三点？",
  "one_liner": "职场里的“再优化一下”，经常等于“我还没法点头”。"
}`;

function buildHistory(history: Pick<Interpretation, "other_text" | "one_liner" | "created_at">[]) {
  if (history.length === 0) return "暂无历史解读。";

  return history
    .map((item, index) => `${index + 1}. TA 说：“${item.other_text}”\n   上次总结：${item.one_liner}`)
    .join("\n");
}

export function buildInterpretPrompt({
  character,
  history,
  otherText,
  optionalContext
}: {
  character: Character;
  history: Pick<Interpretation, "other_text" | "one_liner" | "created_at">[];
  otherText: string;
  optionalContext?: string | null;
}) {
  return `关系对象设定：
- 名称：${character.name}
- 关系：${character.relationship}
- 性别：${character.gender}
- MBTI：${character.mbti || "未填写"}
- 说话风格：${character.speaking_style}
- 关系状态：${character.relationship_status}
- 用户补充背景：${character.context_note || "无"}

最近历史解读：
${buildHistory(history)}

TA 刚刚说：
${otherText}

用户补充上下文：
${optionalContext || "无"}

请基于以上信息，输出合法 JSON。不要输出 Markdown，不要输出解释性文字。`;
}

export function validateInterpretationOutput(value: unknown): InterpretationOutput {
  if (!value || typeof value !== "object") {
    throw new Error("DeepSeek returned an invalid JSON object.");
  }

  const record = value as Record<string, unknown>;
  const fields = [
    "literal",
    "real_talk",
    "hidden_mood",
    "danger_signal",
    "reply",
    "one_liner"
  ] as const;

  for (const field of fields) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      throw new Error(`DeepSeek JSON is missing field: ${field}`);
    }
  }

  return {
    literal: String(record.literal).trim(),
    real_talk: String(record.real_talk).trim(),
    hidden_mood: String(record.hidden_mood).trim(),
    danger_signal: String(record.danger_signal).trim(),
    reply: String(record.reply).trim(),
    one_liner: String(record.one_liner).trim()
  };
}

export async function callDeepSeek(prompt: string): Promise<InterpretationOutput> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY.");
  }

  const requestBody = {
    model: "deepseek-v4-flash",
    messages: [
      { role: "system", content: DEEPSEEK_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.95,
    max_tokens: 2000
  };

  const content = await requestDeepSeek(apiKey, requestBody);
  return validateInterpretationOutput(JSON.parse(content));
}

async function requestDeepSeek(apiKey: string, requestBody: Record<string, unknown>, attempt = 0) {
  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      finish_reason?: string;
      message?: { content?: string; reasoning_content?: string };
    }>;
  };

  const choice = payload.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (!content) {
    console.error("DeepSeek returned empty content:", {
      finish_reason: choice?.finish_reason,
      has_reasoning_content: Boolean(choice?.message?.reasoning_content)
    });

    const retryPayload = {
      ...requestBody,
      messages: [
        {
          role: "system",
          content:
            "你必须只输出一个合法 JSON 对象。不要解释，不要推理，不要 Markdown。字段：literal, real_talk, hidden_mood, danger_signal, reply, one_liner。每个字段少于36个中文字。"
        },
        ...((requestBody.messages as Array<{ role: string; content: string }> | undefined)?.slice(1) ?? [])
      ],
      max_tokens: 2000
    };

    if (attempt >= 1) {
      throw new Error("DeepSeek 这次只返回了推理过程，没吐出 JSON。请再试一次。");
    }

    return requestDeepSeek(apiKey, retryPayload, attempt + 1);
  }

  return content;
}
