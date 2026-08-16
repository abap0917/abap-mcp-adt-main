@echo off
REM Start MCP ABAP ADT in HTTP (StreamableHTTP) mode for remote/team usage.
REM Then point any agent at http://127.0.0.1:3000/mcp/stream/http
REM (see agent-configs/http-remote.json)
REM NODE_TLS_REJECT_UNAUTHORIZED=0: 自签名证书场景 (SAP_INSECURE=true)
set NODE_TLS_REJECT_UNAUTHORIZED=0
cd /d "%~dp0.."
node "%~dp0..\..\dist\server\launcher.js" --transport=http --port 3000 --host 127.0.0.1 --env-path="%~dp0..\.env"
