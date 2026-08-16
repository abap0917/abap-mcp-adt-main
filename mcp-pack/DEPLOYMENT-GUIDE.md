# MCP ABAP ADT — 部署手册（适用于任何 Agent）

> 将本 MCP（SAP ABAP 开发 + SPRO/IMG 配置能力，共 197/344 个工具）接入 **任何 MCP 兼容 agent**：Claude Code / Claude Desktop / Cline / Cursor / VS Code 官方 MCP / Windsurf / GitHub Copilot / OpenAI Codex / Goose / OpenCode / Qwen Code / Crush 等。
>
> 仓库：`https://github.com/abap0917/abap-mcp-adt-main`

---

## 1. 如何部署

### 1.1 前置条件

| 项 | 要求 |
|---|---|
| Node.js | ≥ 18（推荐 20+），`node --version` 确认 |
| SAP 系统 | 可访问，ADT 服务可用（HTTP(S) 可达，端口如 8000/44300/44304 等） |
| 认证信息 | 用户名/密码（Basic）或 JWT token（ABAP Cloud） |
| Agent | 任意支持 MCP 的客户端 |

### 1.2 获取服务器（二选一）

**方式 A — 克隆仓库（推荐，含全部文档与配置包）**
```bash
git clone https://github.com/abap0917/abap-mcp-adt-main.git
cd abap-mcp-adt-main/abap-mcp-adt-main
npm install
npm run build          # 生成 dist/（或直接使用随包已构建的 dist/，可跳过）
```

**方式 B — 全局安装发布包（免绝对路径）**
```bash
npm install -g babamba2-abap-mcp-adt-powerup-4.9.0.tgz
# 之后 agent 配置里 "command": "mcp-abap-adt" 即可
```

### 1.3 配置 SAP 连接（唯一必做步骤）

```bash
cd mcp-pack
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

编辑 `.env`，按你的系统类型填写：

| 场景 | 必填项 | 示例 |
|---|---|---|
| **On-Premise**（Basic） | `SAP_URL`、`SAP_AUTH_TYPE=basic`、`SAP_USERNAME`、`SAP_PASSWORD`、`SAP_CLIENT`、`SAP_SYSTEM_TYPE=onprem`、**`SAP_MASTER_SYSTEM`**（创建/更新对象必需） | `https://192.168.1.10:44300` |
| **ABAP Cloud / BTP**（JWT） | `SAP_URL`、`SAP_AUTH_TYPE=jwt`、`SAP_JWT_TOKEN`、`SAP_UAA_URL`、`SAP_UAA_CLIENT_ID`、`SAP_UAA_CLIENT_SECRET` | `https://<guid>.abap.us10.hana.ondemand.com` |
| **Legacy BASIS<7.50** | 同 On-Premise，再加 `SAP_SYSTEM_TYPE=legacy` | — |

**自检（推荐）**：
```bash
node mcp-pack\verify-stdio.js    # 协议握手 + 工具数
node mcp-pack\login-test.js      # 真实登录验证（GetAdtTypes 返回 215 个对象类型即成功）
```

### 1.4 （可选但强烈建议）部署引擎，解锁 SPRO/IMG 配置能力

只读工具（ImgSearch / CustomizingRead / Describe / Diff / PlanChange）**零部署**即可用；写入工具（Apply / Create / OrgCopy）需要 in-system 引擎。

1. **部署 ABAP 对象**：在 agent 里调用 `CustomizingEngineBootstrap`（自动创建/更新并激活 `ZCL_MCP_CUST_ENGINE` + `ZMCP_CUST_WRITE` + `ZCL_MCP_DIAG`；此后写工具的 autoDeploy 会自动补齐版本）。
2. **注册 SICF 节点（一次性 BASIS 手动步骤，顺序必须在类之后）**：事务 `SICF` 创建并激活：
   - `/sap/bc/zmcp_cust` → Handler List: `ZCL_MCP_CUST_ENGINE`
   - `/sap/bc/zmcp_diag` → Handler List: `ZCL_MCP_DIAG`
3. **验证**：调用 `CustomizingEnginePing`（应显示 `Version: 0.9.21` + 环境探测）。

### 1.5 接入你的 Agent

两条路线任选：

**路线 A — stdio 本地模式**（把下面的 `mcpServers` 合并进对应 agent 配置文件）：

