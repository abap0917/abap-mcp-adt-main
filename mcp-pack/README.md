# MCP ABAP ADT — 即用配置包 (mcp-pack)

把 SAP ABAP 开发能力(默认 174 个,全集 344 个 MCP 工具,含 SPRO/IMG 配置与调试器)接入 **任何** MCP 兼容 agent 的一键配置包。
所有 agent 共享同一个 `mcp-pack/.env` 连接文件 —— **只改一处,处处生效**。

```
mcp-pack/
├── .env.example          # 连接模板(带详细注释)
├── .env                  # ← 单系统: 实际连接文件,填写你的 SAP 信息(勿提交 git)
├── dev.env.example       # 多系统: DEV 模板 (On-Prem + Basic Auth 示例)
├── dev.env               # ← 多系统: DEV 连接文件
├── prod.env.example      # 多系统: PROD 模板 (ABAP Cloud + JWT 示例)
├── prod.env              # ← 多系统: PROD 连接文件
├── README.md             # 本文件
├── verify-stdio.js       # 连接自检脚本 (initialize + tools/list)
├── login-test.js         # ★ 登录实测脚本 (真实调用 GetAdtTypes 验证凭据)
├── babamba2-abap-mcp-adt-powerup-4.9.0.tgz   # ★ 增强版安装包(含 SPRO/IMG 引擎,自包含)
├── scripts/
│   ├── start-http.cmd    # HTTP(远程/团队)模式启动脚本
│   └── start-sse.cmd     # SSE 模式启动脚本
└── agent-configs/        # 各 agent 的 MCP 配置片段
    ├── claude-code.json
    ├── claude-desktop.json
    ├── cline.json
    ├── cursor.json
    ├── vscode.json
    ├── windsurf.json
    ├── other-agents.json       # Copilot / Codex / Goose / OpenCode / Qwen / Crush 等
    ├── customizing-enabled.json # ★ 启用 SPRO/IMG 配置 + 调试工具(23 个新增工具)
    ├── http-remote.json        # HTTP 模式(服务器单独启动,agent 用 URL 连接)
    ├── multi-system.json       # ★ 多系统 stdio 双实例(dev + prod)
    └── multi-system-http.json  # ★ 多系统 HTTP 多租户(一个服务器,两个 destination)
```

---

## 第 0 步: 填写 SAP 连接(唯一必做)

编辑 `mcp-pack\.env`,填入真实的 SAP 连接信息:

| 场景 | 必填项 | 示例 |
|---|---|---|
| **ABAP Cloud (BTP)** | `SAP_URL`、`SAP_AUTH_TYPE=jwt`、`SAP_JWT_TOKEN`、`SAP_UAA_URL`、`SAP_UAA_CLIENT_ID`、`SAP_UAA_CLIENT_SECRET` | `https://<guid>.abap.us10.hana.ondemand.com` |
| **On-Premise** | `SAP_URL`、`SAP_AUTH_TYPE=basic`、`SAP_USERNAME`、`SAP_PASSWORD`、`SAP_CLIENT`、`SAP_MASTER_SYSTEM` | `http://sap-dev:8000` |
| **Legacy (BASIS<7.50)** | 同 On-Premise,再加 `SAP_SYSTEM_TYPE=legacy` | — |

> `SAP_SYSTEM_TYPE`: `cloud`(默认) / `onprem` / `legacy`,决定哪些工具可见(例如 Program 工具只在 onprem/legacy)。
> On-Premise 上 Create/Update 必须设置 `SAP_MASTER_SYSTEM`,否则 403。
> **JWT 注意**: ① token 必须是带有效 `exp` 声明的真实 JWT;② UAA 三项必填 —— 服务器启动时 broker 初始化强制校验(缺失会退回 inspection-only 模式)。
> **自签名证书 (SAP_INSECURE=true)**: 所有 stdio 配置已内置 `"env": { "NODE_TLS_REJECT_UNAUTHORIZED": "0" }`(`.env` 里的 TLS 变量不会自动进入 process.env,必须走 agent 配置的 env 字段;HTTP/SSE 模式由 `scripts\start-*.cmd` 设置)。

