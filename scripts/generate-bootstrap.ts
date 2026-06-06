#!/usr/bin/env node
/**
 * Scans the repo for *.md files and regenerates bootstrap.yaml.
 * Excludes README.md and plan.md.
 * Uses the first # heading as the title; falls back to the filename.
 * Run from repo root: npx ts-node scripts/generate-bootstrap.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const REPO_ROOT = path.resolve(__dirname, '..');
const EXCLUDE = new Set(['README.md', 'plan.md']);
const BOOTSTRAP_PATH = path.join(REPO_ROOT, 'bootstrap.yaml');

interface Topic {
  id: string;
  title: string;
  path: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(filePath, '.md');
}

function walkMd(dir: string, base: string = REPO_ROOT): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip hidden dirs and node_modules
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'app' && entry.name !== 'scripts') {
        results.push(...walkMd(full, base));
      }
    } else if (entry.isFile() && entry.name.endsWith('.md') && !EXCLUDE.has(entry.name)) {
      results.push(path.relative(base, full).replace(/\\/g, '/'));
    }
  }
  return results.sort();
}

const existing = fs.existsSync(BOOTSTRAP_PATH)
  ? (yaml.load(fs.readFileSync(BOOTSTRAP_PATH, 'utf-8')) as any)
  : {};

const repoConfig = existing?.repo ?? { owner: 'alexjames', name: 'memory-palace', branch: 'master' };

const files = walkMd(REPO_ROOT);
const topics: Topic[] = files.map((relPath) => {
  const absPath = path.join(REPO_ROOT, relPath);
  const base = path.basename(relPath, '.md');
  return {
    id: slugify(base),
    title: extractTitle(absPath),
    path: relPath,
  };
});

const output = { repo: repoConfig, topics };
fs.writeFileSync(BOOTSTRAP_PATH, yaml.dump(output, { lineWidth: 120 }), 'utf-8');
console.log(`bootstrap.yaml updated with ${topics.length} topics.`);
topics.forEach((t) => console.log(`  ${t.id}: ${t.path}`));
