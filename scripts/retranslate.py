import os
import re
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DOCS_DIR = r"G:\work\code\website\ITIS Free\fmhy_raw\edit-main\docs"
RESOURCES_DIR = r"G:\work\code\website\ITIS Free\src\content\resources"

CATEGORY_DEFAULTS_ZH = {
    'ai': '开源/免费 AI 大模型工具、推理界面与应用套件',
    'privacy': '开源隐私保护、去广告与网络安全工具',
    'video': '高品质免广告影视、动漫与流媒体聚合平台',
    'audio': '无损音乐流媒体、播客收听与电台抓取工具',
    'gaming': '经典游戏资源、复古模拟器与游戏汉化数据库',
    'reading': '影子图书馆、开源电子书阅读与文献管理神器',
    'downloading': '高速多线程下载、网盘中继与网页视频抓取利器',
    'torrenting': '去中心化种子搜索、纯净 BT 客户端与 Tracker 维护',
    'educational': '计算机科学、外语自学与名校公开课自学宝库',
    'mobile': 'Android / iOS 开源应用、去广告修改版与侧载工具',
    'linux-macos': 'Linux 与 macOS 极客必备神器与开源平替',
    'developer-tools': '单机 DevOps、轻量 PaaS、离线 API 调试与开发利器',
    'system-tools': '深度卸载、启动盘制作与系统性能维护优化套件',
    'file-tools': '磁盘毫秒搜索、文件重命名与跨格式无损转换器',
    'image-tools': '在线免安装修图、矢量插画编辑与图片无损压缩工具',
    'video-tools': '无损视频切片、FFmpeg 图形界面与格式转码工具',
    'text-tools': '双链笔记、Markdown 编辑与离线写作排版利器',
    'internet-tools': '网页去付费墙、重定向分析与浏览器高级工具',
    'social-media-tools': '社媒视频高清下载、无追踪前端与隐私镜像',
    'gaming-tools': '游戏帧率优化、手柄映射与 MOD 管理器',
    'storage': '免费对象存储、多网盘统一挂载与加密备份工具',
    'non-english': '全球多语种影视、动漫生肉熟肉与小众文化库',
    'misc': '趣味网络探索、数字生存与极客百宝箱'
}

CATEGORY_DEFAULTS_EN = {
    'ai': 'Open-source and free AI models, inference interfaces, and toolkit.',
    'privacy': 'Open-source privacy protection, adblocking, and cybersecurity tools.',
    'video': 'High-quality ad-free movies, anime, and media streaming directory.',
    'audio': 'Lossless music streaming, podcast players, and web radio indexer.',
    'gaming': 'Clean game archives, retro emulators, and translation patches.',
    'reading': 'Shadow libraries, open-source readers, and scholarly research tools.',
    'downloading': 'Fast multi-threaded downloaders, debrid leeches, and stream rippers.',
    'torrenting': 'Decentralized torrent indexers, clean P2P clients, and trackers.',
    'educational': 'Self-taught programming, languages, and open university courseware.',
    'mobile': 'Android and iOS open-source apps, clean mods, and sideload tools.',
    'linux-macos': 'Essential developer utilities and open-source alternatives for Unix.',
    'developer-tools': 'Self-hosted DevOps, lightweight PaaS, and offline API dev tools.',
    'system-tools': 'Deep uninstallers, bootable media creators, and system optimizers.',
    'file-tools': 'Instant disk search, batch renamers, and lossless file converters.',
    'image-tools': 'Web photo editors, vector graphics, and image compression tools.',
    'video-tools': 'Lossless video splitters, FFmpeg GUIs, and media transcoding tools.',
    'text-tools': 'Bilingual notes, Markdown editors, and distraction-free writing tools.',
    'internet-tools': 'Paywall bypassers, redirect analysers, and advanced browser tools.',
    'social-media-tools': 'Social video extractors, privacy frontends, and clean mirrors.',
    'gaming-tools': 'Frame rate boosters, controller mappers, and game mod managers.',
    'storage': 'Free cloud storage, multi-drive mounters, and encrypted backups.',
    'non-english': 'Multilingual media, international subtitles, and global cultural hubs.',
    'misc': 'Curated digital survival tools, geek treasures, and web oddities.'
}

