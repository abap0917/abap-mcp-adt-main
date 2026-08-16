#!/usr/bin/env node
/**
 * copy-abap.js — 构建后把 customizing 引擎的 ABAP 源码复制到 dist/abap/,
 * 使打包后的服务器自包含(readAbap 在 __dirname=dist/abap 直接找到 .abap)。
 * 运行时机: npm run build 的 postbuild 阶段。
 */
const fs = require('node:fs');
const path = require('node:path');

const files = [
  'zcl_mcp_cust_engine.abap',
  'zmcp_cust_write.abap',
  'zcl_mcp_diag.abap',
];

const srcDir = path.resolve(__dirname, '../src/abap');
const distDir = path.resolve(__dirname, '../dist/abap');

fs.mkdirSync(distDir, { recursive: true });
for (const f of files) {
  const from = path.join(srcDir, f);
  const to = path.join(distDir, f);
  if (!fs.existsSync(from)) {
    console.error(`[copy-abap] missing source: ${from}`);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log(`[copy-abap] ${f} -> dist/abap/`);
}
console.log(`[copy-abap] done (${files.length} files)`);
