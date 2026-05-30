const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DAILY_LIMIT = 20;
const NO_TOKEN_MESSAGE = "作者没有 Token了，请给他发邮件让他充 token";

const SYSTEM_PROMPT = `你是一个“潜台词解读器”。

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
12. 如果用户表达自伤、暴力或极端行为倾向，要温和拒绝潜台词分析，并建议寻求现实帮助。`;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const characterId = body.characterId?.trim();
    const otherText = body.otherText?.trim();
    const optionalContext = body.optionalContext?.trim() || null;

    if (!characterId || !otherText) {
      return json({ error: "请填写要解读的那句话。" }, 400);
    }

    const character = body.character;
    if (!character || character.id !== characterId) {
      return json({ error: "没有找到这个关系对象。" }, 404);
    }

    const kv = getRateLimitKV(env);
    if (!kv) {
      return json({ error: "限流存储未配置：请在 EdgeOne Pages 绑定 KV 变量 RATE_LIMIT_KV。" }, 500);
    }

    const rateLimit = await checkDailyRateLimit(request, kv, env);
    if (!rateLimit.allowed) {
      return json({ error: "作者的 AI Token 快被薅秃了" }, 429);
    }

    const apiKey = getDeepSeekApiKey(env);
    if (!apiKey) {
      return json({ error: "Missing DEEPSEEK_API_KEY." }, 500);
    }

    const history = [...(body.history || [])].slice(-10);
    const prompt = buildInterpretPrompt({ character, history, otherText, optionalContext });
    const output = await callDeepSeek(apiKey, prompt);
    await rateLimit.commit();

    return json({
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
      return json({ error: NO_TOKEN_MESSAGE }, 503);
    }

    return json({ error: message || "解读失败，请稍后再试。" }, 500);
  }
}

function getRateLimitKV(env) {
  if (env?.RATE_LIMIT_KV && typeof env.RATE_LIMIT_KV.get === "function") return env.RATE_LIMIT_KV;

  try {
    if (typeof RATE_LIMIT_KV !== "undefined") return RATE_LIMIT_KV;
  } catch {
    return null;
  }

  return null;
}

function getDeepSeekApiKey(env) {
  return env?.DEEPSEEK_API_KEY || "";
}

async function checkDailyRateLimit(request, kv, env) {
  const configuredLimit = Number(env?.DAILY_INTERPRET_LIMIT || DAILY_LIMIT);
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : DAILY_LIMIT;
  const resetDate = getShanghaiDate();
  const key = await buildRateLimitKey(request, resetDate);
  const current = Number((await kv.get(key)) || 0);

  if (current >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetDate,
      commit: async () => {}
    };
  }

  return {
    allowed: true,
    remaining: Math.max(limit - current - 1, 0),
    limit,
    resetDate,
    commit: async () => {
      await kv.put(key, String(current + 1));
    }
  };
}

async function buildRateLimitKey(request, date) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const fingerprint = await sha256(`${ip}|${userAgent}`);

  return `rl_${date.replaceAll("-", "")}_${fingerprint.slice(0, 32)}`;
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("eo-client-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-client-ip") ||
    "unknown"
  );
}

function getShanghaiDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";

  return `${year}-${month}-${day}`;
}

async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function buildHistory(history) {
  if (history.length === 0) return "暂无历史解读。";

  return history
    .map((item, index) => `${index + 1}. TA 说：“${item.other_text}”\n   上次总结：${item.one_liner}`)
    .join("\n");
}

function buildInterpretPrompt({ character, history, otherText, optionalContext }) {
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

async function callDeepSeek(apiKey, prompt) {
  const requestBody = {
    model: "deepseek-v4-flash",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.95,
    max_tokens: 2000
  };

  const content = await requestDeepSeek(apiKey, requestBody);
  return validateOutput(JSON.parse(content));
}

async function requestDeepSeek(apiKey, requestBody, attempt = 0) {
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

  const payload = await response.json();
  const choice = payload.choices?.[0];
  const content = choice?.message?.content?.trim();

  if (!content) {
    if (attempt >= 1) {
      throw new Error("DeepSeek 这次只返回了推理过程，没吐出 JSON。请再试一次。");
    }

    return requestDeepSeek(
      apiKey,
      {
        ...requestBody,
        messages: [
          {
            role: "system",
            content:
              "你必须只输出一个合法 JSON 对象。不要解释，不要推理，不要 Markdown。字段：literal, real_talk, hidden_mood, danger_signal, reply, one_liner。每个字段少于36个中文字。"
          },
          ...requestBody.messages.slice(1)
        ]
      },
      attempt + 1
    );
  }

  return content;
}

function validateOutput(value) {
  if (!value || typeof value !== "object") {
    throw new Error("DeepSeek returned an invalid JSON object.");
  }

  const fields = ["literal", "real_talk", "hidden_mood", "danger_signal", "reply", "one_liner"];
  for (const field of fields) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      throw new Error(`DeepSeek JSON is missing field: ${field}`);
    }
  }

  return {
    literal: value.literal.trim(),
    real_talk: value.real_talk.trim(),
    hidden_mood: value.hidden_mood.trim(),
    danger_signal: value.danger_signal.trim(),
    reply: value.reply.trim(),
    one_liner: value.one_liner.trim()
  };
}

function isDeepSeekTokenError(message) {
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}
