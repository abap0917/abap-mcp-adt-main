#!/usr/bin/env node
/**
 * call-test.js — 真实登录并调用新工具 (ImgSearch / CustomizingDescribe / CustomizingRead)。
 * 用法: node call-test.js <launcher.js> <env-path>
 */
const { spawn } = require('node:child_process');

const launcher = process.argv[2];
const envPath = process.argv[3];

const child = spawn(process.execPath, [launcher, `--env-path=${envPath}`, '--exposition=readonly,customizing'], {
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
    }, 120000);
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
  console.log(`\n========== ${name} ${JSON.stringify(args)} ==========`);
  console.log(text.slice(0, 2500));
  return result;
}

(async () => {
  try {
    await send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'call-test', version: '1.0.0' },
    });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    await callTool('CustomizingDescribe', { object_name: 'T001' });
    await callTool('CustomizingRead', { object_name: 'T001', max_rows: 5 });
    await callTool('ImgSearch', { keyword: 'accrual', namespace: 'ABGR', max_results: 20 });

    child.kill();
    console.log('\n✅ All tool calls completed.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FAILED:', err.message);
    child.kill();
    process.exit(1);
  }
})();
