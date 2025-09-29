/*
Usage:
  node examples/bulk-add-characters.js \
    --base https://your-site.vercel.app \
    --token sk_test_or_jwt \
    --file data.json

CSV example:
  node examples/bulk-add-characters.js --base http://localhost:3000 --token <jwt> --file data.csv

JSON format: array of items
[
  {"name":"Alice","role":"protagonist","birthdate":"1990-05-01","tags":["hero"]},
  {"name":"Bob","role":"supporting","age":32,"tags":["friend","ally"]}
]

CSV headers example:
name,role,birthdate,tags
Alice,protagonist,1990-05-01,hero|leader
Bob,supporting,,friend|ally
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function arg(name, def) {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return def;
}

const base = arg('base', 'http://localhost:3000');
const token = arg('token');
const file = arg('file');

if (!token) {
  console.error(
    'Missing --token (Bearer JWT for Clerk-authenticated admin/editor)'
  );
  process.exit(1);
}
if (!file) {
  console.error('Missing --file path to CSV or JSON');
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), file);
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();
const url = `${base}/api/admin/characters/bulk`;

const content = fs.readFileSync(filePath);

const headers = {
  Authorization: `Bearer ${token}`,
};

let contentType = 'application/json';
if (ext === '.csv') contentType = 'text/csv';
headers['Content-Type'] = contentType;

const res = await fetch(url, {
  method: 'POST',
  headers,
  body: content,
});

console.log('Status:', res.status);
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