```json
{
  "mcpServers": {
    "mcp-abap-adt": {
      "command": "node",
      "args": [
        "C:/path/to/abap-mcp-adt-main/dist/server/launcher.js",
        "--env-path=C:/path/to/abap-mcp-adt-main/mcp-pack/.env",
        "--exposition=readonly,high,customizing,debug"
      ],
      "env": { "NODE_TLS_REJECT_UNAUTHORIZED": "0" },
      "disabled": false
    }
  }
}
```

> ⚠️ `--exposition=readonly,high,customizing,debug` = 197 个工具（含 23 个配置/调试/ATC 新工具）；不加则只有基础 174 个；只读部署用 `--exposition=readonly`。

| Agent | 配置文件位置 |
|---|---|
| Claude Code | 项目根 `.mcp.json` 或 `~/.claude.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |
| Cline | `.vscode/mcp.json` 或设置 `cline.mcpServers` |
| Cursor | `.cursor/mcp.json` |
| VS Code 官方 MCP | `.vscode/mcp.json` |
| Windsurf | `mcp_config.json` |
| GitHub Copilot | `.github/copilot-mcp.json` |
| OpenAI Codex | `~/.codex/config.toml`（TOML 格式） |
| Goose | `~/.config/goose/config.yaml`（YAML 格式） |
| OpenCode | `opencode.json` 的 `mcp` 字段 |
| Qwen Code / Crush | 各自 MCP 设置面板粘贴 JSON |

（完整 TOML / YAML 示例见 `mcp-pack/README.md` 与 `mcp-pack/agent-configs/`。）

**路线 B — HTTP 共享模式（任何 agent 一条 URL 接入，适合团队/免装依赖）**
```cmd
mcp-pack\scripts\start-http.cmd     # 启动于 http://127.0.0.1:3000/mcp/stream/http
```
```json
{ "mcpServers": { "mcp-abap-adt": {
    "type": "streamableHttp",
    "url": "http://127.0.0.1:3000/mcp/stream/http",
    "headers": { "x-mcp-destination": "default" },
    "timeout": 60, "disabled": false } } }
