const fs = require('fs');
const path = require('path');
const root = process.cwd();
const allFiles = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
      walk(p);
    } else {
      allFiles.push(path.relative(root, p).replace(/\\/g, '/'));
    }
  }
}
walk(root);
const textFiles = allFiles.filter(f => !f.startsWith('node_modules/') && !f.startsWith('dist/'));
const fileContents = {};
for (const f of textFiles) {
  try {
    fileContents[f] = fs.readFileSync(path.join(root, f), 'utf8');
  } catch (e) {
    fileContents[f] = '';
  }
}
function countRefs(file) {
  const name = path.basename(file);
  let count = 0;
  for (const [f, content] of Object.entries(fileContents)) {
    if (f === file) continue;
    const escapedFile = file.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const escapedName = name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    count += (content.match(new RegExp(escapedFile, 'g')) || []).length;
    if (count === 0) count += (content.match(new RegExp(escapedName, 'g')) || []).length;
  }
  return count;
}
const unreferenced = [];
for (const f of textFiles) {
  if (!f.startsWith('src/') && !f.startsWith('public/') && f !== 'package.json' && f !== 'vite.config.js' && f !== 'index.html') continue;
  if (f.match(/\.(jpg|jpeg|png|avif|gif|svg|webp|json)$/i)) continue;
  const refs = countRefs(f);
  if (refs === 0) unreferenced.push(f);
}
console.log('TOTAL FILES', textFiles.length);
console.log('UNREFERENCED FILES', unreferenced.length);
unreferenced.sort().forEach(f => console.log(f));