**自检(可选但推荐):**
```bash
node mcp-pack\verify-stdio.js    # 协议握手 + 工具列表
node mcp-pack\login-test.js      # ★ 真实登录验证 (调用 GetAdtTypes,返回 215 个对象类型即成功)
```

> **多系统?** 本包已内置 dev/prod 双系统配置(见下方「多系统配置」)。单系统直接改 `.env` 即可;多系统分别改 `dev.env` 和 `prod.env`。

---

## 各 agent 接入方式

**两条接入路线:**

| 路线 | 原理 | 适合 |
|---|---|---|
| **A. stdio 本地** | 每个 agent 自己拉起 `node launcher.js` | 单机、常用 agent |
| **B. HTTP 共享** | `scripts\start-http.cmd` 起常驻服务器,任何 agent 用 **URL** 连接 | 其他 agent / 团队共用,无需各自装依赖 |

> ⚠️ **想拿到全部 197 个工具(含 23 个 SPRO/IMG 配置 + 调试 + ATC),stdio 的 `args` 必须加 `"--exposition=readonly,high,customizing,debug"`**(`agent-configs/other-agents.json` 与 `customizing-enabled.json` 已带)。HTTP 模式同理在启动命令里加。

### A. stdio 接入(统一模板,替换路径为你的仓库位置)

```json
{
  "mcpServers": {
    "mcp-abap-adt": {
      "command": "node",
      "args": [
        "C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/dist/server/launcher.js",
        "--env-path=C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/mcp-pack/.env",
        "--exposition=readonly,high,customizing,debug"
      ],
      "env": { "NODE_TLS_REJECT_UNAUTHORIZED": "0" },
      "disabled": false
    }
  }
}
```

| Agent | 配置文件位置 | 示例文件 |
|---|---|---|
| Claude Code | 项目根 `.mcp.json`(或 `~/.claude.json`) | `agent-configs/claude-code.json` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` | `agent-configs/claude-desktop.json` |
| Cline | `.vscode/mcp.json` 或设置里 `cline.mcpServers` | `agent-configs/cline.json` |
| Cursor | `.cursor/mcp.json` | `agent-configs/cursor.json` |
| VS Code 官方 MCP | `.vscode/mcp.json` | `agent-configs/vscode.json` |
| Windsurf | `mcp_config.json`(项目级) | `agent-configs/windsurf.json` |
| GitHub Copilot | `.github/copilot-mcp.json`(部分版本顶层 `mcpServers`) | `agent-configs/other-agents.json` |
| OpenAI Codex | `~/.codex/config.toml`(见下) | — |
| Goose | `~/.config/goose/config.yaml`(见下) | — |
| OpenCode | `opencode.json` 的 `mcp` 字段 | — |
| Qwen Code / Crush | 各自的 MCP 设置面板粘贴 JSON | `agent-configs/other-agents.json` |

> 💡 想只暴露部分能力:去掉 `customizing,debug` 即回到基础 174 个;只要只读:`--exposition=readonly`。
> 💡 全局安装免路径:`npm install -g babamba2-abap-mcp-adt-powerup-4.9.0.tgz` 后 `command` 直接写 `"mcp-abap-adt"`。

**Codex(TOML 示例,含新能力):**
```toml
[mcp_servers.mcp-abap-adt]
command = "node"
args = [
  "C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/dist/server/launcher.js",
  "--env-path=C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/mcp-pack/.env",
  "--exposition=readonly,high,customizing,debug",
]
env = { NODE_TLS_REJECT_UNAUTHORIZED = "0" }
```

**Goose(YAML 示例,含新能力):**
```yaml
mcp:
  servers:
    mcp-abap-adt:
      cmd: node
      args:
        - "C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/dist/server/launcher.js"
        - "--env-path=C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/mcp-pack/.env"
        - "--exposition=readonly,high,customizing,debug"
      env:
        NODE_TLS_REJECT_UNAUTHORIZED: "0"