EN_TO_ZH_DEFAULTS = {}
for cid, en in CATEGORY_DEFAULTS_EN.items():
    EN_TO_ZH_DEFAULTS[en.lower().strip('.')] = CATEGORY_DEFAULTS_ZH[cid]

# Segment dictionary: exact matches for phrases (lowercased)
EXACT_PHRASES = {
    # Gaming & Steam
    "download · pre-installed": "高速直链下载 · 免安装解压即玩",
    "pre-installed": "免安装解压即玩 (绿色单机版)",
    "pre-installed games": "免安装解压即玩游戏库",
    "achievements": "支持成就系统与全成就解锁",
    "launcher": "集成独立游戏启动器",
    "direct download": "高速免登录直链下载",
    "download": "高速下载",
    "torrent": "BT 磁力种子资源",
    "torrents": "BT 种子合集",

    # Audio & Listening
    "listen together · listening parties": "多人异地同步听歌 · 在线听歌房",
    "listen together": "多人异地在线同步听歌",
    "listening parties": "在线音乐同好听歌房",
    "plugin-based player": "插件化轻量影音播放器",
    "youtube music client": "YouTube Music 优质第三方客户端",
    "ad-block guide": "内置免广告配置教程",
    "ad-block guides": "去广告配置使用教程",

    # Video, Anime & Subtitles
    "movies": "电影",
    "tv shows": "电视剧",
    "tv": "电视剧",
    "anime": "动漫番剧",
    "auto-next": "自动连播下一集",
    "1080p": "1080P 高清",
    "4k": "4K 超高清",
    "720p": "720P 标清",
    "sub": "原声外挂字幕",
    "dub": "国语/译制配音",
    "status": "服务运行状态监控",

    # AI Features & Models
    "agent": "AI Agent 智能体",
    "ai agent": "AI 智能体",
    "slides": "PPT 演示生成",
    "add features": "附增值功能",
    "limits": "存在调用额度限制",
    "traffic-based": "按网络流量计费",
    "rate display": "费率实时显示",
    "think deeper": "深度思考推理模式",
    "thinking": "深度思考模型",
    "reasoning": "深度逻辑推理能力",
    "document chatbot": "文档对话与知识库问答助手",
    "note-taking": "智能笔记记录与知识整理",
    "anki export": "支持导出至 Anki 卡片",
    "prompt generator": "AI 提示词生成器",
    "jailbreaks": "越狱提示词与防护测试",
    "system prompts": "系统预设提示词库",
    "video generation model leaderboard": "全球 AI 视频生成大模型跑分天梯榜",
    "ai character video remixer + editor": "AI 角色视频混剪与重绘编辑器",
    "image gen benchmarks · leaderboards": "AI 文生图模型画质基准与天梯榜",
    "ai image resources": "AI 图像生成、提示词与画风资源库",
    "image prompt indexes": "AI 生图高质量提示词与画风索引库",
    "llm api key proxy": "大模型 API Key 聚合分发与反向代理中继",
    "language model bridge · lightweight · minimal": "大语言模型轻量极简 API 中继接口",
    "language model bridge": "大语言模型 API 兼容中继接口",
    "free llm api": "免费开放的大模型 API 调用接口",
    "offline ai models": "支持离线单机运行的 AI 模型",
    "prompt engineering": "提示词工程编写手册",
    "local ai runner": "本地大模型轻量推理面板",
    "ai creative writing tools": "AI 创意写作与小说辅助工具箱",
    "google's educational search ais": "Google 学术教育搜索 AI 套件",
    "sci-hub research chatbot": "Sci-Hub 论文检索与研读对话助手",
    "research chatbot": "学术文献智能研读与问答助手",
    "determine which ai models you can run locally": "本地电脑硬件与大模型算力匹配评估",
    "ai roleplay resources": "AI 沉浸式角色扮演资源库",
    "realistic ai voice chat": "拟真 AI 语音实时双向对话",
    "interactive human ai roleplaying": "沉浸式拟人 AI 交互角色扮演平台",

    # Reading & Books
    "books": "电子书图书",
    "ebooks": "电子书资源",
    "comics": "欧美漫画",
    "manga": "日本漫画",
    "audiobooks": "有声书与广播剧",
    "magazines": "原版期刊杂志",
    "newspapers": "全球新闻报刊",
    "multi-site book search": "跨站多源电子书聚合搜索",
    "book site index": "电子书检索与下载站点索引",
    "uptime tracking": "服务在线状态实时监测",
    "deploy locally": "支持本地离线部署",
    "mirrors": "多线路备用镜像节点",
    "extensions": "浏览器扩展插件",

    # Developer & Tech
    "cybersecurity community": "网络安全与渗透测试交流社区",
    "cybersecurity forum": "网络安全技术论坛",
    "graphics programming community": "计算机图形学与渲染开发社区",
    "functional programming community": "函数式编程开发者社区",
    "blogs for developers": "全球知名工程师与技术团队博客合辑",
    "command-line clubhouse": "极客命令行风格多人语音连麦房",
    "adobe software alternative index": "Adobe 全家桶优质免费开源平替索引",
    "multi-site software search": "跨站点多软件源综合搜索聚合",
    "turn webpages into desktop apps": "将任意网页一键打包为极轻桌面客户端",
    "check username availability": "全网主流社媒用户名占用查询",
    "removes leftover game files": "彻底清理游戏卸载残留文件与缓存",
    "speed tests": "网络与宽带上下行测速",
    "speed test": "网速测速工具",
    "global network testing": "全球网络延迟与丢包检测",
    "duplicate file finders": "重复文件查找与清理",
    "file unlocker · deleter": "文件强制解锁与粉碎删除",
    "command-line interface": "命令行交互工具 (CLI)",
    "screen sharing": "免客户端低延迟屏幕共享",
    "web-based screen sharing": "免安装网页低延迟屏幕共享",
    "linux guides · manuals": "Linux 深度指南与官方实操手册",
    "interactive linux guides": "交互式 Linux 命令行闯关学习教程",
    "all awesome lists": "GitHub Awesome 开源高分宝藏清单总览",
    "list of lists index": "全网精选极客清单与索引汇总",
}

