
import fs from 'fs';
import path from 'path';

const CURATED_INPUT = 'C:/Users/Admin/graphify-audit-temp/curated-input';
const MANIFEST_PATH = 'C:/Users/Admin/graphify-audit-temp/output/graphify-out/manifest.json';
const GRAPH_PATH = 'C:/Users/Admin/graphify-audit-temp/output/graphify-out/graph.json';

// Extensions that Graphify actually indexes
const ALLOWED_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.json']);

async function checkFreshness() {
  console.log("[Freshness] Starting Graphify freshness check...");

  if (!fs.existsSync(GRAPH_PATH)) {
    console.error("❌ FAIL: graph.json not found.");
    process.exit(1);
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("❌ FAIL: manifest.json not found.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let isStale = false;
  let staleFiles = [];

  function walkSync(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        walkSync(filePath, filelist);
      } else {
        filelist.push(filePath);
      }
    });
    return filelist;
  }

  const allFiles = walkSync(CURATED_INPUT);
  for (const fullPath of allFiles) {
    const ext = path.extname(fullPath);
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    const relPath = path.relative(CURATED_INPUT, fullPath).replace(/\\/g, '/');
    if (!manifest[relPath]) {
      isStale = true;
      staleFiles.push(`${relPath} (Missing in manifest)`);
    } else {
      const mtime = fs.statSync(fullPath).mtimeMs / 1000;
      if (mtime > manifest[relPath].seen) {
        isStale = true;
        staleFiles.push(`${relPath} (Modified since last scan)`);
      }
    }
  }

  if (isStale) {
    console.warn("⚠️ WARNING: Graph is STALE.");
    console.warn("Stale files:", staleFiles.join(", "));
    process.exit(1);
  } else {
    console.log("✅ PASS: Graph is FRESH.");
    process.exit(0);
  }
}

checkFreshness().catch(err => {
  console.error(err);
  process.exit(1);
});

