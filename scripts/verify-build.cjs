#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(process.argv[2] || '.');
const dist = process.argv[3] || '.next';
const files = ['BUILD_ID','required-server-files.json','prerender-manifest.json','routes-manifest.json','build-manifest.json','server/app-paths-manifest.json'];
function digest(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
try {
  if (!['.next','.next-experiment'].includes(dist)) throw new Error('Unexpected build directory');
  const build = path.join(root,dist);
  const runtimeNext = JSON.parse(fs.readFileSync(path.join(root,'node_modules/next/package.json'),'utf8')).version;
  const id = fs.readFileSync(path.join(build,'BUILD_ID'),'utf8').trim();
  if (!id || /\s/.test(id)) throw new Error('Invalid BUILD_ID');
  const prerender = JSON.parse(fs.readFileSync(path.join(build,'prerender-manifest.json'),'utf8'));
  if (!prerender.routes || !prerender.routes['/']) throw new Error('Homepage production prerender is missing');
  const stampPath = path.join(build,'selfsite-release.json');
  if (process.argv.includes('--stamp')) {
    const stamp = { node: process.version, next: runtimeNext, buildId: id, distDir: dist, sourceCommit: process.env.GITHUB_SHA || null,
      createdAt: new Date().toISOString(), sha256: Object.fromEntries(files.map(f=>[f,digest(path.join(build,f))])) };
    fs.writeFileSync(stampPath, JSON.stringify(stamp,null,2)+'\n');
  }
  const stamp = JSON.parse(fs.readFileSync(stampPath,'utf8'));
  if (stamp.node !== process.version || stamp.next !== runtimeNext) throw new Error('Build and runtime Node/Next versions differ');
  if (stamp.buildId !== id || stamp.distDir !== dist) throw new Error('Release identity mismatch');
  for (const file of files) if (stamp.sha256[file] !== digest(path.join(build,file))) throw new Error('Build file changed: '+file);
  console.log('Verified production build '+id+' (Node '+process.version+', Next '+runtimeNext+')');
} catch (error) {
  console.error('Production preflight failed: '+error.message);
  process.exit(78);
}
