import fs from 'node:fs';
import path from 'node:path';

const RESOURCES_DIR = path.resolve('src/content/resources');

async function checkUrl(url) {
  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      method: 'GET',
      headers: browserHeaders,
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    // 2xx, 3xx are healthy. 403/429 usually means anti-bot / Cloudflare challenge, which means site is alive.
    return res.status < 400 || res.status === 403 || res.status === 429;
  } catch (err) {
    return false;
  }
}

async function main() {
  if (!fs.existsSync(RESOURCES_DIR)) {
    console.log('Resources directory not found.');
    return;
  }

  const files = fs.readdirSync(RESOURCES_DIR).filter(f => f.endsWith('.json'));
  const brokenLinks = [];

  console.log(`Checking links across ${files.length} resource categories...`);

  for (const file of files) {
    const filePath = path.join(RESOURCES_DIR, file);
    try {
      const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const item of items) {
        if (!item.url) continue;
        console.log(`Checking [${item.name}]: ${item.url}`);
        const ok = await checkUrl(item.url);
        if (!ok) {
          console.warn(`❌ Dead link detected: ${item.name} (${item.url})`);
          brokenLinks.push({ category: file.replace('.json', ''), name: item.name, url: item.url });
        }
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
  }

  if (brokenLinks.length > 0) {
    const markdown = brokenLinks.map(b => `- **[${b.category}]** [${b.name}](${b.url}) - 无法正常响应`).join('\n');
    fs.writeFileSync('dead_links_report.md', markdown);
    console.log('\nBroken links summary written to dead_links_report.md');
    if (process.env.GITHUB_ENV) {
      fs.appendFileSync(process.env.GITHUB_ENV, 'DEAD_LINKS_DETECTED=true\n');
    }
  } else {
    console.log('✅ All resource links are healthy!');
  }
}

main();