```

### B. HTTP 共享接入(其他 agent 一条 URL 搞定)⭐

```cmd
mcp-pack\scripts\start-http.cmd    # 启动于 http://127.0.0.1:3000/mcp/stream/http
```

任意 agent 配置:
```json
{
  "mcpServers": {
    "mcp-abap-adt": {
      "type": "streamableHttp",
      "url": "http://127.0.0.1:3000/mcp/stream/http",
      "headers": { "x-mcp-destination": "default" },
      "timeout": 60,
      "disabled": false
    }
  }
}
```
- 模板:`agent-configs/http-remote.json`;健康检查 `GET http://127.0.0.1:3000/mcp/health`
- 团队:一个服务器,所有 agent 用 URL 连,各自不用装依赖
- 多系统:`x-mcp-destination: DEV/PROD` 或 `x-sap-*` 头(见 `multi-system-http.json`)

### 接入后验证

```bash
node mcp-pack\verify-stdio.js     # 协议握手 + 工具数(默认 174)
node mcp-pack\list-tools.js <launcher> <env> readonly,high,customizing,debug   # 197 工具清单
node mcp-pack\login-test.js       # 真实登录
```
agent 里可试(只读,零部署):`ImgSearch {keyword:"accrual", namespace:"ABGR"}`、`CustomizingRead {object_name:"T001"}`;写操作需引擎已部署(见「引擎部署手册」)。

---

## 远程 / 团队模式(HTTP)

本地跑一个常驻服务器,团队所有 agent 用 URL 连接(无需各自装 node_modules):

```bash
mcp-pack\scripts\start-http.cmd        # 启动于 http://127.0.0.1:3000/mcp/stream/http
```

然后把 `agent-configs/http-remote.json` 的片段合并进各 agent(注意 `x-mcp-destination: default` 对应 `.env`;每个 agent 也可以传 `x-sap-*` 头连接不同 SAP 系统)。健康检查:`GET http://127.0.0.1:3000/mcp/health`。

---

## 多系统配置(可选)

本项目原生支持多 SAP 系统,本包已内置 **dev + prod** 双系统文件,开箱即用。两种模式任选:

### 模式 A: stdio 双实例(推荐,本地开发)

一个 agent 挂**两个独立服务器实例**,各自连一个系统,互不干扰。

1. 编辑 `mcp-pack\dev.env` 和 `mcp-pack\prod.env`(分别填入两个系统的真实连接;模板见 `dev.env.example` / `prod.env.example`,已演示 onprem-basic 与 cloud-jwt 两种认证)
2. 把 `agent-configs/multi-system.json` 的 `mcpServers` 合并进 agent 配置(Claude Code / Cline / Cursor / VS Code / Windsurf 通用):

```json
{
  "mcpServers": {
    "mcp-abap-dev": {
      "command": "node",
      "args": [
        "C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/dist/server/launcher.js",
        "--env-path=C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/mcp-pack/dev.env"
      ],
      "env": { "NODE_TLS_REJECT_UNAUTHORIZED": "0" },
      "disabled": false
    },
    "mcp-abap-prod": {
      "command": "node",
      "args": [
        "C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/dist/server/launcher.js",
        "--env-path=C:/Users/Lenovo/Desktop/ABAP-MCP/abap-mcp-adt-main/abap-mcp-adt-main/mcp-pack/prod.env"
      ],
      "env": { "NODE_TLS_REJECT_UNAUTHORIZED": "0" },
      "disabled": false
    }
  }
}
```

3. 重启 agent —— 会出现 `mcp-abap-dev`、`mcp-abap-prod` 两组工具,告诉它用哪组即可
4. 加第三个系统?复制 `dev.env` → `test.env`,把上面配置再复制一份改名为 `mcp-abap-test`、`--env-path` 指向 `test.env`

### 模式 B: HTTP 多租户(一个服务器,多系统,适合团队)

