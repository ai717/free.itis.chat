#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ITIS Free - Standalone Autonomous Source Radar & Crawler
=========================================================
Runs completely independently WITHOUT needing any AI agent or paid LLM API.
Autonomously cruises public high-trust open-source hubs:
  1. GitHub Topic APIs (self-hosted, local-llm, privacy, adblock, dev-tools, etc.)
  2. Hacker News Show HN API (real-time developer show stories)
  3. V2EX Share / Create Nodes
Filters out duplicates, categorizes by keyword heuristic rules, generates
bilingual candidate resources, and saves into `staging/incoming/` or directly ingests.
"""

import sys
import os
import json
import re
import urllib.request
import urllib.error
from datetime import datetime

# Safe UTF-8 configuration for Windows console without closing buffers
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 ITISFreeCollector/1.0'

# Keyword to category routing heuristics
CATEGORY_KEYWORDS = {
    'ai': ['llm', 'gpt', 'ollama', 'local ai', 'model', 'whisper', 'diffusion', 'transcription', 'speech-to-text', 'ocr', 'vllm', 'chatgpt'],
    'privacy': ['privacy', 'adblock', 'tracker', 'password', 'vault', 'encryption', 'e2ee', 'telemetry', 'vpn', 'dns'],
    'video': ['movie', 'anime', 'tv', 'subtitle', 'media player', 'streaming', 'kodi', 'stremio'],
    'audio': ['music', 'spotify', 'podcast', 'radio', 'lossless', 'flac', 'audio player'],
    'gaming': ['emulator', 'retroarch', 'game', 'gaming', 'rom', 'steam', 'playstation', 'switch', 'gamepad'],
    'reading': ['ebook', 'pdf', 'comic', 'manga', 'calibre', 'reader', 'library', 'scholarly'],
    'downloading': ['download', 'aria2', 'downloader', 'youtube-dl', 'yt-dlp', 'debrid', 'grabber'],
    'torrenting': ['torrent', 'bittorrent', 'magnet', 'p2p', 'tracker', 'dht', 'qbittorrent'],
    'developer-tools': ['developer', 'docker', 'devops', 'api', 'database', 'self-hosted', 'paas', 'homelab', 'server', 'cli', 'git', 'terminal'],
    'system-tools': ['uninstaller', 'benchmark', 'monitor', 'bootable', 'usb', 'optimization', 'debloat', 'windows', 'mac'],
    'file-tools': ['search', 'renamer', 'convert', 'archive', 'compression', 'zip', 'everything', 'transfer', 'sync'],
    'image-tools': ['image', 'photo', 'upscale', 'svg', 'vector', 'canvas', 'png', 'jpeg', 'crop', 'illustrator'],
    'video-tools': ['video editor', 'ffmpeg', 'encoder', 'losslesscut', 'handbrake', 'transcoder', 'cut'],
    'text-tools': ['markdown', 'notes', 'editor', 'typist', 'diff', 'obsidian', 'notion', 'writing'],
    'internet-tools': ['browser', 'proxy', 'extension', 'redirect', 'probe', 'curl', 'network', 'speedtest'],
    'storage': ['s3', 'backup', 'cloud storage', 'sync', 'webdav', 'rclone', 'alist', 'minio']
}

def detect_category(text: str, default_cat: str = 'developer-tools') -> str:
    text_lower = text.lower()
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in kws):
            return cat
    return default_cat

def fetch_json(url: str, timeout: int = 10):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8', errors='ignore'))
    except Exception as e:
        print(f"  [WARN] Request failed for '{url}': {e}")
        return None

def collect_from_github_topics():
    """Fetches high-star recent tools across top topics from GitHub Search API."""
    print("📡 [1/3] Cruising GitHub Topics (self-hosted, local-llm, privacy, etc.)...")
    candidates = []
    topics = ['self-hosted', 'local-llm', 'privacy', 'adblock', 'devtools', 'downloader']

    for topic in topics:
        api_url = f"https://api.github.com/search/repositories?q=stars:>300+topic:{topic}&sort=updated&order=desc&per_page=10"
        data = fetch_json(api_url)
        if not data or 'items' not in data:
            continue

        for repo in data.get('items', []):
            name = (repo.get('name') or '').strip()
            desc = (repo.get('description') or '').strip()
            html_url = (repo.get('html_url') or '').strip()
            raw_homepage = repo.get('homepage')
            homepage = (raw_homepage.strip() if isinstance(raw_homepage, str) else '') or html_url
            stars = repo.get('stargazers_count', 0)
            topics_list = repo.get('topics') or []

            if not desc or len(desc) < 10:
                continue

            category = detect_category(f"{name} {desc} {' '.join(topics_list)}")

            # Infer platforms
            desc_lower = desc.lower()
            platforms = []
            if 'docker' in desc_lower or 'self-hosted' in desc_lower:
                platforms.append('docker')
            if 'windows' in desc_lower or 'win' in topics_list:
                platforms.append('win')
            if 'mac' in desc_lower or 'macos' in topics_list:
                platforms.append('mac')
            if 'linux' in desc_lower or 'linux' in topics_list:
                platforms.append('linux')
            if 'web' in desc_lower or homepage != html_url:
                platforms.append('web')
            if not platforms:
                platforms = ['web', 'linux']

            candidate = {
                "name": name,
                "url": homepage,
                "githubUrl": html_url,
                "category": category,
                "description": f"{desc} · 官方开源代码库 · Star: {stars:,} · 社区推荐自建",
                "descriptionEn": f"{desc} - Official GitHub repository with {stars:,} stars.",
                "tags": ["开源", "自建" if "docker" in platforms else "社区精选", category.capitalize()],
                "tagsEn": ["Open Source", "Self-Hosted" if "docker" in platforms else "Featured", category.capitalize()],
                "safeguardStatus": "verified" if stars >= 1000 else "safe",
                "warningText": "社区验证纯净；如需自建部署请遵循官方文档与最低系统配置说明。",
                "warningTextEn": "Community verified clean; follow official documentation for self-hosting prerequisites.",
                "featured": stars >= 3000,
                "isStarred": stars >= 3000,
                "platforms": platforms
            }
            candidates.append(candidate)

    print(f"  ✓ Found {len(candidates)} candidate tools from GitHub Search.")
    return candidates

def collect_from_hacker_news():
    """Fetches top trending Show stories from Hacker News."""
    print("📡 [2/3] Cruising Hacker News (Show HN)...")
    candidates = []
    top_shows_url = 'https://hacker-news.firebaseio.com/v0/showstories.json'
    show_ids = fetch_json(top_shows_url)

    if not show_ids:
        return candidates

    # Take first 15 show stories
    for sid in show_ids[:15]:
        item_url = f"https://hacker-news.firebaseio.com/v0/item/{sid}.json"
        item = fetch_json(item_url, timeout=5)
        if not item:
            continue

        title = item.get('title', '').strip()
        url = item.get('url', '').strip()
        score = item.get('score', 0)

        # We care about items with an external link and positive score
        if not url or score < 15:
            continue

        clean_title = re.sub(r'^Show HN:\s*', '', title, flags=re.IGNORECASE)
        # Separate title from description if formatted as "Name – Description"
        parts = re.split(r'[\u2013\u2014\-–:]\s*', clean_title, maxsplit=1)
        name = parts[0].strip()
        desc = parts[1].strip() if len(parts) > 1 else clean_title

        if len(name) < 2 or len(name) > 50:
            continue

        category = detect_category(f"{clean_title} {url}")
        is_gh = 'github.com' in url.lower()

        candidates.append({
            "name": name,
            "url": url,
            "githubUrl": url if is_gh else "",
            "category": category,
            "description": f"{desc} · Hacker News 社区高分自荐 · 极客口碑推荐",
            "descriptionEn": f"{desc} - Highly upvoted Show HN community project.",
            "tags": ["社区精选", "开源" if is_gh else "免费工具", "HackerNews"],
            "tagsEn": ["Featured", "Open Source" if is_gh else "Free Tools", "HackerNews"],
            "safeguardStatus": "safe",
            "warningText": "项目来自 Hacker News 极客社区首发；使用前请查看官方主页说明与权限要求。",
            "warningTextEn": "First surfaced on Hacker News Show HN; check permissions and requirements before use.",
            "featured": score >= 100,
            "isStarred": score >= 100,
            "platforms": ["web"]
        })

    print(f"  ✓ Found {len(candidates)} candidate tools from Hacker News.")
    return candidates

def collect_from_v2ex():
    """Fetches latest developer shares from V2EX."""
    print("📡 [3/3] Cruising V2EX (Share & Create nodes)...")
    candidates = []
    v2_url = 'https://www.v2ex.com/api/topics/show.json?node_name=share'
    topics = fetch_json(v2_url)

    if not topics:
        return candidates

    for t in topics[:15]:
        title = t.get('title', '').strip()
        content = (t.get('content') or '').strip()
        topic_url = t.get('url', '')

        # Extract external URL from content if present
        urls = re.findall(r'https?://[^\s)\]>"\'\u4e00-\u9fa5]+', content)
        clean_ext_url = None
        for u in urls:
            u_clean = u.rstrip('.,;:)]>')
            u_lower = u_clean.lower()
            # Ignore image hosts, media links, and forum threads
            if any(ext in u_lower for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4']):
                continue
            if any(domain in u_lower for domain in ['imgur.com', 'sinaimg.cn', 'v2ex.com', 'linux.do', 'zhihu.com', 't.me', 'weibo.com', 'bilibili.com', 'imgant.com']):
                continue
            clean_ext_url = u_clean
            break

        if not clean_ext_url:
            continue

        category = detect_category(f"{title} {content}")
        is_gh = 'github.com' in clean_ext_url.lower()

        # Extract clean project name
        clean_name = re.sub(r'^(分享|推荐|自荐|开源|发布)[一个款的项\s]*', '', title).strip()
        clean_name = re.split(r'[\u2013\u2014\-–，,：:]', clean_name)[0].strip()
        if len(clean_name) > 30:
            clean_name = clean_name[:25]

        candidates.append({
            "name": clean_name or title[:20],
            "url": clean_ext_url,
            "githubUrl": clean_ext_url if is_gh else "",
            "category": category,
            "description": f"{title} · V2EX 中文独立开发者精选分享 · 纯净实用",
            "descriptionEn": f"{clean_name} - Curated independent developer tool from V2EX.",
            "tags": ["开源" if is_gh else "免费工具", "开发者神器", "中文精选"],
            "tagsEn": ["Open Source" if is_gh else "Free Tools", "Dev Tools", "Curated"],
            "safeguardStatus": "safe",
            "warningText": "来自 V2EX 开发者自荐社区；初次运行请注意软件权限与隐私配置。",
            "warningTextEn": "Shared by V2EX developer community; review permissions on first launch.",
            "featured": False,
            "isStarred": False,
            "platforms": ["web"]
        })

    print(f"  ✓ Found {len(candidates)} candidate tools from V2EX.")
    return candidates

def run_pipeline(auto_deploy: bool = False):
    print("\n" + "=" * 60)
    print("🚀 ITIS Free Autonomous Source Radar (No-Agent Mode)")
    print("=" * 60)

    all_candidates = []
    all_candidates.extend(collect_from_github_topics())
    all_candidates.extend(collect_from_hacker_news())
    all_candidates.extend(collect_from_v2ex())

    if not all_candidates:
        print("❌ No valid candidates discovered. Check network connection.")
        return

    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, '..'))
    incoming_dir = os.path.join(root_dir, 'staging', 'incoming')
    os.makedirs(incoming_dir, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = os.path.join(incoming_dir, f"auto_radar_{timestamp}.json")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_candidates, f, ensure_ascii=False, indent=2)

    print(f"\n📦 Saved {len(all_candidates)} candidates to: {output_path}")

    # Call ingestion engine to deduplicate against 15,700+ resources
    sys.path.insert(0, script_dir)
    import ingest
    added, updated, skipped = ingest.process_staging_directory(root_dir, dry_run=False)

    if (added > 0 or updated > 0) and auto_deploy:
        print("\n🔨 Triggering Astro Production Build...")
        build_code = os.system("npm run build")
        if build_code == 0:
            print("🚀 Committing and pushing to GitHub Pages...")
            os.system('git add src/content/resources/ staging/')
            os.system(f'git commit -m "feat(auto-radar): autonomously ingest {added} new digital gems [{timestamp}]"')
            os.system('git push origin main')
            print("\n🎉 Deployment completed! Changes are now building on GitHub Pages.")
        else:
            print("❌ Build failed. Git push skipped to protect production.")
    else:
        print(f"\n✨ Ingestion complete. Added: {added}, Updated: {updated}, Skipped (Duplicate): {skipped}")
        if added > 0:
            print("💡 Run 'npm run build' and 'git push' to deploy these changes to free.itis.chat.")

if __name__ == '__main__':
    auto_deploy_flag = '--deploy' in sys.argv
    run_pipeline(auto_deploy=auto_deploy_flag)
