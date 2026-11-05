# 🚀 ITIS Free (free.itis.chat)

> **互联网上最大的干净、无广告、社区驱动的中文数字免费资源导航。**  
> **开源！白嫖！避坑！**

[English Introduction below / 访问主站: itis.chat](https://itis.chat)

---

## 🌟 核心理念 (Core Philosophy)

1. **零商业广告**：拒绝任何流氓推广、联盟分销返利或弹出式广告。
2. **纯开源优先**：优先收录真正自由、可自建、离线可用的开源神器。
3. **安全避坑指引 (Safeguard)**：对带有套壳、轻度引流或虚假钓鱼仿冒站的资源进行红色/黄色警示，提供老司机实战避坑心得。
4. **社区去中心化共建**：不设易被攻击的私有后端数据库，全站数据依托 GitHub PR 与 Issue 模板公开透明维护。
5. **自动化健康巡检**：集成 GitHub Actions 每周自动巡检死链与前沿开源工具抓取。

---

## 🛠️ 技术选型 (Tech Stack)

- **框架**：[Astro 5](https://astro.build) (零 JS 静态极速生成)
- **样式**：[Tailwind CSS v4](https://tailwindcss.com) (现代极简黑冷调 + Bento Grid + Glassmorphism 毛玻璃)
- **动效与交互**：[React 19](https://react.dev) + [framer-motion](https://motion.dev) + [lucide-react](https://lucide.dev)
- **极速检索**：[Fuse.js](https://www.fusejs.io) 本地毫秒级全文模糊搜索 (按 `Cmd + K` / `Ctrl + K` 唤起)
- **部署**：GitHub Pages + Cloudflare Pages (已配置 CNAME: `free.itis.chat`)

---

## 📂 目录架构 (Project Structure)

```plaintext
free-itis-chat/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml             # 自动构建并部署到 GitHub Pages / free.itis.chat
│   │   └── link-checker.yml       # 每周日定时运行的死链检测巡检机器人
│   └── ISSUE_TEMPLATE/
│       └── resource_submit.md     # 普通用户提交新资源 Issue 模板
├── public/
│   ├── CNAME                      # 绑定 free.itis.chat
│   └── favicon.svg                # 极客风格品牌矢量图标
├── scripts/
│   └── check-links.mjs            # 自动化死链检测脚本
├── src/
│   ├── components/
│   │   ├── Header.astro           # 吸顶 Glassmorphism 导航与全局搜索
│   │   ├── BentoGrid.tsx          # 响应式动态 Bento 网格排版与标签筛选
│   │   ├── ResourceCard.tsx       # 弹簧发光微动、避坑 Tooltip、一键复制直达
│   │   ├── SearchModal.tsx        # Cmd+K 毫秒级全文搜索弹窗
│   │   └── SafeguardBadge.tsx     # 安全避坑状态徽章
│   ├── content/
│   │   └── resources/             # 分类资源数据源 (JSON)
│   │       ├── ai.json            # AI 工具与开源模型
│   │       ├── adblock.json       # 广告拦截与隐私加固
│   │       ├── media.json         # 影音媒体与流媒体播放下载
│   │       ├── software.json      # 极客软件与系统工具
│   │       ├── books.json         # 电子书与学术资源
│   │       └── dev.json           # 开发者自建神器
│   ├── pages/
│   │   ├── index.astro            # 首页精选大盘
│   │   └── [category].astro       # 独立分类页
│   ├── styles/
│   │   └── global.css             # Tailwind v4 全局暗黑宇宙微光样式
│   ├── content.config.ts          # Astro 5 Content Collections 配置
│   └── types.ts                   # TypeScript 类型契约
├── astro.config.mjs
└── package.json
```

---

## ⚡ 本地开发与构建 (Getting Started)

```bash
# 1. 安装依赖
npm install

# 2. 启动本地热更新开发服务 (默认端口 http://localhost:4321)
npm run dev

# 3. 生产环境静态打包测试
npm run build

# 4. 本地预览静态生成页面
npm run preview

# 5. 手动运行死链检测脚本
node scripts/check-links.mjs
```

---

## 🤝 如何提交新资源 (Contribution)

### 途径 A：轻量提交（推荐普通用户）
点击网站右上角的 **[➕ 提交新资源]** 按钮，或在 GitHub 仓库中直接基于 `resource_submit.md` 模板发起 Issue。

### 途径 B：极客 PR（推荐开发者）
1. Fork 本仓库。
2. 在 `src/content/resources/` 对应分类的 `.json` 文件末尾追加新的资源条目：
   ```json
   {
     "id": "my-tool",
     "name": "My Tool",
     "url": "https://example.com",
     "description": "一句话介绍这个神器的核心亮点",
     "category": "ai",
     "tags": ["开源", "免费"],
     "safeguardStatus": "verified",
     "warningText": "纯开源无套路。使用建议...",
     "featured": false,
     "bentoSize": "normal"
   }
   ```
3. 提交 PR，GitHub Actions 将会自动执行测试并在合并后自动部署上线！

---

## 📜 致敬与致谢

- 灵感致敬全球最大的数字资源共享倡议 [FMHY (FreeMediaHeckYeah)](https://fmhy.net)。
- 运维支持：[itis.chat](https://itis.chat)。
