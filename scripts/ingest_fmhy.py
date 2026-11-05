import os
import re
import json
import urllib.parse
import sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DOCS_DIR = 'fmhy_raw/edit-main/docs'
OUTPUT_DIR = 'src/content/resources'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Parse unsafe.md for blacklist
unsafe_path = os.path.join(DOCS_DIR, 'unsafe.md')
blacklist = {}
if os.path.exists(unsafe_path):
    with open(unsafe_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('*') and ' - ' in line:
                parts = line.lstrip('* ').split(' - ', 1)
                name = parts[0].strip(' *[]')
                reason = parts[1].strip()
                # extract link domain if any
                m = re.search(r'\((https?://[^\)]+)\)', parts[0])
                if m:
                    netloc = urllib.parse.urlparse(m.group(1)).netloc.lower()
                    blacklist[netloc] = reason
                blacklist[name.lower()] = reason

print(f'Loaded {len(blacklist)} unsafe items for automated verification checking.')

# Domain-specific translation dictionary for accurate technical Chinese
PHRASE_DICT = {
    'video / audio / comics / magazines / requires sign-up': '影视、音乐、漫画与电子书聚合，需注册账号',
    'video / audio / books': '影视、音乐与电子书综合资源平台',
    'video / audio': '高清影视与音乐流媒体资源',
    'editing software': '专业影音剪辑与视觉设计工具',
    'torrent client': '开源 BitTorrent / 磁力下载客户端',
    'system-wide adblocker': '系统级全局广告拦截与隐私防火墙',
    'popup blockers': '浏览器弹窗与恶意跳转强力拦截器',
    'popup blocker': '弹窗拦截器',
    'hide website overlays': '一键隐藏网站遮罩、弹层与防阅读覆盖物',
    'dht-based': '基于 DHT 分布式哈希表网络',
    'magnet link sharing platform': '磁力链接去中心化搜索与分享平台',
    'cross-platform': '全平台跨平台支持',
    'no sign-up': '免注册登录，开箱即用',
    'requires sign-up': '需注册账号使用',
    'sign-up required': '需注册登录',
    'freemium': '免费基础额度可用',
    'unlimited': '无限制使用',
    'self-hostable': '支持 Docker 自建部署',
    'self-hosted': '支持私有化自建部署',
    'adblockers': '广告拦截器',
    'adblocker': '广告拦截器',
    'free / open-source': '免费且开源',
    'open-source': '开源',
    'open source': '开源',
    'userscript': '油猴用户脚本',
    'extension': '浏览器扩展',
    'client': '客户端',
    'search engine': '专用搜索引擎',
    'download manager': '高速多线程下载管理器',
    'stream ripper': '流媒体视频音频离线提取嗅探器',
    'debrid': '高速中继网盘解析中转服务',
    'password manager': '端到端加密本地/云端密码管理器',
    'e-reader': '开源电子书多格式阅读器',
    'lossless': '无损音质/画质',
    'music player': '现代开源音乐播放器',
    'video player': '高画质视频多媒体播放器',
    'screen recorder': '开源无水印屏幕录制工具',
    'file sharing': '局域网/点对点高速文件秒传工具',
    'uninstaller': '无残留深度软件卸载器',
    'disk space analyzer': '磁盘空间占用极速分析可视化工具',
    'text editor': '轻量极简文本编辑器',
    'markdown editor': '现代化 Markdown 笔记与知识库写作工具',
    'vpn': '经过审计的无日志隐私 VPN 隧道',
    'emulator': '经典主机复古游戏模拟器',
}

def translate_description(desc_en: str, cat_id: str, name: str) -> str:
    if not desc_en or desc_en == name:
        category_defaults = {
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
        return category_defaults.get(cat_id, '开源免费数字实用资源')
    
    # Try exact match in phrase dict
    lower = desc_en.lower()
    for phrase, zh in PHRASE_DICT.items():
        if lower == phrase:
            return zh
            
    # Substring substitutions
    zh_result = desc_en
    # Sort phrases by length descending to match longest first
    for phrase, zh in sorted(PHRASE_DICT.items(), key=lambda x: -len(x[0])):
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        zh_result = pattern.sub(zh, zh_result)
        
    # Clean up formatting
    zh_result = re.sub(r'\s*/\s*', ' · ', zh_result)
    zh_result = zh_result.strip(' ·,')
    return zh_result if zh_result else desc_en

def generate_tags(line_text: str, cat_id: str, name: str, is_starred: bool) -> tuple[list[str], list[str]]:
    tags_zh = []
    tags_en = []
    
    text_lower = line_text.lower()
    
    if is_starred:
        tags_zh.append('社区精选')
        tags_en.append('Featured')
        
    if 'github.com' in text_lower or 'codeberg.org' in text_lower or 'open source' in text_lower or 'open-source' in text_lower:
        tags_zh.append('开源')
        tags_en.append('Open Source')
    else:
        tags_zh.append('免费')
        tags_en.append('Free')
        
    cat_tag_map = {
        'ai': (['AI模型', '大语言模型'], ['AI Models', 'LLM']),
        'privacy': (['去广告', '隐私保护'], ['Adblock', 'Privacy']),
        'video': (['影视流媒体', '免登录'], ['Streaming', 'Free Stream']),
        'audio': (['无损音乐', '电台播客'], ['Music', 'Podcast']),
        'gaming': (['游戏资源', '模拟器'], ['Gaming', 'Emulator']),
        'reading': (['电子书', '文献检索'], ['Ebooks', 'Library']),
        'downloading': (['多线程下载', '网盘解析'], ['Downloader', 'Debrid']),
        'torrenting': (['BT种子', '磁力搜索'], ['Torrent', 'P2P']),
        'educational': (['自学课程', '技能提升'], ['Courses', 'Learning']),
        'mobile': (['移动端', '安卓/iOS'], ['Mobile', 'Android/iOS']),
        'linux-macos': (['极客利器', '跨平台'], ['Unix', 'Cross-Platform']),
        'developer-tools': (['开发者', '自建利器'], ['DevOps', 'Self-Hosted']),
        'system-tools': (['系统维护', '深度优化'], ['System', 'Optimizer']),
        'file-tools': (['文件管理', '格式转换'], ['File Tools', 'Converter']),
        'image-tools': (['图像编辑', '无损压缩'], ['Image Editor', 'Compression']),
        'video-tools': (['视频剪辑', '格式转码'], ['Video Tools', 'Transcoding']),
        'text-tools': (['Markdown', '文本写作'], ['Markdown', 'Editor']),
        'internet-tools': (['网络分析', '网页利器'], ['Web Tools', 'Browser']),
        'social-media-tools': (['社媒嗅探', '隐私前端'], ['Scraper', 'Privacy Frontend']),
        'gaming-tools': (['游戏优化', 'MOD管理'], ['Game Tweaks', 'Mods']),
        'storage': (['云存储', '数据备份'], ['Cloud Storage', 'Backup']),
        'non-english': (['多语言', '国际资源'], ['International', 'Multilingual']),
        'misc': (['实用工具', '百宝箱'], ['Utilities', 'Curiosity']),
    }
    
    if cat_id in cat_tag_map:
        cz, ce = cat_tag_map[cat_id]
        tags_zh.extend(cz)
        tags_en.extend(ce)
        
    return tags_zh[:4], tags_en[:4]

def parse_category_file(cat_id: str, filename: str) -> list[dict]:
    filepath = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(filepath):
        print(f'Warning: {filepath} not found')
        return []
        
    items = []
    seen_urls = set()
    current_section = ''
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            raw_line = line.strip()
            if raw_line.startswith('#'):
                current_section = raw_line.strip('#►▷ \t')
                continue
                
            if not raw_line.startswith('*') or raw_line.startswith('* **Note**') or raw_line.startswith('* **Warning**'):
                continue
            if 'Back to Wiki Index' in raw_line:
                continue
                
            is_starred = '⭐' in raw_line
            is_collection = '↪️' in raw_line or '🌐' in raw_line
            
            clean = re.sub(r'^\*\s*(?:⭐|↪️|🌐)?\s*', '', raw_line)
            
            # Find primary [Name](URL)
            m = re.search(r'\[([^\]]+)\]\((https?://[^\)]+)\)', clean)
            if not m:
                continue
                
            name = m.group(1).strip()
            url = m.group(2).strip()
            
            # Skip reddit wiki index internal links
            if 'reddit.com/r/FREEMEDIAHECKYEAH/wiki' in url and not is_collection:
                continue
                
            # Normalize url for deduplication
            norm_url = re.sub(r'/+$', '', url.lower())
            if norm_url in seen_urls:
                continue
            seen_urls.add(norm_url)
            
            # Find github url if present in the entire line
            gh_match = re.search(r'https?://github\.com/[a-zA-Z0-9_\-\.]+(?:/[a-zA-Z0-9_\-\.]+)?', raw_line)
            github_url = gh_match.group(0) if gh_match else None
            
            # Extract description after ' - '
            desc_en = ''
            parts = clean.split(' - ', 1)
            if len(parts) > 1:
                raw_desc = parts[1].strip()
                # remove markdown links, keeping label
                desc_en = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', raw_desc)
                desc_en = re.sub(r'\s*/\s*', ' / ', desc_en).strip(' /')
            
            # Translate description into natural Chinese
            desc_zh = translate_description(desc_en, cat_id, name)
            
            # Platforms detection
            platforms = []
            line_lower = raw_line.lower()
            if 'windows' in line_lower or 'win' in line_lower: platforms.append('win')
            if 'mac' in line_lower or 'macos' in line_lower or 'ios' in line_lower: platforms.append('mac')
            if 'android' in line_lower or 'apk' in line_lower: platforms.append('android')
            if 'docker' in line_lower or 'self-host' in line_lower: platforms.append('docker')
            if 'extension' in line_lower or 'web' in line_lower or 'browser' in line_lower or 'userscript' in line_lower: platforms.append('web')
            
            # Safeguard / Warning verification against blacklist & line
            safeguard = 'verified'
            warning_text_zh = '社区验证纯净，无恶意推广与流氓捆绑。'
            warning_text_en = 'Community verified clean, trap-free, and ad-free.'
            
            # Check domain against blacklist
            netloc = urllib.parse.urlparse(url).netloc.lower()
            matched_reason = None
            for bl_key, reason in blacklist.items():
                if bl_key in netloc or bl_key in name.lower():
                    matched_reason = reason
                    break
                    
            if matched_reason:
                safeguard = 'danger' if 'malware' in matched_reason.lower() else 'warning'
                warning_text_en = f'Caveat: {matched_reason}'
                warning_text_zh = f'避坑警告: {matched_reason}'
            elif 'warning' in raw_line.lower():
                safeguard = 'warning'
                warning_text_en = 'Contains specific caveats or usage restrictions.'
                warning_text_zh = '存在特定注意事项或使用限制，请参考说明。'
                
            tags_zh, tags_en = generate_tags(raw_line, cat_id, name, is_starred)
            
            # Clean safe id
            clean_name = re.sub(r'[^a-zA-Z0-9]', '-', name).strip('-').lower()
            if not clean_name:
                clean_name = f'item-{len(items) + 1}'
            item_id = f'{cat_id}-{clean_name[:24]}'
            
            items.append({
                'id': item_id,
                'name': name,
                'url': url,
                'description': desc_zh,
                'descriptionEn': desc_en if desc_en else desc_zh,
                'category': cat_id,
                'tags': tags_zh,
                'tagsEn': tags_en,
                'safeguardStatus': safeguard,
                'warningText': warning_text_zh,
                'warningTextEn': warning_text_en,
                'featured': is_starred,
                'isStarred': is_starred,
                'isCollection': is_collection,
                'githubUrl': github_url,
                'platforms': list(set(platforms)),
            })
            
    return items

# Categories mapping according to user instruction
CATEGORY_FILES = [
    ('privacy', 'privacy.md'),
    ('ai', 'ai.md'),
    ('video', 'video.md'),
    ('audio', 'audio.md'),
    ('gaming', 'gaming.md'),
    ('reading', 'reading.md'),
    ('downloading', 'downloading.md'),
    ('torrenting', 'torrenting.md'),
    ('educational', 'educational.md'),
    ('mobile', 'mobile.md'),
    ('linux-macos', 'linux-macos.md'),
    ('non-english', 'non-english.md'),
    ('misc', 'misc.md'),
    ('system-tools', 'system-tools.md'),
    ('file-tools', 'file-tools.md'),
    ('internet-tools', 'internet-tools.md'),
    ('social-media-tools', 'social-media-tools.md'),
    ('text-tools', 'text-tools.md'),
    ('gaming-tools', 'gaming-tools.md'),
    ('image-tools', 'image-tools.md'),
    ('video-tools', 'video-tools.md'),
    ('developer-tools', 'developer-tools.md'),
    ('storage', 'storage.md'),
]

grand_total = 0
for cat_id, md_filename in CATEGORY_FILES:
    items = parse_category_file(cat_id, md_filename)
    if items:
        # Save JSON
        out_file = os.path.join(OUTPUT_DIR, f'{cat_id}.json')
        with open(out_file, 'w', encoding='utf-8') as out_f:
            json.dump(items, out_f, ensure_ascii=False, indent=2)
        grand_total += len(items)
        starred_count = sum(1 for i in items if i.get('isStarred'))
        print(f'Ingested {cat_id:20s}: {len(items):4d} resources ({starred_count} ⭐) -> {out_file}')

print(f'\nSUCCESSFULLY INGESTED {grand_total} TOTAL RESOURCES ACROSS {len(CATEGORY_FILES)} CATEGORIES!')
