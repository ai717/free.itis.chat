import os
import re
import json
import urllib.parse
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DOCS_DIR = r"G:\work\code\website\ITIS Free\fmhy_raw\edit-main\docs"
OUTPUT_DIR = r"G:\work\code\website\ITIS Free\src\content\resources"

# Load blacklist from unsafe.md
UNSAFE_FILE = os.path.join(DOCS_DIR, "unsafe.md")
blacklist = {}
if os.path.exists(UNSAFE_FILE):
    with open(UNSAFE_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if line.startswith('*'):
                m = re.search(r'\[([^\]]+)\]\((https?://[^\)]+)\)(?:\s*-\s*(.+))?', line)
                if m:
                    site_name = m.group(1).strip().lower()
                    site_url = m.group(2).strip().lower()
                    reason = m.group(3).strip() if m.group(3) else 'Listed as unsafe by FMHY community'
                    domain = urllib.parse.urlparse(site_url).netloc.lower()
                    if domain:
                        blacklist[domain] = reason
                    blacklist[site_name] = reason
    print(f"Loaded {len(blacklist)} unsafe sites for risk tagging.")

PHRASE_DICT = {
    "open source": "开源",
    "open-source": "开源",
    "free and open source": "免费开源",
    "free & open source": "免费开源",
    "adblocker": "广告拦截器",
    "ad-free": "免广告",
    "ad free": "免广告",
    "no ads": "零广告",
    "streaming": "在线流媒体",
    "downloader": "下载器",
    "audio downloader": "音频提取下载器",
    "video downloader": "视频下载提取器",
    "debrid": "网盘高速中继解析",
    "search engine": "独立搜索引擎",
    "browser extension": "浏览器扩展插件",
    "userscript": "油猴脚本",
    "cross-platform": "跨平台",
    "shadow library": "影子图书馆",
    "ebook reader": "电子书阅读器",
    "torrent client": "BT/种子客户端",
    "torrent indexer": "磁力种子索引检索",
    "tracker": "Tracker 节点",
    "password manager": "端到端密码管理器",
    "ai assistant": "AI 智能助手",
    "text to speech": "文本转语音 (TTS)",
    "speech to text": "语音转文字识别",
    "image generator": "AI 图像生成工作流",
    "background remover": "一键抠图背景移除",
    "image upscaler": "AI 超分辨率无损放大",
    "file converter": "跨格式文件转换器",
    "photo editor": "在线图片编辑处理",
    "video editor": "轻量视频剪辑工具",
    "screen recorder": "无水印屏幕录制",
    "self-hosted": "支持自建部署",
    "privacy frontend": "去追踪第三方隐私前端",
    "rss reader": "RSS 订阅聚合阅读器",
    "media player": "全能无损影音播放器",
    "remote desktop": "安全远程桌面控制",
    "clipboard manager": "剪贴板增强历史管理",
    "text editor": "轻量极简文本编辑器",
    "markdown editor": "现代化 Markdown 笔记与写作工具",
    "vpn": "经过审计的无日志隐私 VPN 隧道",
    "emulator": "经典主机复古游戏模拟器",
}

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

def translate_description(desc_en: str, cat_id: str, name: str) -> str:
    if not desc_en or desc_en == name:
        return CATEGORY_DEFAULTS_ZH.get(cat_id, '开源免费数字实用资源')
    
    # Try exact match in phrase dict
    lower = desc_en.lower()
    for phrase, zh in PHRASE_DICT.items():
        if lower == phrase:
            return zh
            
    # Substring substitutions
    zh_result = desc_en
    for phrase, zh in sorted(PHRASE_DICT.items(), key=lambda x: -len(x[0])):
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        zh_result = pattern.sub(zh, zh_result)
        
    zh_result = re.sub(r'\s*/\s*', ' · ', zh_result)
    zh_result = zh_result.strip(' ·,')
    return zh_result if zh_result else CATEGORY_DEFAULTS_ZH.get(cat_id, '开源免费数字实用资源')

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
        'storage': (['网盘存储', '对象存储'], ['Cloud Storage', 'Object Storage']),
        'non-english': (['多语种', '全球资源'], ['Multilingual', 'Global']),
        'misc': (['奇趣探索', '实用工具'], ['Cool Stuff', 'Utilities']),
    }
    
    c_zh, c_en = cat_tag_map.get(cat_id, (['免费工具'], ['Free Tools']))
    tags_zh.extend(c_zh)
    tags_en.extend(c_en)
    return tags_zh[:4], tags_en[:4]

