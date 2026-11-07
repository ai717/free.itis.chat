# ITIS Free 项目开发与演进日志 (PROJECT_LOG.md)

本文档记录 [free.itis.chat](https://free.itis.chat/) 的工程迭代、自动化流水线演进、数据架构重构及重要问题复盘。保持精炼、高信息密度，杜绝废话以节省上下文 Token。

---

## 2026-11-07 迭代：Agent 自动化生态扩展、质检门禁重构与部署稳定性治理

### 1. 本次完成内容
* **全域 AI Agent 独立技能包 (`itis-free`) 创建与同步**：
  - 在 `C:\Users\everg\.agents\skills\itis-free\` 构建标准技能包，支持 Antigravity、Claude Code、Grok、Gemini 与 Muse/豆包等本地与云端 Agent 自主巡航采集。
  - 配套标准 JSON Schema、24 大分类路由表、信源雷达（`sources.md`）、策展准入规则（`curation-rules.md`）及双语输入示例。
* **第 24 大核心类目“其它资源 (`other`)”全站打通**：
  - 扩展分类枚举 `other`，配套 `MoreHorizontal` 图标、渐变样式、数据文件与静态页面路由。
  - 目录组件与 TOC 支持动态分类计数（全网 24 分类、26 个静态页面渲染）。
* **自动化入库管道与质量门禁（Anti-Boilerplate）重构**：
  - 采纳并吸收 Muse 反馈，统一脚本名为标准 `scripts/ingest.py`（保留 `validate-and-ingest.py` 镜像兜底）。
  - **彻底废除自动填充通用套话的宽松兜底**：设立 `LAZY_WARNING_SNIPPETS` 敷衍黑名单，硬性要求中文描述 ≥ 15 字、中文避坑 ≥ 10 字，英文纯净无汉字，强制 Agent 深入 README 提炼真坑。
  - 优化跨分类重名去重策略，避免同名不同类目（如 `Horizon`）产生误判覆盖。
* **云端代理双通机制与 GitHub Actions 自动接入**：
  - 部署 `.github/workflows/auto-ingest.yml`，支持云端 Bot（如 Muse）通过 GitHub Issue API 触发全自动去重入库与部署。
  - 修复 GitHub Pages 部署流由于 `cancel-in-progress: true` 引发的 CDN 同步幽灵死锁问题，改回 `cancel-in-progress: false` 并加设 5 分钟超时防护。
* **实跑数据质检与首批 Muse 采集入库**：
  - 对 Muse 产出的 `d:\Newdown\itis-free-2026-11-07.json` 进行全量审计，6 条项目 100% 达标通过硬核质检门禁。
  - 正式入库：3 个全新高价值开源项目入库（`Word Atlas`、`Rembrandt`、`Horizon`），3 个已存在项目（`T3 Code`、`Filee`、`colibri`）更新为实测级避坑数据。

### 2. 修改与创建的文件列表
* **核心配置与页面**：
  - `src/data/categories.ts`：增加第 24 个分类 `other` 定义与图标映射。
  - `src/content/resources/other.json`：新建其它类目初始资源集。
  - `src/components/icons/CategoryIcon.astro`：新增 `other` 图标渲染。
  - `src/components/TableOfContents.astro`：分类计数与文本动态化。
* **工程脚本与自动化**：
  - `scripts/ingest.py`：主入库引擎（反套话硬门禁、双语清洗、多维去重与增量更新）。
  - `scripts/auto_collect.py`：本地独立自动爬虫（GitHub Trending/Hacker News/V2EX 抓取）。
  - `一键入库并上线.bat`：本地一键入库自动化运行脚本。
  - `一键全自动巡航采集并发布.bat`：本地全自动巡航爬取并一键发布脚本。
  - `.github/workflows/auto-ingest.yml`：云端 Issue 自动化入库部署工作流。
  - `.github/workflows/deploy.yml`：修正 Pages 部署并发锁与超时保护。
* **Skill 技能包**：
  - `C:\Users\everg\.agents\skills\itis-free\SKILL.md`
  - `C:\Users\everg\.agents\skills\itis-free\references/sources.md`
  - `C:\Users\everg\.agents\skills\itis-free\references/curation-rules.md`
  - `C:\Users\everg\.agents\skills\itis-free\references/schema.json`
  - `C:\Users\everg\.agents\skills\itis-free\examples/sample-ingest.json`
  - `C:\Users\everg\.agents\skills\itis-free\scripts/ingest.py`
  - `C:\Users\everg\.agents\skills\itis-free\scripts/auto_collect.py`

### 3. 关键实现方式
* **三维去重索引 (`load_all_existing_resources`)**：
  在内存中基于 `src/content/resources/*.json` 建立 `URL 规范化索引`、`GitHub 仓库正则索引` 与 `同分类名称索引`。若 URL 或 GitHub 相同则触发字段增强更新（如强化避坑文本、标记加星等），若完全不存在则直接追加写入。
* **硬门禁抗抗性验证 (`validate_item`)**：
  通过正则与长度检查强制中英文严格分离；拒绝“无/好用/暂无/纯开源”等 14 类敷衍词汇，必须包含真实限制说明。

### 4. 遇到的问题与解决方案
* **GitHub Pages 部署频繁 `syncing_files` 超时**：
  - *原因*：使用 `cancel-in-progress: true` 时，取消前置构建导致 GitHub 后台 Pages CDN 分发服务产生未释放的幽灵死锁。
  - *解决*：根据 GitHub 官方最佳实践，在 `group: "pages"` 部署流中设置 `cancel-in-progress: false` 顺序排队，并在部署 job 增加 `timeout-minutes: 5`。
* **跨分类重名误判**：
  - *原因*：`image-tools` 下已有切图工具 `Horizon`，导致 `ai` 下的全新抓取工具 `Thysrael/Horizon` 误判为更新。
  - *解决*：名称去重限定为 `exist_cat == item['category']`，跨分类仅以规范化 URL / GitHub URL 为准。
