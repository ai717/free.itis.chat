import type { CategoryMeta } from '../types';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'ai',
    name: 'AI 神器与模型',
    enName: 'AI & Models',
    icon: 'Sparkles',
    description: '本地大语言模型、开源生图工作流、离线转写与免费算力平台',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'adblock',
    name: '去广告与隐私',
    enName: 'Adblock & Privacy',
    icon: 'ShieldCheck',
    description: '彻底告别弹窗流氓、开箱即用 DNS 过滤、端到端开源密码库与隐私保护',
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'media',
    name: '影音媒体与流媒体',
    enName: 'Media & Streaming',
    icon: 'Film',
    description: '防吸血 BT/PT 下载、无损音乐流媒体、干净纯粹的视频播放与剪辑工具',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'software',
    name: '极客软件与系统工具',
    enName: 'Software & Tools',
    icon: 'Terminal',
    description: '全平台局域网秒传、毫秒级本地搜索、深度卸载与自建远程桌面',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'books',
    name: '电子书与学术宝库',
    enName: 'Books & Academic',
    icon: 'BookOpen',
    description: '全球影子图书馆、开源安卓阅读器、文献检索与书籍管理格式转换',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'dev',
    name: '开发者与自建利器',
    enName: 'Dev & Self-Hosted',
    icon: 'Code2',
    description: '单 VPS 搞定自动化 DevOps、轻量离线 API 调试与去追踪开源套件',
    gradient: 'from-pink-500 to-rose-600',
  },
];