只启动**一个** HTTP 服务器,不同客户端通过 header 选系统,连接按 `sessionId + 配置` 隔离,并发连不同系统不会串数据:

```bash
mcp-pack\scripts\start-http.cmd        # http://127.0.0.1:3000/mcp/stream/http
```

把 `agent-configs/multi-system-http.json` 的 `mcpServers` 合并进各 agent:

```json
{
  "mcpServers": {
    "mcp-abap-dev": {
      "type": "streamableHttp",
      "url": "http://127.0.0.1:3000/mcp/stream/http",
      "headers": { "x-mcp-destination": "DEV" },
      "timeout": 60,
      "disabled": false
    },
    "mcp-abap-prod": {
      "type": "streamableHttp",
      "url": "http://127.0.0.1:3000/mcp/stream/http",
      "headers": { "x-mcp-destination": "PROD" },
      "timeout": 60,
      "disabled": false
    }
  }
}
```

此时 `x-mcp-destination` 走 **service key** 模式: 把两个系统的 service key JSON 存为 `%USERPROFILE%\Documents\mcp-abap-adt\service-keys\DEV.json` 和 `PROD.json`(文件名 = destination 名)。不想要 service key 也可以直接传 `x-sap-url` + `x-sap-jwt-token`(或 `x-sap-login`+`x-sap-password`)头,完全由客户端决定连哪个系统。

### 设计约束(重要)

- ✅ 多实例 / 多租户 — 支持,连接按 session 隔离(架构文档 `CONNECTION_ISOLATION.md` 保证)
- ❌ **同一个 stdio 实例内切换系统** — 不支持: 一个 MCP session 永远映射一个 SAP 系统,stdio 连接启动时缓存、全程复用。连不同系统请用多实例(模式 A)或 HTTP(模式 B)

---

## 进阶

- **工具全集**: 默认只暴露 174 个(readonly + high + search + system)。要启用全部 **321 个**基础工具,在配置的 `args` 里加 `"--exposition=readonly,high,low,compact"`(low = 直接/危险操作,compact = 对象类型门面);再加 `customizing,debug` 得全集 **344 个**。
- **只读部署**: 服务器启动参数加 `--exposition=readonly`(仅读工具 + 搜索/系统)。
- **全局安装(可选)**: `npm install -g babamba2-abap-mcp-adt-powerup-4.9.0.tgz`,之后配置里 `"command": "mcp-abap-adt"` 即可,无需绝对路径。**4.9.0 包已自包含** —— 引擎 ABAP 源码(`dist/abap/*.abap`)随包发布,`CustomizingEngineBootstrap`/autoDeploy 开箱即用,无需额外设置 `ABAP_SRC_DIR`。
- **敏感表防护**: `.env` 里 `SC4SAP_POLICY=on` 可拦截 `GetTableContents`/`GetSqlQuery` 访问 PII/凭据/工资等敏感表。

---

## 🆕 SPRO/IMG 配置能力(新增,23 个工具)

本包已在服务器中集成 **abap-config-mcp(MIT)** 的独有能力,通过新的 exposition 开关启用:

```
--exposition=readonly,high,customizing,debug     # 174 + 23 = 197 个工具
--exposition=readonly,high,low,compact,customizing,debug   # 全集 344 个
```

### 新增工具清单