PRE_REGEX_RULES = [
    # Full phrases first
    (r'\bRequires Sign[- ]Up\b', '需注册使用'),
    (r'\bSignup Required\b', '需注册使用'),
    (r'\bNo Sign[- ]Up\b', '免注册直接使用'),
    (r'\bNo Signup\b', '免注册直接使用'),
    (r'\bNo Sign Up\b', '免注册直接使用'),
    (r'\bWithout Sign[- ]Up\b', '免注册使用'),
    (r'\bSign[- ]Up\b', '需注册账号'),
    (r'\bSign Up\b', '需注册账号'),
    (r'\bSignup\b', '需注册账号'),
    (r'\bClear Cookies to Reset Limits\b', '清除 Cookie 可重置免费额度'),
    (r'\bUnlimited\b', '无使用额度限制'),
    (r'\bSubreddit\b', 'Reddit 讨论区'),
    (r'\bDiscord Server\b', 'Discord 社区'),
    (r'\bDiscord\b', 'Discord 社区'),
    (r'\bGitHub\b', 'GitHub 开源'),
    (r'\bGitLab\b', 'GitLab 开源'),
    (r'\bTelegram\b', 'Telegram 交流群'),
    (r'\bMatrix\b', 'Matrix 讨论组'),
    (r'\bUse Translator\b', '外语站点 (建议搭配网页翻译)'),
    (r'\bUptime Tracking\b', '服务运行状态监测'),
    (r'\bDeploy Locally\b', '支持本地离线部署'),
    (r'\bUser Ranks\b', '支持会员等级体系'),
    (r'\bAudiobooks?\b', '有声书'),
    (r'\bMagazines?\b', '期刊杂志'),
    (r'\bNewspapers?\b', '新闻报纸'),
    (r'\bMirrors?\b', '多镜像备用节点'),
    (r'\bExtensions?\b', '扩展插件'),
    (r'\bScreen Sharing\b', '低延迟屏幕共享'),
    (r'\bSystem Optimization Resources\b', '系统深度调优指南与资源'),
    (r'\bOptimization Resources\b', '系统深度调优指南与资源'),
    (r'\bOptimization\b', '深度优化调优'),
    (r'\bSelf[- ]Hosted Cloud Services\b', '支持自建私有部署的云服务'),
    (r'\bDigital Video Guides / Resources\b', '数字视频编解码全指南与资源'),
    (r'\bAdobe Software Alternative Index\b', 'Adobe 全家桶优质免费开源平替索引'),
    (r'\bMulti[- ]Site Software Search\b', '跨站点多软件源综合搜索聚合'),
    (r'\bMulti-Site Book Search\b', '跨站多源电子书聚合搜索'),
    (r'\bMulti-Site\b', '跨站多源'),
    (r'\bTurn Webpages into Desktop Apps\b', '将任意网页打包为极轻桌面客户端'),
    (r'\bCheck Username Availability\b', '全网主流社媒用户名占用查询'),
    (r'\bRemoves Leftover Game Files\b', '深度清理游戏卸载残留文件与缓存'),
    (r'\bPW:\s*`([^`]+)`', r'解压密码: \1'),
    (r'\bPW:\s*([^\s·,]+)', r'解压密码: \1'),
    (r'\bRequires Redirect Bypass\b', '需配合短链跳过插件使用'),
    (r'\bRun ([A-Za-z0-9\.\-]+) w · ([0-9]+GB RAM)\b', r'本地运行 \1 (需 \2 运行内存)'),
    (r'\b([0-9]+)\s*Daily\b', r'每日免费 \1 次'),
    (r'\bUp To ([0-9]+)\s*Daily\b', r'每日最高限额 \1 次'),
    (r'\b([0-9]+)\s*Credits Daily\b', r'每日赠送 \1 点算力额度'),
    (r'\b([0-9]+K?)\s*Tokens Daily\b', r'每日提供 \1 Token 额度'),
    (r'\b([0-9]+)\s*per chat\b', r'单次会话限 \1 条'),
    (r'\b([0-9]+GB)\s*Storage\b', r'\1 免费存储空间'),
    (r'\b([0-9]+GB)\s*Bandwidth\b', r'\1 每月流量'),
    (r'\b([0-9]+)\s*DB\b', r'\1 个免费数据库'),
    (r'\bMultiple Generators\b', '内置多种生成模型'),
    (r'\bMultiple Servers\b', '多线路备用播放节点'),
    (r'\bModel Cost Varies\b', '不同大模型消耗额度不同'),
    (r'\bReset Limits w · VPN\b', '切换网络节点可重置使用限制'),
    (r'\bWeb[- ]Based\b', '免安装网页版'),
    (r'\bCross[- ]Platform\b', '跨平台通用'),
    (r'\bAuto[- ]Next\b', '自动播放下一集'),
    (r'\b1080p\b', '1080P 高清'),
    (r'\b4k\b', '4K 超高清'),
    (r'\b720p\b', '720P 标清'),
    (r'\bFLAC\b', 'FLAC 无损音频'),
    (r'\b320kbps\b', '320Kbps 高品质'),
    (r'\bMP3\b', 'MP3 音频'),
    (r'\bPre[- ]Installed\b', '免安装解压即玩'),
    (r'\bAchievements\b', '支持成就系统'),
    (r'\bLauncher\b', '集成游戏启动器'),
    (r'\bListen Together\b', '多人异地在线同步听歌'),
    (r'\bListening Parties\b', '在线听歌房'),
    (r'\bYouTube Music Client\b', 'YouTube Music 第三方客户端'),
    (r'\bCybersecurity\b', '网络安全'),
    (r'\bProgramming\b', '编程开发'),
    (r'\bDevelopers\b', '开发者'),
    (r'\bBlogs for Developers\b', '精选开发者与工程师博客合辑'),
    (r'\bBlogs\b', '精选博客'),
    (r'\bStatus\b', '服务运行状态'),
]

