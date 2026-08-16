#!/usr/bin/env node
/**
 * list-tools.js — 以指定 exposition 启动 MCP 服务器并列出全部工具名。
 * 用法: node list-tools.js <launcher.js> <env-path> <exposition>
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const launcher = process.argv[2];
const envPath = process.argv[3];
const exposition = process.argv[4] || 'readonly,high,customizing,debug';

const child = spawn(process.execPath, [launcher, `--env-path=${envPath}`, `--exposition=${exposition}`], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' },
});

let buffer = '';
const pending = new Map();
let nextId = 1;

function send(method, params) {
  const id = nextId++;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout waiting for ${method}`)); }
    }, 60000);
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

(async () => {
  try {
    const init = await send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'list-tools', version: '1.0.0' },
    });
    console.log(`[OK] initialize → ${init.serverInfo.name} v${init.serverInfo.version}`);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    const tools = await send('tools/list', {});
    const list = Array.isArray(tools.tools) ? tools.tools : [];
    console.log(`[OK] tools/list → ${list.length} tools (exposition: ${exposition})`);

    const names = list.map((t) => t.name).sort();
    const newNames = names.filter((n) =>
      /^(ImgSearch|Customizing|OrgCopy|AbapDebug|RunAtcAnalysis|HanaMemory|AbapMemory)/.test(n),
    );
    console.log(`\n--- new capability tools (${newNames.length}) ---`);
    for (const n of newNames) console.log('  ' + n);
    console.log('\n--- full tool list ---');
    console.log(names.join('\n'));

    child.kill();
    process.exit(0);
  } catch (err) {
    console.error('\nFAILED:', err.message);
    child.kill();
    process.exit(1);
  }
})();