| 分组 | 工具 | 说明 |
|---|---|---|
| **Customizing 只读**(纯 ADT,零部署) | `ImgSearch` / `CustomizingDescribe` / `CustomizingRead` / `CustomizingDiff` / `CustomizingPlanChange` | 搜索 SPRO/IMG 活动、解析维护对象(视图/表集/权限组/传输对象)、读配置、对比两个组织单元、干跑复制计划 |
| **Customizing 写入**(需引擎) | `CustomizingApply`(copy/delete,默认 dry-run) / `CustomizingCreate` / `CustomizingStatus` / `OrgCopy`(EC01 式组织单元复制) | 驱动 SM30/SM34 维护视图运行时(外键检查/变更日志/**治理化传输记录**,与手动 SPRO 一致) |
| **引擎生命周期** | `CustomizingEngineBootstrap` / `CustomizingEnginePing` / `CustomizingEngineSelftest` / `CustomizingEngineCleanup` | 部署/校验/清理 in-system 引擎 |
| **内存报表**(需 DIAG 引擎) | `HanaMemoryReport` / `AbapMemoryReport` | HANA / ABAP 工作进程内存诊断 |
| **调试器**(7 个) | `AbapDebugSession` / `AbapDebugSetBreakpoint` / `AbapDebugDeleteBreakpoint` / `AbapDebugStep` / `AbapDebugVariable` / `AbapDebugStack` / `AbapDebugSetVariable` | ADT 标准调试器 REST 端点 |
| **ATC** | `RunAtcAnalysis` | 运行 ABAP Test Cockpit 检查并返回 findings |

### 启用步骤(想让 AI 直接做 SPRO 配置时)

1. **agent 配置加 exposition**: 在 MCP 配置的 `args` 末尾追加 `"--exposition=readonly,high,customizing,debug"`(示例见 `agent-configs/customizing-enabled.json`)。
2. **部署引擎(一次性)**: 调用 `CustomizingEngineBootstrap`(参数 `package_name: $TMP` 或你的 Z 包 + transport),它会把类 `ZCL_MCP_CUST_ENGINE` + 后台报表 `ZMCP_CUST_WRITE`(+ 可选 `ZCL_MCP_DIAG`)创建/更新并激活。
3. **注册 SICF 节点(一次性,BASIS)**: 事务 SICF 创建并激活:
   - `/sap/bc/zmcp_cust` → handler 类 `ZCL_MCP_CUST_ENGINE`
   - `/sap/bc/zmcp_diag` → handler 类 `ZCL_MCP_DIAG`
4. **验证**: 调用 `CustomizingEnginePing`(版本握手 + client 变更/传输能力探测)。
5. **写入前注意**: 传输治理要求显式传 `transport` 或 `create_transport: true`,否则返回可选请求列表(不写入);生产环境只读建议不加 `customizing` 只加 `debug` 的写工具也要谨慎。QA/PRD 档(readonlyGuard)会自动拦截写入/调试类工具。

> 引擎 ABAP 源码位于仓库 `src/abap/`(`zcl_mcp_cust_engine.abap` / `zmcp_cust_write.abap` / `zcl_mcp_diag.abap`),`CustomizingEngineBootstrap` 从磁盘读取并部署;若运行时找不到,设环境变量 `ABAP_SRC_DIR` 指向该目录。

---

### 🚀 引擎部署手册(一页速查)

**部署顺序(不可颠倒): ① ABAP 对象(类+报表) → ② SICF 节点 → ③ 验证。**

> ⚠️ **SICF 节点必须引用"已存在且已激活"的 handler 类** —— SICF 只是路由入口,不填/填错 handler 类,请求会 403/500。所以顺序是"先有类,再配 SICF"。

#### 第 ① 步: 部署 ABAP 对象(两种方式任选)

**方式 A — 自动部署(推荐): 调用 `CustomizingEngineBootstrap`**

```
CustomizingEngineBootstrap { package_name: "$TMP" | "Zxxx", transport_request: "可选(可传输包必填)" }
```
自动创建/就地更新并激活:`ZCL_MCP_CUST_ENGINE`(类)+ `ZMCP_CUST_WRITE`(报表)+ `ZCL_MCP_DIAG`(诊断类,可选)。
此后写工具(`CustomizingApply/Create/OrgCopy/Selftest`)的 **autoDeploy(默认开)** 会自动补齐缺失/过期版本,无需再手动跑。

**方式 B — 手动部署(SE80/SE24,备用路径)**

| 步骤 | 操作 | 对象 |
|---|---|---|
| 1 | SE24 创建全局类,粘贴 `src/abap/zcl_mcp_cust_engine.abap` 内容 | 类 `ZCL_MCP_CUST_ENGINE`(实现接口 `IF_HTTP_EXTENSION`),保存+激活 |
| 2 | SE38 创建报表,粘贴 `src/abap/zmcp_cust_write.abap` 内容 | 报表 `ZMCP_CUST_WRITE`,保存+激活 |
| 3 | (可选)同步骤 1,粘贴 `zcl_mcp_diag.abap` | 类 `ZCL_MCP_DIAG`(实现 `IF_HTTP_EXTENSION`) |

⚠️ **手动粘贴时两个占位符必须替换**(否则后果不同):
- `{{ENGINE_VERSION}}`(文件第 8 行 `c_version`)→ 替换为 **`0.9.21`**。不替换:类能激活,但 ping 显示 `VERSION: {{ENGINE_VERSION}}`,且每次 autoDeploy 都认为版本过期想更新。
- `{{HSRCH_AREA_CASES}}`(第 2038 行,位于 `CASE lv_imp.` 内)→ 必须替换为 **62 个 `WHEN '<lang>'.` IMPORT 分支**(见 `src/abap/engineMeta.ts` 的 `hsrchAreaCases()`)。**不替换 = 语法错误,类无法激活**。
- 报表 `PARAMETERS p_runid TYPE c LENGTH 22 LOWER CASE` 的 **`LOWER CASE` 不能删**(否则 run_id 被大写化,后台作业找不到参数)。

#### 第 ② 步: 配置 SICF 节点(一次性,BASIS; 事务 SICF)

1. 事务 `SICF` → `default_host` 下右键 → **新建子元素**。
2. 填写字段:

| 字段 | 节点 1 | 节点 2 |
|---|---|---|
| 服务名(路径) | `zmcp_cust`(`/sap/bc/zmcp_cust`) | `zmcp_diag`(`/sap/bc/zmcp_diag`) |
| 说明 | MCP Customizing Engine | MCP Diagnostic Engine |
| **处理程序列表(Handler List)** | **`ZCL_MCP_CUST_ENGINE`** | **`ZCL_MCP_DIAG`** |
| 服务激活 | ✅ 必须**激活**(否则 403 "Service cannot be reached") | ✅ 同左 |

3. 保存 → 右键服务 → **激活服务**。

**验证 SICF 就绪**(任选):
```bash
# POST 一个 ping 到引擎端点,应返回 {"STATUS":"ok",...}
curl -k -u "192637:密码" -H "Content-Type: application/json" -d '{"operation":"ping"}' \
     https://180.167.68.213:44304/sap/bc/zmcp_cust
```

#### 第 ③ 步: 验证

| 检查 | 工具/方法 | 通过标准 |
|---|---|---|
| 版本握手 | `CustomizingEnginePing` | `Version: 0.9.21`,`STATUS: ok`;环境探测(SYSID/SAP_BASIS/HAS_ORG_COPY…)齐全 |
| 引擎自检 | `CustomizingEngineSelftest` | 动态类型/样例读/TABKEY 全部 OK |
| 只读工具 | `ImgSearch` / `CustomizingRead` / `CustomizingDescribe` / `CustomizingDiff` | **不依赖引擎**,随时可用(纯 ADT) |

#### 权限要求

- 部署: `S_DEVELOP` + 目标包授权;`$TMP` 免传输,生产建议 Z 包 + Workbench 请求走 CTS。
- 写配置(引擎): 目标表 `S_TABU_DIS`(`DICBERCLS`/`ACTVT 02`)+ customizing 权限。
- 调 SICF: 用户需该 ICF 服务的访问授权(`S_ICF`)。

#### 引擎相关故障排查

| 现象 | 原因 | 处理 |
|---|---|---|
| `403 Service cannot be reached`(SICF) | 节点未创建/未激活/handler 类不存在 | SICF 激活;确认 handler 类已存在且激活(顺序见上) |
| ping 401/403 | 用户无该 ICF 服务权限 | 授权 `S_ICF` 或服务级权限 |
| `VERSION: {{ENGINE_VERSION}}` | 手动部署未替换占位符 | 重跑 `CustomizingEngineBootstrap` 就地修正 |
| `autoDeploy skipped: engine objects are locked` | 类被 SE24/SE03 锁定(如请求 S4CKxxx) | SE03 → 解锁对象 → 重试 |
| 写操作拒绝 transport | client 未设自动记录(SCC4 `CCCORACTIV=''`) | SCC4 设为"自动记录配置变更",或接受无传输写入(测试语义) |
| "no SM30/SM34 maintenance object" | 目标表无维护视图/非自维护(class C 表拒绝裸写) | 改用其**维护视图**名(如 T882 → `V_T882G_GL`),可用 `CustomizingDescribe` 查 |

---

### 📋 公司代码复制清单(参考 CN10 配置 CN99 实战总结)

> 复制公司代码 = 逐表复制配置。**EC01(OrgCopy)会一次建全**;逐表复制时按本清单逐个 `CustomizingApply`,别漏 T880!

| 配置对象 | 维护视图/事务 | 键字段 ⚠️ | 说明 |
|---|---|---|---|
| **T001** 公司代码抬头 | V_T001 / OX02 | `BUKRS` | 必做,先建公司代码本体 |
| **T001K** 估价范围/评估分组 | OX14 | `BUKRS` | 公司代码的 BWKEY 分组 |
| **T880** 全局公司数据 | **V_T880 / OX16** | **`RCOMP`** | ⚠️ **最易漏**;S/4HANA 每个公司代码必须有一行(全局参数/国家/币种) |
| V_T882G_GL 分类账组分配 | GLC2 | **`RBUKRS`** | 键字段是 RBUKRS 不是 BUKRS! |
| T093B 折旧范围 | OAYZ | `BUKRS` | 无数据则跳过 |
| T001S 税务业务范围 | OB51 | `BUKRS` | 无数据则跳过 |
| T001Z 预扣税 | OBB8 | `BUKRS` | 无数据则跳过 |

**调用方式**(本系统 client 100 不记录传输,用无传输写入;正式环境按需加 transport):
```
CustomizingApply { object_name: "T001", key_field: "BUKRS", source_key: "CN10", target_key: "CN99",
                   commit: false, no_transport: true }   # 先干跑看 Rows planned
CustomizingApply { ...同上, commit: true }                # 确认后真写
```

**三条实战教训(已踩过)**:
1. **键字段不都是 BUKRS**: T880→`RCOMP`、V_T882G_GL→`RBUKRS`,用错键引擎报 `CX_SY_DYNAMIC_OSQL_SEMANTICS`。不确定就用 `CustomizingDescribe` 看字段。
2. **T880 / T882G 不可经 ADT SQL 查询**(HTTP 400): `CustomizingPlanChange`/`CustomizingRead` 会失败,但 `CustomizingApply` 引擎在 ABAP 内部读数据**不受影响**——"计划失败 ≠ 不能复制"。
3. **无传输写入**: client 设了"不自动记录变更"(SCC4 `CCCORACTIV=''`)时,`CustomizingApply`/`OrgCopy` 需传 `no_transport: true`(跳过传输治理,引擎走 SM30 视图运行时、不记传输,仅限开发/测试语义)。

## 故障排查

| 现象 | 处理 |
|---|---|
| agent 里看不到工具 | 确认 `dist/` 已构建;重启 agent;看 `verify-stdio.js` 输出 |
| 连接失败 / 401 | 检查 `.env` 的 URL、认证类型、client、token 是否过期;运行 `login-test.js` 定位 |
| 自签名证书报错 | 确认 agent 配置里有 `"env": { "NODE_TLS_REJECT_UNAUTHORIZED": "0" }`(HTTP/SSE 模式看 `start-*.cmd`) |
| On-Prem 更新 403 | 补 `SAP_MASTER_SYSTEM`;传 `transport=<TRKORR>` |
| 路径不生效 | 所有配置使用**绝对路径**(正斜杠 `C:/...` 在 Windows 可用) |
