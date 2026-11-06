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

# Set UTF-8 encoding for standard output on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

VALID_CATEGORIES = {
    'privacy', 'ai', 'video', 'audio', 'gaming', 'reading',
    'downloading', 'torrenting', 'educational', 'mobile', 'linux-macos',
    'developer-tools', 'system-tools', 'file-tools', 'image-tools',
    'video-tools', 'text-tools', 'internet-tools', 'social-media-tools',
    'gaming-tools', 'storage', 'non-english', 'misc'
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

def validate_item(item: dict, index_in_batch: int) -> tuple[bool, str]:
    """Validates required fields, category, and formats."""
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
    if not desc:
        return False, f"Item '{name}': 'description' (Chinese) is required"

    # Default descriptionEn if missing
    if not item.get('descriptionEn'):
        item['descriptionEn'] = desc

    # Safeguard status validation
    status = item.get('safeguardStatus', 'verified')
    if status not in VALID_SAFEGUARD:
        item['safeguardStatus'] = 'verified'

    # Tags validation
    tags = item.get('tags', [])
    if not isinstance(tags, list):
        tags = [str(tags)]
    if not tags:
        tags = ['开源' if item.get('githubUrl') else '免费工具']
    item['tags'] = tags

    tags_en = item.get('tagsEn', [])
    if not isinstance(tags_en, list) or not tags_en:
        item['tagsEn'] = ['Open Source' if item.get('githubUrl') else 'Free Tools']

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
    item.setdefault('warningText', '社区验证纯净，无恶意推广与流氓捆绑。')
    item.setdefault('warningTextEn', 'Community verified clean, trap-free, and ad-free.')

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
