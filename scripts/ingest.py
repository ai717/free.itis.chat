#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ITIS Free - Automated Resource Ingestion Engine
================================================
Reads candidate resource JSON from `staging/incoming/*.json` or command line,
performs schema validation, normalizes URLs, deduplicates against all existing
15,000+ items across 23 categories, merges new resources into `src/content/resources/<category>.json`,
and archives processed files.
"""

import sys
import os
import json
import re
import argparse
from datetime import datetime
from urllib.parse import urlparse, urlunparse

# Safe UTF-8 configuration for Windows console without closing buffers
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

VALID_CATEGORIES = {
    'privacy', 'ai', 'video', 'audio', 'gaming', 'reading',
    'downloading', 'torrenting', 'educational', 'mobile', 'linux-macos',
    'developer-tools', 'system-tools', 'file-tools', 'image-tools',
    'video-tools', 'text-tools', 'internet-tools', 'social-media-tools',
    'gaming-tools', 'storage', 'non-english', 'misc', 'other'
}

VALID_PLATFORMS = {'win', 'mac', 'linux', 'android', 'ios', 'web', 'docker'}
VALID_SAFEGUARD = {'verified', 'safe', 'warning', 'danger'}

def normalize_url(raw_url: str) -> str:
    """Normalize URL by stripping query tracking, default ports, trailing slash, lowercasing domain."""
    if not raw_url:
        return ''
    try:
        p = urlparse(raw_url.strip())
        netloc = p.netloc.lower()
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        path = p.path.rstrip('/')
        # Drop UTM and common tracking parameters
        clean_query = ''
        if p.query:
            params = [
                q for q in p.query.split('&')
                if not any(q.lower().startswith(prefix) for prefix in ('utm_', 'ref=', 'source=', 'fbclid=', 'gclid='))
            ]
            clean_query = '&'.join(params)
        return urlunparse((p.scheme.lower() or 'https', netloc, path, '', clean_query, ''))
    except Exception:
        return raw_url.strip().lower().rstrip('/')

def to_kebab(s: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', s).strip()
    s = re.sub(r'[\s_]+', '-', s)
    return s.lower() or 'item'

def load_all_existing_resources(resources_dir: str):
    """Loads all existing category files and indexes by normalized URL, github URL, and lowercase name."""
    url_index = {}
    github_index = {}
    name_index = {}
    category_data = {}

    for cat in VALID_CATEGORIES:
        file_path = os.path.join(resources_dir, f"{cat}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    items = json.load(f)
            except Exception as e:
                print(f"[WARN] Error reading {file_path}: {e}")
                items = []
        else:
            items = []

        category_data[cat] = items
        for item in items:
            item_url = normalize_url(item.get('url', ''))
            if item_url:
                url_index[item_url] = (cat, item)

            gh = normalize_url(item.get('githubUrl', ''))
            if gh:
                github_index[gh] = (cat, item)

            name = item.get('name', '').strip().lower()
            if name:
                name_index[name] = (cat, item)

    return category_data, url_index, github_index, name_index

TAG_TRANSLATIONS = {
    '开源': 'Open Source',
    '自建': 'Self-Hosted',
    '社区精选': 'Featured',
    '隐私': 'Privacy',
    '去广告': 'Adblock',
    '跨平台': 'Cross-Platform',
    '本地大模型': 'Local LLM',
    'AI模型': 'AI Models',
    '大语言模型': 'LLM',
    '密码管理': 'Password Manager',
    '端到端加密': 'E2EE',
    '下载工具': 'Downloader',
    '网盘解析': 'Debrid & Cloud',
    '种子磁力': 'Torrent & P2P',
    '流媒体': 'Streaming',
    '影视播放': 'Video Player',
    '无损音乐': 'Lossless Audio',
    '电台播客': 'Radio & Podcast',
    '电子书': 'Ebooks',
    '文献学术': 'Scholarly',
    '游戏模拟器': 'Emulators',
    '开发者神器': 'Dev Tools',
    '系统优化': 'System Utilities',
    '文件管理': 'File Manager',
    '图像编辑': 'Image Tools',
    '视频剪辑': 'Video Editor',
    '笔记工具': 'Note-Taking',
    '浏览器插件': 'Browser Extension',
    '对象存储': 'Cloud Storage',
    '自学教程': 'Self-Taught & Courses',
    '多语言': 'Multilingual',
    '数字百宝箱': 'Web Utilities',
    '免费工具': 'Free Tools',
    '免费API': 'Free API',
    '免费算力': 'Free Compute'
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
    'misc': '趣味网络探索、数字生存与极客百宝箱',
    'other': '未归类数字宝藏、新兴跨界工具与独立实用资源汇总'
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
    'misc': 'Curated internet utilities, oddities, and digital gems.',
    'other': 'Uncategorized digital gems, emerging hybrid utilities, and standalone tools.'
}

LAZY_WARNING_SNIPPETS = {
    '无', '暂无', '好用', '非常好用', '很好用', '推荐使用', '放心使用',
    '冲就完了', '必装', '纯开源', '无套路', '测试', '无坑', '很棒', '点赞'
}

def has_chinese(text: str) -> bool:
    return bool(re.search(r'[\u4e00-\u9fff]', text or ''))

def validate_item(item: dict, index_in_batch: int) -> tuple[bool, str]:
    """Validates required fields, category, and formats with strict quality gates (rejects lazy boilerplate)."""
    name = item.get('name', '').strip()
    if not name:
        return False, f"Item #{index_in_batch}: 'name' is required"

    url = item.get('url', '').strip()
    if not url or not (url.startswith('http://') or url.startswith('https://')):
        return False, f"Item '{name}': valid 'url' (http/https) is required"

    category = item.get('category', '').strip().lower()
    if category not in VALID_CATEGORIES:
        return False, f"Item '{name}': invalid category '{category}'. Must be one of: {sorted(list(VALID_CATEGORIES))}"

    desc = item.get('description', '').strip()
    desc_en = item.get('descriptionEn', '').strip()

    # Strict Description Validation (Anti-Boilerplate)
    if not desc or len(desc) < 15:
        return False, f"Item '{name}': 'description' is missing or too short ({len(desc)} chars). Must be at least 15 Chinese characters highlighting utility and free tier points."

    if not has_chinese(desc):
        return False, f"Item '{name}': 'description' must be in Chinese and contain Chinese characters."

    if not desc_en or len(desc_en) < 15:
        return False, f"Item '{name}': 'descriptionEn' is missing or too short ({len(desc_en)} chars). Must be at least 15 English characters."

    if has_chinese(desc_en):
        return False, f"Item '{name}': 'descriptionEn' contains Chinese characters. Must be pure English."

    item['description'] = desc
    item['descriptionEn'] = desc_en

    # Safeguard status validation
    status = item.get('safeguardStatus', 'verified')
    if status not in VALID_SAFEGUARD:
        item['safeguardStatus'] = 'verified'

    # Strict Warning / Caveat Validation (Anti-Boilerplate)
    w_zh = item.get('warningText', '').strip()
    w_en = item.get('warningTextEn', '').strip()

    if not w_zh or len(w_zh) < 10 or w_zh in LAZY_WARNING_SNIPPETS:
        return False, f"Item '{name}': 'warningText' is missing, lazy boilerplate ('{w_zh}'), or too short. Must describe genuine caveats, limitations, or configurations in at least 10 Chinese characters."

    if not has_chinese(w_zh):
        return False, f"Item '{name}': 'warningText' must contain Chinese characters."

    if not w_en or len(w_en) < 10:
        return False, f"Item '{name}': 'warningTextEn' is missing or too short ({len(w_en)} chars). Must be at least 10 English characters."

    if has_chinese(w_en):
        return False, f"Item '{name}': 'warningTextEn' contains Chinese characters. Must be pure English."

    item['warningText'] = w_zh
    item['warningTextEn'] = w_en

    # Tags validation & bilingual mapping
    tags = item.get('tags', [])
    if not isinstance(tags, list):
        tags = [str(tags)]
    if not tags or len(tags) < 2:
        return False, f"Item '{name}': 'tags' must be a list containing at least 2 Chinese keyword tags."

    item['tags'] = tags

    tags_en = item.get('tagsEn', [])
    if not isinstance(tags_en, list) or not tags_en or any(has_chinese(t) for t in tags_en):
        # Auto map Chinese tags to clean English
        mapped_en = []
        for t in tags:
            en_tag = TAG_TRANSLATIONS.get(t.strip())
            if not en_tag:
                en_tag = 'Open Source' if t == '开源' else ('Self-Hosted' if t == '自建' else 'Free Tools')
            mapped_en.append(en_tag)
        item['tagsEn'] = list(dict.fromkeys(mapped_en))
    else:
        item['tagsEn'] = tags_en

    # Platforms validation
    raw_plats = item.get('platforms', [])
    clean_plats = []
    if isinstance(raw_plats, list):
        for p in raw_plats:
            p_str = str(p).lower().strip()
            if p_str in VALID_PLATFORMS:
                clean_plats.append(p_str)
    item['platforms'] = clean_plats

    # ID generation
    if not item.get('id'):
        kebab_name = to_kebab(name)
        item['id'] = f"{category}-{kebab_name}"

    # Default flags
    item.setdefault('featured', False)
    item.setdefault('isStarred', False)
    item.setdefault('isCollection', False)

    return True, ""

def ingest_items(items: list, root_dir: str, dry_run: bool = False):
    """Processes candidate items, deduplicates, and saves to category JSON files."""
    resources_dir = os.path.join(root_dir, 'src', 'content', 'resources')
    category_data, url_index, github_index, name_index = load_all_existing_resources(resources_dir)

    added_count = 0
    updated_count = 0
    skipped_count = 0
    audit_log = []

    for idx, item in enumerate(items):
        ok, err = validate_item(item, idx + 1)
        if not ok:
            audit_log.append(f"❌ [REJECT] {err}")
            skipped_count += 1
            continue

        item_url = normalize_url(item['url'])
        item_gh = normalize_url(item.get('githubUrl', ''))
        item_name = item['name'].strip().lower()

        # Check for duplicates across all categories
        existing_match = None
        match_reason = ""

        if item_url in url_index:
            existing_match = url_index[item_url]
            match_reason = f"matched existing URL ({item_url})"
        elif item_gh and item_gh in github_index:
            existing_match = github_index[item_gh]
            match_reason = f"matched GitHub repo ({item_gh})"
        elif item_name in name_index:
            existing_match = name_index[item_name]
            match_reason = f"matched existing name '{item['name']}'"

        target_cat = item['category']

        if existing_match:
            exist_cat, exist_item = existing_match
            # Already exists in the library
            # Check if candidate has enriched fields worth updating
            changed = False
            if item.get('warningText') and item['warningText'] != exist_item.get('warningText'):
                exist_item['warningText'] = item['warningText']
                exist_item['warningTextEn'] = item.get('warningTextEn', exist_item.get('warningTextEn'))
                changed = True
            if item.get('isStarred') and not exist_item.get('isStarred'):
                exist_item['isStarred'] = True
                exist_item['featured'] = True
                changed = True
            if item.get('platforms') and set(item['platforms']) != set(exist_item.get('platforms', [])):
                exist_item['platforms'] = list(set(exist_item.get('platforms', []) + item['platforms']))
                changed = True

            if changed:
                audit_log.append(f"🔄 [UPDATE] '{item['name']}' ({exist_cat}) - {match_reason}")
                updated_count += 1
            else:
                audit_log.append(f"⏭️  [SKIP] '{item['name']}' already exists in [{exist_cat}] - {match_reason}")
                skipped_count += 1
        else:
            # Brand new resource
            category_data[target_cat].append(item)
            # Update local indexes to prevent intra-batch duplicates
            url_index[item_url] = (target_cat, item)
            if item_gh:
                github_index[item_gh] = (target_cat, item)
            name_index[item_name] = (target_cat, item)

            audit_log.append(f"✨ [ADD] '{item['name']}' ➔ [{target_cat}] ({item['url']})")
            added_count += 1

    print("\n" + "=" * 60)
    print("📋 ITIS Free Ingestion Audit Summary")
    print("=" * 60)
    for log in audit_log:
        print(log)
    print("-" * 60)
    print(f"Total Processed: {len(items)} | Added: {added_count} | Updated: {updated_count} | Skipped: {skipped_count}")
    print("=" * 60 + "\n")

    if not dry_run and (added_count > 0 or updated_count > 0):
        # Save back updated category files
        for cat, cat_items in category_data.items():
            file_path = os.path.join(resources_dir, f"{cat}.json")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(cat_items, f, ensure_ascii=False, indent=2)
                f.write('\n')
        print(f"✅ Successfully written updates to 'src/content/resources/'!")

    return added_count, updated_count, skipped_count

def process_staging_directory(root_dir: str, dry_run: bool = False):
    """Scans staging/incoming directory for JSON files, ingests them, and moves to staging/archive."""
    incoming_dir = os.path.join(root_dir, 'staging', 'incoming')
    archive_dir = os.path.join(root_dir, 'staging', 'archive')

    os.makedirs(incoming_dir, exist_ok=True)
    os.makedirs(archive_dir, exist_ok=True)

    json_files = [f for f in os.listdir(incoming_dir) if f.endswith('.json')]
    if not json_files:
        print(f"ℹ️  No candidate files found in '{incoming_dir}'. Nothing to ingest.")
        return 0, 0, 0

    all_items = []
    processed_files = []

    for fname in json_files:
        fpath = os.path.join(incoming_dir, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    all_items.extend(data)
                elif isinstance(data, dict):
                    all_items.append(data)
            processed_files.append((fname, fpath))
        except Exception as e:
            print(f"[ERR] Failed to parse '{fname}': {e}")

    if not all_items:
        print("ℹ️  Incoming files contained no valid JSON objects.")
        return 0, 0, 0

    added, updated, skipped = ingest_items(all_items, root_dir, dry_run=dry_run)

    if not dry_run and (added > 0 or updated > 0 or skipped > 0):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        for fname, fpath in processed_files:
            dest_name = f"{timestamp}_{fname}"
            dest_path = os.path.join(archive_dir, dest_name)
            try:
                os.rename(fpath, dest_path)
                print(f"📦 Archived: '{fname}' ➔ '{dest_name}'")
            except Exception as e:
                print(f"[WARN] Could not archive '{fname}': {e}")

    return added, updated, skipped

def main():
    parser = argparse.ArgumentParser(description="ITIS Free Ingestion Engine")
    parser.add_argument('--file', type=str, help="Ingest a specific JSON file directly")
    parser.add_argument('--json-string', type=str, help="Ingest a raw JSON string directly (e.g. from GitHub Issue body)")
    parser.add_argument('--dry-run', action='store_true', help="Validate and simulate deduplication without writing")
    args = parser.parse_args()

    # Determine project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, '..'))

    if args.json_string:
        try:
            # Extract json markdown code block if present
            raw = args.json_string.strip()
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw)
            if match:
                raw = match.group(1).strip()
            data = json.loads(raw)
            items = data if isinstance(data, list) else [data]
            ingest_items(items, root_dir, dry_run=args.dry_run)
        except Exception as e:
            print(f"[ERR] Failed to parse JSON string: {e}")
            sys.exit(1)
    elif args.file:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                items = data if isinstance(data, list) else [data]
            ingest_items(items, root_dir, dry_run=args.dry_run)
        except Exception as e:
            print(f"[ERR] Failed to load '{args.file}': {e}")
            sys.exit(1)
    else:
        # Default: scan staging/incoming directory
        process_staging_directory(root_dir, dry_run=args.dry_run)

if __name__ == '__main__':
    main()
