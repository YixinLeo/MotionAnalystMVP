type EdgeOneKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: string;
  commit: () => Promise<void>;
};

const DAILY_LIMIT = 20;
const KV_BINDING_NAME = "RATE_LIMIT_KV";
const memoryCounts = new Map<string, number>();

declare const RATE_LIMIT_KV: EdgeOneKV | undefined;

export async function checkDailyRateLimit(request: Request): Promise<RateLimitResult> {
  const configuredLimit = Number(process.env.DAILY_INTERPRET_LIMIT || DAILY_LIMIT);
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : DAILY_LIMIT;
  const resetDate = getShanghaiDate();
  const key = await buildRateLimitKey(request, resetDate);
  const kv = getEdgeOneKV();
  const hostname = new URL(request.url).hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (!kv && !isLocal) {
    if (process.env.RATE_LIMIT_KV) {
      throw new Error("RATE_LIMIT_KV 不能填成普通环境变量；请绑定 EdgeOne KV 命名空间。次数 20 请填 DAILY_INTERPRET_LIMIT。");
    }

    throw new Error("限流存储未配置：请在 EdgeOne Pages 绑定 KV 变量 RATE_LIMIT_KV。");
  }

  const current = kv ? Number((await kv.get(key)) || 0) : memoryCounts.get(key) || 0;

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
      const next = current + 1;
      if (kv) {
        await kv.put(key, String(next));
      } else {
        memoryCounts.set(key, next);
      }
    }
  };
}

function getEdgeOneKV() {
  try {
    if (typeof RATE_LIMIT_KV !== "undefined") return RATE_LIMIT_KV;
  } catch {
    // Some local runtimes do not inject EdgeOne bindings.
  }

  return (globalThis as unknown as Record<string, EdgeOneKV | undefined>)[KV_BINDING_NAME];
}

async function buildRateLimitKey(request: Request, date: string) {
  const rawIp = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const fingerprint = await sha256(`${rawIp}|${userAgent}`);

  return `rl_${date.replaceAll("-", "")}_${fingerprint.slice(0, 32)}`;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ||
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

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