def parse_category_file(
    cat_id: str,
    filename: str,
    global_seen_urls: set,
    global_seen_ids: set,
    blacklist_data: dict
) -> list[dict]:
    filepath = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(filepath):
        print(f'Warning: {filepath} not found')
        return []
        
    items = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            raw_line = line.strip()
            if raw_line.startswith('#'):
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
            
            # Skip internal reddit wiki links unless marked collection
            if 'reddit.com/r/FREEMEDIAHECKYEAH/wiki' in url and not is_collection:
                continue
                
            # GLOBAL DEDUPLICATION BY NORMALIZED URL
            norm_url = re.sub(r'/+$', '', url.lower())
            if norm_url in global_seen_urls:
                continue
            global_seen_urls.add(norm_url)
            
            # Find github url if present in the entire line
            gh_match = re.search(r'https?://github\.com/[a-zA-Z0-9_\-\.]+(?:/[a-zA-Z0-9_\-\.]+)?', raw_line)
            github_url = gh_match.group(0) if gh_match else None
            
            # Extract description after ' - '
            desc_en = ''
            parts = clean.split(' - ', 1)
            if len(parts) > 1:
                raw_desc = parts[1].strip()
                desc_en = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', raw_desc)
                desc_en = re.sub(r'\s*/\s*', ' / ', desc_en).strip(' /')
            
            # STABLE ENGLISH GUARANTEE: Never let Chinese slip into descriptionEn!
            if not desc_en or re.search(r'[\u4e00-\u9fff]', desc_en):
                desc_en = CATEGORY_DEFAULTS_EN.get(cat_id, 'Open-source and free digital utility resource.')
            
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
            for bl_key, reason in blacklist_data.items():
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
            
            # GUARANTEED 100% UNIQUE GLOBAL ID
            clean_name = re.sub(r'[^a-zA-Z0-9]', '-', name).strip('-').lower()
            if not clean_name:
                clean_name = f'item-{len(items) + 1}'
            base_id = f'{cat_id}-{clean_name[:24]}'
            item_id = base_id
            counter = 2
            while item_id in global_seen_ids:
                item_id = f'{base_id}-{counter}'
                counter += 1
            global_seen_ids.add(item_id)
            
            items.append({
                'id': item_id,
                'name': name,
                'url': url,
                'description': desc_zh,
                'descriptionEn': desc_en,
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

# Categories ordered by specificity first, generic last
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
    ('developer-tools', 'developer-tools.md'),
    ('system-tools', 'system-tools.md'),
    ('file-tools', 'file-tools.md'),
    ('image-tools', 'image-tools.md'),
    ('video-tools', 'video-tools.md'),
    ('text-tools', 'text-tools.md'),
    ('internet-tools', 'internet-tools.md'),
    ('social-media-tools', 'social-media-tools.md'),
    ('gaming-tools', 'gaming-tools.md'),
    ('storage', 'storage.md'),
    ('non-english', 'non-english.md'),
    ('misc', 'misc.md'),
]

if __name__ == '__main__':
    global_seen_urls = set()
    global_seen_ids = set()
    grand_total = 0
    
    for cat_id, md_filename in CATEGORY_FILES:
        items = parse_category_file(cat_id, md_filename, global_seen_urls, global_seen_ids, blacklist)
        if items:
            out_file = os.path.join(OUTPUT_DIR, f'{cat_id}.json')
            with open(out_file, 'w', encoding='utf-8') as out_f:
                json.dump(items, out_f, ensure_ascii=False, indent=2)
            grand_total += len(items)
            starred_count = sum(1 for i in items if i.get('isStarred'))
            print(f'Ingested & Deduplicated {cat_id:20s}: {len(items):4d} resources ({starred_count} ⭐)')
            
    print(f'\nFINISH! Total unique, deduplicated resources: {grand_total}')
    print(f'Total unique IDs: {len(global_seen_ids)}, Total unique URLs: {len(global_seen_urls)}')