WORD_MAP = {
    'guide': '指南', 'guides': '教程与指南', 'manual': '手册', 'manuals': '官方手册',
    'tutorial': '教程', 'tutorials': '系统性教程', 'cheatsheet': '速查手册', 'cheatsheets': '速查清单',
    'roadmap': '路线图', 'leaderboard': '天梯榜', 'leaderboards': '天梯榜', 'benchmark': '基准测试',
    'benchmarks': '性能跑分', 'search': '搜索检索', 'archive': '归档库', 'archives': '数字归档',
    'index': '索引目录', 'indexes': '导航索引', 'database': '资料库', 'databases': '结构化资料库',
    'manager': '管理工具', 'managers': '管理工具箱', 'optimizer': '调优优化器', 'optimizers': '优化工具',
    'viewer': '查看器', 'viewers': '在线查看器', 'converter': '转换工具', 'converters': '转换器',
    'editor': '编辑器', 'editors': '在线编辑器', 'generator': '生成器', 'generators': '生成工具',
    'client': '客户端', 'clients': '跨平台客户端', 'proxy': '代理中继', 'bridge': '中继接口',
    'suite': '全功能套件', 'toolkit': '实用工具箱', 'tools': '工具箱', 'tool': '实用小工具',
    'app': '应用程序', 'apps': '精选应用', 'software': '纯净软件', 'utilities': '实用工具',
    'utility': '实用工具', 'resources': '精选资源', 'resource': '实用资源', 'alternative': '开源平替',
    'alternatives': '优质平替', 'collection': '宝藏合辑', 'collections': '精选合辑', 'directory': '收录目录',
    'forum': '交流论坛', 'forums': '极客社区', 'community': '用户社区', 'wiki': '知识维基',
    'map': '全景地图', 'maps': '互动地图', 'server': '自建服务器', 'servers': '备用节点',
    'tracker': 'Tracker 节点', 'trackers': 'Tracker 列表', 'plugin': '扩展插件', 'plugins': '扩展插件',
    'theme': '个性主题', 'themes': '主题美化包', 'script': '自动化脚本', 'scripts': '油猴脚本',
    'preset': '预设模板', 'presets': '预设配置', 'cheat': '游戏秘籍', 'cheats': '金手指秘籍',
    'mod': '扩展模组', 'mods': 'MOD 模组', 'save': '通关存档', 'saves': '完美存档',
    'rom': '游戏 ROM', 'roms': '游戏 ROM 镜像', 'emulator': '游戏模拟器', 'emulators': '复古模拟器',
    'patch': '汉化补丁', 'patches': '补丁合辑', 'game': '单机游戏', 'games': '游戏资源',
    'gaming': '游戏与模拟器', 'video': '影视视频', 'videos': '高清视频', 'audio': '无损音频',
    'music': '音乐流媒体', 'sound': '音效素材', 'radio': '网络电台', 'podcast': '播客节目',
    'movie': '高清电影', 'movies': '电影', 'tv': '电视剧', 'anime': '动漫番剧',
    'manga': '日本漫画', 'comics': '欧美漫画', 'book': '电子书', 'books': '电子书图书',
    'paper': '学术论文', 'papers': '学术文献', 'photo': '摄影图片', 'image': '高清图像',
    'images': '图像插画', 'texture': '3D 材质', 'textures': '3D 贴图材质', 'model': '3D 资产',
    'models': '3D 资产模型', 'code': '程序源码', 'programming': '程序开发', 'coding': '编程实操',
    'learning': '自学路线', 'education': '大学公开课', 'language': '外语自学', 'languages': '多语种自学',
    'course': '精品公开课', 'courses': '名校公开课', 'news': '全球资讯', 'tech': '极客科技',
    'privacy': '隐私安全', 'security': '网络安全', 'free': '免费', 'open-source': '开源',
    'open source': '开源', 'foss': '自由开源', 'online': '在线免安装', 'web': '网页版',
    'desktop': '桌面端', 'mobile': '移动端', 'cross-platform': '跨平台', 'offline': '离线可用',
    'portable': '绿色便携版', 'lightweight': '轻量极简', 'minimal': '极简', 'fast': '高速',
    'clean': '纯净无广告', 'unlimited': '无限制', 'note': '附注意事项', 'for': '面向',
    'with': '内置', 'and': '与', 'or': '或', 'by': '由', 'in': '在', 'to': '至',
    'of': '精选', 'all': '全部', 'any': '全格式', 'format': '格式', 'formats': '多格式',
    'style': '风格', 'player': '播放器', 'players': '播放器', 'clubhouse': '多人语音连麦房',
    'functional': '函数式', 'graphics': '计算机图形学', 'cybersecurity': '网络安全',
    'monthly': '每月', 'weekly': '每周', 'daily': '每日', 'yearly': '每年', 'token': 'Token',
    'tokens': 'Token 额度', 'credits': '积分额度', 'credit': '积分', 'sometimes': '部分情况下',
    'required': '需验证', 'require': '需要', 'requires': '需要', 'login': '登录', 'phone': '手机号',
    'email': '邮箱', 'account': '账号', 'accounts': '多账号', 'open': '开源', 'source': '源码',
    'webpage': '网页', 'webpages': '网页', 'turn': '转换', 'into': '为', 'check': '检测',
    'username': '用户名', 'availability': '占用查询', 'duplicate': '重复', 'find': '查找',
    'finder': '查找器', 'finders': '查找工具', 'unlocker': '解除锁定工具', 'deleter': '粉碎清理工具',
    'system': '系统', 'systems': '文件系统', 'speed': '网速', 'tests': '测速', 'test': '测试',
    'testing': '延迟测试', 'global': '全球', 'network': '网络', 'remove': '清理', 'removes': '深度清理',
    'leftover': '卸载残留', 'files': '文件', 'file': '文件', 'arcade': '街机', 'codex': '设定集',
    'library': '资料馆', 'piracy': '资源分享', 'otaku': '御宅向二次元', 'compatibility': '兼容性',
    'engine': '开发引擎', 'soundboard': '语音按键音效', 'voice': '实时语音', 'chat': '对话聊天',
    'sharing': '实时共享', 'screen': '屏幕', 'generation': '生成', 'remixer': '动作重绘',
    'prompt': '提示词', 'prompts': '提示词库', 'key': '密钥', 'keys': 'API 密钥', 'runner': '运行推理面板',
    'creative': '创意', 'writing': '写作', 'educational': '教育自学', 'chatbot': '对话助手',
    'chatbots': '聊天机器人', 'determine': '硬件评估', 'locally': '本地离线', 'run': '本地运行',
    'roleplay': '角色扮演', 'roleplaying': '互动角色扮演', 'realistic': '拟真拟人', 'human': '拟人化',
    'interactive': '交互式', 'party': '聚会派对', 'parties': '在线连麦房', 'together': '多人同步',
    'listen': '在线听歌', 'listening': '音乐收听'
}

