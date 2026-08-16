#!/usr/bin/env node
/**
 * diff-test.js — 对比两个公司代码 (BUKRS) 的配置差异。
 * 用法: node diff-test.js <launcher.js> <env-path> <srcKey> <tgtKey>
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');

const launcher = process.argv[2];
const envPath = process.argv[3];
const SRC = (process.argv[4] || 'CN11').toUpperCase();
const TGT = (process.argv[5] || 'CN18').toUpperCase();
const LOG = process.argv[6] || 'diff-output.log';

const child = spawn(process.execPath, [launcher, `--env-path=${envPath}`, '--exposition=readonly,customizing'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' },
});

let buffer = '';
const pending = new Map();
let nextId = 1;
const logLines = [];

function log(text) {
  logLines.push(text);
  console.log(text);
}

function send(method, params) {
  const id = nextId++;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout waiting for ${method}`)); }
    }, 180000);
  });
}

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(`${p.method}: ${JSON.stringify(msg.error)}`));
      else p.resolve(msg.result);
    }
  }
});

child.on('exit', (code) => {
  if (code !== 0 && pending.size > 0) {
    for (const p of pending.values()) p.reject(new Error(`server exited with code ${code}`));
    pending.clear();
  }
});

async function callTool(name, args) {
  const result = await send('tools/call', { name, arguments: args });
  const text = (result.content || []).map((c) => (c.text !== undefined ? c.text : JSON.stringify(c))).join('\n');
  log(`\n========== ${name} ${JSON.stringify(args)} ==========`);
  log(text);
  return text;
}

(async () => {
  try {
    await send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'diff-test', version: '1.0.0' } });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    await callTool('CustomizingEnginePing', {});
    await callTool('CustomizingRead', { object_name: 'T001', max_rows: 100 });

    const tables = ['T001', 'T001K', 'T093B', 'T882', 'T001S', 'T001Y', 'T001Z', 'T001Q', 'T001U'];
    for (const t of tables) {
      try {
        await callTool('CustomizingDiff', { object_name: t, key_field: 'BUKRS', source_key: SRC, target_key: TGT });
      } catch (e) {
        log(`\n========== CustomizingDiff ${t} ==========\nERROR: ${e.message}`);
      }
    }

    child.kill();
    fs.writeFileSync(LOG, logLines.join('\n'), 'utf8');
    console.log(`\n✅ Done. Full output saved to ${LOG}`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FAILED:', err.message);
    fs.writeFileSync(LOG, logLines.join('\n'), 'utf8');
    child.kill();
    process.exit(1);
  }
})();
