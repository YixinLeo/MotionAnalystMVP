# TA 到底什么意思？

一个 Next.js App Router + DeepSeek 的 MVP 潜台词解读器。

当前分支是无登录版本：关系对象和历史记录保存在当前浏览器 cookie 中，不依赖 Supabase 登录和数据库。

## 本地启动

1. 复制 `.env.example` 为 `.env.local` 并填写 `DEEPSEEK_API_KEY`
2. 安装依赖并启动：

```bash
npm install
npm run dev
```

DeepSeek API 只在服务端 `app/api/interpret/route.ts` 中调用，不会暴露到前端。

Supabase 相关文件仍保留在仓库里，方便之后切回登录版；当前 cookie 分支不需要配置 Supabase。

## EdgeOne Pages 部署

生产环境需要配置：

- `DEEPSEEK_API_KEY`：DeepSeek API Key
- `RATE_LIMIT_KV`：EdgeOne Pages KV 绑定名，用于按 IP + User-Agent 限制每天 20 次解读

限流逻辑在 `/api/interpret` 服务端执行：读取 IP 和 User-Agent，生成当天 key，超过 20 次直接返回“作者的 AI Token 快被薅秃了”，DeepSeek 调用成功后才计数 +1。清除浏览器 cookie 不会重置次数。
