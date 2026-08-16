#!/usr/bin/env node
/**
 * login-test.js — 实测 SAP 登录:通过 MCP 协议调用 GetAdtTypes (真实 ADT 调用)。
 *
 * 用法:
 *   node login-test.js [path-to-launcher.js] [path-to-.env]
 *
 * 前置: 子进程注入 NODE_TLS_REJECT_UNAUTHORIZED=0 (自签名证书场景)。
 * 成功标志: GetAdtTypes 返回对象类型列表 (CLAS, TABL, PROG, ...)。
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const launcher =
  process.argv[2] || path.join(root, 'dist', 'server', 'launcher.js');
const envPath = process.argv[3] || path.join(__dirname, '.env');

const child = spawn(process.execPath, [launcher, `--env-path=${envPath}`], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' },
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
    await send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'login-test', version: '1.0.0' },
    });
    child.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n',
    );

    console.log('[1/2] 调用 GetAdtTypes (真实 ADT 请求, 验证登录)...');
    const result = await send('tools/call', {
      name: 'GetAdtTypes',
      arguments: {},
    });

    const text = (result.content || [])
      .map((c) => (c.text !== undefined ? c.text : JSON.stringify(c)))
      .join('\n');

    if (result.isError) {
      console.error('❌ 登录/调用失败 (isError=true):');
      console.error(text.slice(0, 1500));
      process.exit(1);
    }

    console.log('[2/2] ✅ tools/call GetAdtTypes 成功!');
    const types = (text.match(/"(name)":\s*"([A-Z0-9]{3,})"/g) || [])
      .map((m) => m.match(/"name":\s*"([A-Z0-9]{3,})"/)[1])
      .filter((v, i, a) => a.indexOf(v) === i);
    console.log(`     检测到 ${types.length} 个 ADT 对象类型: ${types.slice(0, 25).join(', ')}${types.length > 25 ? ', ...' : ''}`);
    console.log('\n✅ 登录验证通过: 用户名/密码/客户端/TLS 配置全部正确。');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ 登录验证失败:', err.message);
    console.error('  检查: 用户名/密码/客户端是否正确;SAP 系统是否允许该用户 ADT 访问 (S_DEVELOP).');
    process.exit(1);
  } finally {
    child.kill();
  }
})();