def clean_segment(seg: str, cat_id: str) -> str:
    s = seg.strip(' ·,/-')
    if not s:
        return ''
    lower = s.lower()
    
    if lower in EXACT_PHRASES:
        return EXACT_PHRASES[lower]
        
    res = s
    for pat, rep in PRE_REGEX_RULES:
        if re.search(pat, res, flags=re.IGNORECASE):
            res = re.sub(pat, rep, res, flags=re.IGNORECASE)
            
    # For any remaining English words, do a second word-level mapping
    def replace_word(m):
        w = m.group(0)
        wl = w.lower()
        if wl in WORD_MAP:
            return WORD_MAP[wl]
        if wl.endswith('s') and wl[:-1] in WORD_MAP:
            return WORD_MAP[wl[:-1]]
        return w
        
    res = re.sub(r'\b[a-zA-Z]+\b', replace_word, res)
    res = re.sub(r'([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])', r'\1\2', res)
    res = re.sub(r'(社区|开源|讨论组|交流群|资源|指南|教程|工具|应用|书籍|漫画|超高清)\s*\1+', r'\1', res)
    return res

def translate_full_description(desc_en: str, cat_id: str, name: str) -> str:
    if not desc_en or desc_en == name:
        return CATEGORY_DEFAULTS_ZH.get(cat_id, '开源免费数字实用资源')
        
    norm = desc_en.lower().strip('.')
    if norm in EN_TO_ZH_DEFAULTS:
        return EN_TO_ZH_DEFAULTS[norm]
        
    whole_transformed = desc_en
    for pat, rep in PRE_REGEX_RULES:
        whole_transformed = re.sub(pat, rep, whole_transformed, flags=re.IGNORECASE)
        
    chunks = re.split(r'\s*[·/;,]\s*', whole_transformed)
    translated_chunks = []
    
    for ch in chunks:
        ch_clean = ch.strip()
        if not ch_clean:
            continue
        tr = clean_segment(ch_clean, cat_id)
        if tr:
            if not translated_chunks or translated_chunks[-1] != tr:
                translated_chunks.append(tr)
                
    if not translated_chunks:
        return CATEGORY_DEFAULTS_ZH.get(cat_id, '开源免费数字实用资源')
        
    result = ' · '.join(translated_chunks)
    result = re.sub(r'(社区|开源|讨论组|交流群|资源|指南|教程|工具|应用|书籍|漫画|超高清)\s*\1+', r'\1', result)
    
    if not re.search(r'[\u4e00-\u9fa5]', result):
        cat_zh_suffix = {
            'ai': 'AI 领域专业实用工具',
            'privacy': '隐私安全与防护利器',
            'video': '影视与流媒体精选资源',
            'audio': '无损音乐与音频播放工具',
            'gaming': '经典游戏与模拟器资源',
            'reading': '图书阅读与文献资料库',
            'downloading': '高速下载与网盘解析工具',
            'torrenting': 'BT 磁力与 P2P 资源索引',
            'educational': '自学进阶与名校公开课资源',
            'mobile': '移动端开源与实用应用',
            'linux-macos': 'Linux/macOS 极客实用利器',
            'developer-tools': '开发者与运维部署实用工具',
            'system-tools': '系统维护与性能优化套件',
            'file-tools': '文件管理与格式转换工具',
            'image-tools': '图像编辑与图形设计工具',
            'video-tools': '视频剪辑与格式转码工具',
            'text-tools': '文本编辑与 Markdown 写作工具',
            'internet-tools': '网络分析与浏览器增强工具',
            'social-media-tools': '社媒视频嗅探与无广告前端',
            'gaming-tools': '游戏优化辅助与 MOD 工具',
            'storage': '云存储与备份同步利器',
            'non-english': '全球多语种影视与文化资源',
            'misc': '极客实用宝藏小工具'
        }.get(cat_id, '开源免费实用资源')
        result = f"{result} ({cat_zh_suffix})"
        
    return result

if __name__ == '__main__':
    print('Refining all 15,714 resources with high-fidelity Chinese localization...')
    total_items = 0

    for filename in os.listdir(RESOURCES_DIR):
        if not filename.endswith('.json'):
            continue
        filepath = os.path.join(RESOURCES_DIR, filename)
        cat_id = filename.replace('.json', '')
        
        with open(filepath, 'r', encoding='utf-8') as f:
            items = json.load(f)
            
        for item in items:
            desc_en = item.get('descriptionEn', '')
            name = item.get('name', '')
            
            zh_desc = translate_full_description(desc_en, cat_id, name)
            item['description'] = zh_desc
            
            w_zh = item.get('warningText', '')
            if 'Listed as unsafe by FMHY community' in w_zh or 'Listed as unsafe' in w_zh:
                item['warningText'] = '避坑警告: 经社区安全审计标记为存在风险/流氓广告/捆绑安装，请谨慎防范！'
                
            total_items += 1
            
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(items, f, ensure_ascii=False, indent=2)

    print(f'Localization complete on all {total_items} items.')
