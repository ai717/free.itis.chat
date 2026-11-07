# ITIS Free 架构规范与 Agent 协作指南 (AGENTS.md)

本规范是任何接手本项目的 AI Agent（Antigravity、Claude Code、Cursor、Grok、Gemini、Muse 等）的最高行动准则。修改代码或扩展数据前必须严格遵守。

---

## 一、项目定位与核心价值观

* **站点**：[free.itis.chat](https://free.itis.chat/)
* **核心口号**：**开源！白嫖！避坑！**
* **准入黄金三门禁**：
  1. **开源或完全免费（Open-Source or 100% Free Tier）**：优先开源项目、无功能阉割的免费工具、无需绑定信用卡的白嫖服务；坚决杜绝收费陷阱。
  2. **绝对安全无公害（Clean & Safe）**：零捆绑、无恶意挖矿插件、无流氓广告跳转、无强制诱导付费。
  3. **必须指出真坑（Hard Caveats Mandatory）**：绝不写空泛的“好用/暂无/冲就完了”套话。必须讲透自建门槛、免费额度限制、硬件要求（如显存/硬盘）、闭源依赖或潜在风险。

---

## 二、架构与技术栈

* **框架**：[Astro 5.x](https://astro.build/) (全静态 SSG 模式，26 个独立预渲染页面)
* **样式**：Tailwind CSS + 原生响应式暗色/亮色自适应主题
* **数据存储**：`src/content/resources/<category>.json`（24 个独立类目，收录 15,700+ 项目）
* **国际化**：全量字段中英双轨存储（中文：`description`、`warningText`、`tags`；英文：`descriptionEn`、`warningTextEn`、`tagsEn`）
* **部署平台**：GitHub Pages 自动化构建流水线 (`.github/workflows/deploy.yml`)

---

## 三、24 大核心分类标准目录

| 分类 Key | 中文名称 | 分类 Key | 中文名称 |
| :--- | :--- | :--- | :--- |
| `privacy` | 隐私与安全 | `audio` | 音频与音乐 |
| `ai` | 人工智能与大模型 | `video` | 视频与影视 |
| `developer-tools` | 开发者与编程工具 | `file-tools` | 文件与转换工具 |
| `image-tools` | 图像与设计工具 | `video-tools` | 视频处理与剪辑 |
| `text-tools` | 文本与写作工具 | `system-tools` | 系统与硬件增强 |
| `internet-tools` | 网络与通信工具 | `social-media-tools`| 社交与媒体工具 |
| `storage` | 存储与网盘同步 | `educational` | 教育、图书与课程 |
| `reading` | 阅读与文库 | `gaming` | 游戏与娱乐 |
| `gaming-tools` | 游戏工具与辅助 | `downloading` | 下载与抓取工具 |
| `torrenting` | BT 与磁力工具 | `mobile` | 移动应用 (Android/iOS) |
| `linux-macos` | Linux & macOS 专区 | `non-english` | 多语言与国际资源 |
| `misc` | 综合与杂项 | `other` | 其它资源 (兜底未归类) |

---

## 四、数据契约与硬门禁规则 (Data Contract)

每个存入 `src/content/resources/<category>.json` 的条目必须满足：

```json
{
  "id": "category-kebab-name",
  "name": "工具全名",
  "url": "https://官方网站或体验地址",
  "githubUrl": "https://github.com/owner/repo（若有，必须提供）",
  "description": "中文功能简介（硬性要求 ≥ 15 个汉字，讲清核心价值与免费属性）",
  "descriptionEn": "Pure English description (≥ 15 chars, STRICTLY NO CHINESE CHARACTERS)",
  "category": "上述 24 个有效分类 key 之一",
  "subcategory": "细分二级领域名称",
  "tags": ["至少2个", "中文标签"],
  "tagsEn": ["At least 2", "English tags"],
  "safeguardStatus": "verified | safe | warning | danger",
  "warningText": "真实避坑指南（硬性要求 ≥ 10 个汉字，指出硬件/API/闭源等限制，严禁套话）",
  "warningTextEn": "Genuine caveats in English (≥ 10 chars, STRICTLY NO CHINESE)",
  "platforms": ["win", "mac", "linux", "android", "ios", "web", "docker"],
  "featured": false,
  "isStarred": false,
  "isCollection": false
}
```

### 自动化质检硬门禁：
1. **反敷衍词汇黑名单**：`warningText` 严禁出现 `{"无", "暂无", "好用", "非常好用", "很好用", "推荐使用", "放心使用", "冲就完了", "必装", "纯开源", "无套路", "测试", "无坑", "很棒", "点赞"}`。
2. **纯英文隔离**：所有 `*En` 字段使用 `[\u4e00-\u9fff]` 正则扫描，命中任何汉字直接打回拒收。

---

## 五、自动化工具链与入库流水线

* **主入库与校验脚本**：`scripts/ingest.py`
  - 运行方式：`python scripts/ingest.py --file <path-to-json>` 或直接放置于 `staging/incoming/*.json` 执行。
  - 特性：自动规范化 URL（去除 UTM 跟踪参数）、全局 1.5 万条目跨分类去重、同项增量补充避坑信息。
* **本地独立巡航爬虫**：`scripts/auto_collect.py`
  - 抓取 GitHub Trending、Hacker News Show、V2EX 分享节点。
* **云端 Agent 提交接入点**：
  - 云端 Bot（如 Muse）只需调用 GitHub REST API 向本仓库发 Issue：
  - 标签必须包含：`["auto-ingest"]`；
  - 正文必须包裹在 Markdown 代码块：` ```json [ ...符合契约的数组... ] ``` `；
  - 后台 `.github/workflows/auto-ingest.yml` 会自动校验、去重合并并直接触发生产部署。
