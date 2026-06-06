#!/usr/bin/env node
// Scans the repo for *.md files and regenerates bootstrap.yaml.
// Excludes README.md and plan.md.
// Uses the first # heading as the title; falls back to the filename.
// Run from repo root: node scripts/generate-bootstrap.js

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXCLUDE = new Set(['README.md', 'plan.md']);
const BOOTSTRAP_PATH = path.join(REPO_ROOT, 'bootstrap.yaml');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.basename(filePath, '.md');
}

function walkMd(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'app' && entry.name !== 'scripts') {
        results.push(...walkMd(full));
      }
    } else if (entry.isFile() && entry.name.endsWith('.md') && !EXCLUDE.has(entry.name)) {
      results.push(path.relative(REPO_ROOT, full).replace(/\\/g, '/'));
    }
  }
  return results.sort();
}

// Read existing repo config if present, otherwise use defaults
let repoConfig = { owner: 'alexjames', name: 'memory-palace-data', branch: 'master' };
if (fs.existsSync(BOOTSTRAP_PATH)) {
  const raw = fs.readFileSync(BOOTSTRAP_PATH, 'utf-8');
  const match = raw.match(/^repo:\s*\n((?:[ \t]+.+\n?)*)/m);
  if (match) {
    const ownerMatch = match[1].match(/owner:\s*(.+)/);
    const nameMatch  = match[1].match(/name:\s*(.+)/);
    const branchMatch = match[1].match(/branch:\s*(.+)/);
    if (ownerMatch)  repoConfig.owner  = ownerMatch[1].trim();
    if (nameMatch)   repoConfig.name   = nameMatch[1].trim();
    if (branchMatch) repoConfig.branch = branchMatch[1].trim();
  }
}

const files = walkMd(REPO_ROOT);
const topics = files.map((relPath) => {
  const absPath = path.join(REPO_ROOT, relPath);
  const base = path.basename(relPath, '.md');
  return {
    id: slugify(base),
    title: extractTitle(absPath),
    path: relPath,
  };
});

// Write bootstrap.yaml without an external yaml lib
const lines = [
  'repo:',
  `  owner: ${repoConfig.owner}`,
  `  name: ${repoConfig.name}`,
  `  branch: ${repoConfig.branch}`,
  'topics:',
  ...topics.flatMap((t) => [
    `  - id: ${t.id}`,
    `    title: ${t.title}`,
    `    path: ${t.path}`,
  ]),
  '',
];

fs.writeFileSync(BOOTSTRAP_PATH, lines.join('\n'), 'utf-8');
console.log(`bootstrap.yaml updated with ${topics.length} topics.`);
topics.forEach((t) => console.log(`  ${t.id}: ${t.path}`));
