#!/usr/bin/env node
/**
 * verify-stdio.js — 验证 MCP ABAP ADT stdio 服务器可以正常响应 MCP 握手。
 *
 * 用法:
 *   node verify-stdio.js [path-to-launcher.js] [path-to-.env]
 *
 * 行为:
 *   1. 以 stdio 子进程启动 MCP 服务器
 *   2. 发送 initialize (MCP 协议握手)
 *   3. 发送 notifications/initialized
 *   4. 发送 tools/list 并统计工具数量
 *   5. 正常退出 (exit 0 = 通过)
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

// verify-stdio.js lives in mcp-pack/, one level below the project root
const root = path.resolve(__dirname, '..');
const launcher =
  process.argv[2] || path.join(root, 'dist', 'server', 'launcher.js');
const envPath =
  process.argv[3] || path.join(__dirname, '.env');

const child = spawn(process.execPath, [launcher, `--env-path=${envPath}`], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
const pending = new Map();
let nextId = 1;

function send(method, params) {
  const id = nextId++;
  child.stdin.write(
    JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n',
  );
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`timeout waiting for ${method}`));
      }
    }, 30000);
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
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
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
      clientInfo: { name: 'verify-stdio', version: '1.0.0' },
    });
    console.log(`[OK] initialize  → server: ${init.serverInfo.name} v${init.serverInfo.version}`);
    console.log(`[OK] protocol    → ${init.protocolVersion}`);

    child.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n',
    );

    const tools = await send('tools/list', {});
    const list = Array.isArray(tools.tools) ? tools.tools : [];
    console.log(`[OK] tools/list  → ${list.length} tools available`);
    const sample = list.slice(0, 5).map((t) => t.name);
    console.log(`[OK] sample tools: ${sample.join(', ')}${list.length > 5 ? ', ...' : ''}`);

    child.kill();
    console.log('\n✅ 验证通过: 任何 MCP 客户端都可以通过 stdio 连接此服务器。');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ 验证失败:', err.message);
    child.kill();
    process.exit(1);
  }
})();
