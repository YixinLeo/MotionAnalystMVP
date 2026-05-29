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
