#!/usr/bin/env node
/**
 * cn-config.js — CN10→CN99 配置操作脚本
 * 用法: node cn-config.js <launcher.js> <env-path> <动作...>
 *   动作: read  (查 CN10/CN99 的 T001)
 *         plan  (各表 CustomizingPlanChange 干跑)
 *         apply <table> (CustomizingApply 干跑; commit=true 真写)
 */
const { spawn } = require('node:child_process');

const launcher = process.argv[2];
const envPath = process.argv[3];
const action = process.argv[4] || 'read';

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
    }, 300000);
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
  console.log(text.slice(0, 4000));
  return { result, text };
}

(async () => {
  try {
    await send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cn-config', version: '1.0.0' } });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    if (action === 'read') {
      await callTool('CustomizingRead', { object_name: 'T001', key_field: 'BUKRS', key_value: 'CN10', max_rows: 5 });
      await callTool('CustomizingRead', { object_name: 'T001', key_field: 'BUKRS', key_value: 'CN99', max_rows: 5 });
      await callTool('CustomizingRead', { object_name: 'T001', max_rows: 100 });
    } else if (action === 'plan') {
      const tables = ['T001', 'T001K', 'V_T882G_GL', 'T093B', 'T001S', 'T001Z'];
      for (const t of tables) {
        try {
          await callTool('CustomizingPlanChange', { object_name: t, key_field: 'BUKRS', source_key: 'CN10', target_key: 'CN99' });
        } catch (e) { console.log(`\n[plan ${t}] ERROR: ${e.message}`); }
      }
    } else if (action === 'apply') {
      const table = process.argv[5] || 'T001';
      const commit = process.argv[6] === 'commit';
      const keyField = process.argv[7] || 'BUKRS';
      await callTool('CustomizingApply', {
        object_name: table, key_field: keyField, source_key: 'CN10', target_key: 'CN99',
        commit, no_transport: true,
      });
    } else if (action === 'readOne') {
      await callTool('CustomizingRead', { object_name: process.argv[5], key_field: 'BUKRS', key_value: process.argv[6] || 'CN99', max_rows: 30 });
    }

    child.kill();
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FAILED:', err.message);
    child.kill();
    process.exit(1);
  }
})();