```

### 1.6 部署完成验证

```bash
node mcp-pack\list-tools.js <launcher.js> <env> readonly,high,customizing,debug   # 应列出 197 个工具
```
在 agent 里试（只读，零部署）：
- `ImgSearch { keyword: "accrual", namespace: "ABGR" }`
- `CustomizingRead { object_name: "T001", max_rows: 5 }`
- `CustomizingEnginePing`（引擎已部署时）

---

## 2. 注意点

### 2.1 安全（必须）

- **`.env` 含真实凭据，绝不提交 git**（仓库 `.gitignore` 已排除 `*.env`；请只提交 `.env.example`）。
- **只读部署**：生产环境用 `--exposition=readonly`，且用只读 SAP 用户。
- **tier 门禁**：服务器按 DEV/QA/PRD 档拦截写入/调试工具（`readonlyGuard`），切换档位或保持 DEV。
- **NODE_TLS_REJECT_UNAUTHORIZED=0**：仅自签名证书环境需要（HTTP 模式由 `start-*.cmd` 设置），生产请使用受信证书并移除该变量。
- **SAP 用户权限**：工具只能做登录用户权限内的事；写配置需 `S_TABU_DIS`；调 SICF 需服务授权。

### 2.2 连接与系统

- **On-Prem 创建/更新对象必须配 `SAP_MASTER_SYSTEM`**（= 系统 SID，如 `S4C`），否则 403。
- **客户端是否记录配置变更（SCC4 `CCCORACTIV`）**决定写操作行为：
  - `'1'`（自动记录）→ 写操作正常记传输；
  - `''`（不记录）→ **传 transport 会被引擎拒绝**，只能 `no_transport: true`（仅开发/测试语义，不经传输）。
- **多系统**：stdio 双实例（`dev.env`/`prod.env`）或 HTTP `x-mcp-destination` / `x-sap-*` 头。
- **自签证书环境**：所有 agent 配置的 `env` 里加 `"NODE_TLS_REJECT_UNAUTHORIZED": "0"`（`.env` 里的 TLS 变量不会自动进 process.env）。

### 2.3 引擎

- **必须用 `CustomizingEngineBootstrap` 部署**：它自动替换源码占位符 `{{ENGINE_VERSION}}` → `0.9.21`、`{{HSRCH_AREA_CASES}}` → 62 个语言分支。
- **手工粘贴源码的后果**：`{{ENGINE_VERSION}}` 不替换 → 版本显示为字面量（功能正常但 autoDeploy 总认为过期）；`{{HSRCH_AREA_CASES}}` 不替换 → **类无法激活**（语法错误）。
- **顺序**：先有类（激活）→ 再配 SICF（handler 引用类名）。SICF 引用不存在的类 → 请求 403/500。
- **autoDeploy（默认开）**：写工具会自动补齐缺失/过期引擎；若对象被 SE24/SE03 锁定，会降级为警告并继续（不阻塞），解锁后自动修正。
- **打包自包含**：`4.9.0.tgz` 内含 `dist/abap/*.abap`，全局安装后无需设 `ABAP_SRC_DIR`；仓库内运行时从 `src/abap` 读取。

### 2.4 工具使用

- **键字段不都是 BUKRS**：T001→`BUKRS`、T880→`RCOMP`、V_T882G_GL→`RBUKRS`。用错键引擎报 `CX_SY_DYNAMIC_OSQL_SEMANTICS`。不确定用 `CustomizingDescribe` 看字段。
- **"计划失败 ≠ 不能复制"**：T880 / T882G 等表不可经 ADT SQL 查询（计划/读取工具报 400），但引擎在 ABAP 内部读数据，**复制工具照常可用**。
- **复制公司代码用维护视图**：如 T882 无维护对象 → 用 `V_T882G_GL`；公司代码完整清单（T001/T001K/T880/V_T882G_GL/T093B/T001S/T001Z）见 README「公司代码复制清单」。
- **写操作默认 dry-run**：`commit: false` 只出计划；确认后再 `commit: true`。

---

## 3. 遇到错误处理方法（速查）

| 现象 | 原因 | 处理 |
|---|---|---|
| agent 里看不到工具 | exposition 未加 / dist 未构建 / 未重启 | `args` 加 `--exposition=readonly,high,customizing,debug`；`npm run build`；重启 agent；`verify-stdio.js` 确认 |
| 连接失败 / 401 | URL、认证类型、client、密码错；token 过期 | 检查 `.env`；`login-test.js` 定位 |
| 自签名证书报错 | TLS 校验失败 | agent 配置 `env` 加 `NODE_TLS_REJECT_UNAUTHORIZED=0`（HTTP 模式看 `start-*.cmd`） |
| On-Prem 更新 403 | 缺 `SAP_MASTER_SYSTEM` | `.env` 补 `SAP_MASTER_SYSTEM=<SID>` |
| SICF `403/404 Service cannot be reached` | 节点未创建/未激活/handler 类不存在 | 事务 SICF 激活节点；确认 handler 类已存在且激活；顺序=先类后 SICF |
| `VERSION: {{ENGINE_VERSION}}` | 手工部署未替换占位符 | 重跑 `CustomizingEngineBootstrap` 就地修正 |
| `autoDeploy skipped: engine objects are locked` | 类被 SE24/SE03 锁定（如请求 S4CKxxx） | SE03 → 解锁对象 → 重试 |
| 写操作拒绝 transport | client 未设自动记录（SCC4 `CCCORACTIV=''`） | SCC4 设"自动记录配置变更"，或接受 `no_transport: true`（仅测试语义） |
| `no SM30/SM34 maintenance object` | 目标表无维护视图/非自维护 | 改用维护视图名（如 T882 → `V_T882G_GL`） |
| `CX_SY_DYNAMIC_OSQL_SEMANTICS` | 键字段与表结构不符（如 T880 用 BUKRS） | 用 `CustomizingDescribe` 查正确键字段（T880→RCOMP） |
| 读取/计划工具 400，复制却成功 | 表不可经 ADT SQL 查询（T880/T882G 类） | 属系统限制；用 `CustomizingApply`/引擎操作，别用计划工具 |
| HTTP 模式连不上 | 服务器未启动 / 端口占用 / destination 错 | 看 `start-http.cmd` 窗口；`GET http://127.0.0.1:3000/mcp/health`；改端口 |
| 登录实测报 `GetAdtTypes` 失败 | ADT 未授权（S_DEVELOP 等） | 给 SAP 用户开 ADT 开发权限 |
| 工具报 `MCP error -32603` | 服务器内部异常（详见消息文本） | 按消息定位：多数为权限/锁/系统限制，见本表对应行 |

---

*手册版本：2026-08 · 对应发布包 `babamba2-abap-mcp-adt-powerup-4.9.0` · 更多细节见 `mcp-pack/README.md`（接入章节 / 引擎部署手册 / 公司代码复制清单）*
