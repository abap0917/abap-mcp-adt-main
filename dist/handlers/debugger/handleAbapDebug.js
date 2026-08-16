"use strict";
/**
 * ABAP debugger tools (7):
 *   AbapDebugSession           — listen / status / detach a debug session
 *   AbapDebugSetBreakpoint     — set a line breakpoint (returns breakpoint id)
 *   AbapDebugDeleteBreakpoint  — delete by id
 *   AbapDebugStep              — stepInto / stepOver / stepReturn / stepContinue / terminateDebuggee
 *   AbapDebugVariable          — read variable values
 *   AbapDebugStack             — current call stack
 *   AbapDebugSetVariable       — change a variable value
 *
 * Ported from abap-config-mcp against the standard ADT debugger REST endpoints
 * (/sap/bc/adt/debugger/...). Session state is kept in memory per connection.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.handleAbapDebugSession = handleAbapDebugSession;
exports.handleAbapDebugSetBreakpoint = handleAbapDebugSetBreakpoint;
exports.handleAbapDebugDeleteBreakpoint = handleAbapDebugDeleteBreakpoint;
exports.handleAbapDebugStep = handleAbapDebugStep;
exports.handleAbapDebugVariable = handleAbapDebugVariable;
exports.handleAbapDebugStack = handleAbapDebugStack;
exports.handleAbapDebugSetVariable = handleAbapDebugSetVariable;
const crypto_1 = require("crypto");
const utils_js_1 = require("../../lib/utils.js");
const debugSessions = new Map();
function sessionKey(connection) {
    return connection.getSessionId() ?? 'default';
}
function getOrCreateSession(connection, user) {
    const key = sessionKey(connection);
    const existing = debugSessions.get(key);
    if (existing)
        return { key, session: existing };
    const session = {
        terminalId: (0, crypto_1.randomUUID)(),
        ideId: (0, crypto_1.randomUUID)(),
        user,
    };
    debugSessions.set(key, session);
    return { key, session };
}
async function getConnectionUser(connection) {
    // Fall back to the system context responsible (SAP_USERNAME) when known.
    try {
        const { getSystemContext } = await import('../../lib/systemContext.js');
        const ctx = getSystemContext();
        if (ctx.responsible)
            return ctx.responsible;
    }
    catch {
        /* ignore */
    }
    return 'USER';
}
// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
exports.TOOL_DEFINITIONS = [
    {
        name: 'AbapDebugSession',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Manage an ABAP debugging session: listen (register a debugger listener and wait for a breakpoint to be hit), status, detach.',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['listen', 'status', 'detach'],
                    description: 'listen: wait for breakpoint hit; status: show current state; detach: end session.',
                },
                username: {
                    type: 'string',
                    description: 'SAP username to debug (default: connected user).',
                },
            },
            required: ['action'],
        },
    },
    {
        name: 'AbapDebugSetBreakpoint',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Set a line breakpoint in an ABAP program. Returns the breakpoint id(s), usable with AbapDebugDeleteBreakpoint.',
        inputSchema: {
            type: 'object',
            properties: {
                source_url: {
                    type: 'string',
                    description: 'ADT source URL of the object, e.g. /sap/bc/adt/programs/programs/Z_MY_PROG/source/main.',
                },
                line: {
                    type: 'number',
                    description: 'Line number for the breakpoint.',
                },
                username: {
                    type: 'string',
                    description: 'SAP username (default: connected user).',
                },
            },
            required: ['source_url', 'line'],
        },
    },
    {
        name: 'AbapDebugDeleteBreakpoint',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Delete a breakpoint by its id (from AbapDebugSetBreakpoint).',
        inputSchema: {
            type: 'object',
            properties: {
                breakpoint_id: {
                    type: 'string',
                    description: 'Breakpoint id returned by AbapDebugSetBreakpoint.',
                },
            },
            required: ['breakpoint_id'],
        },
    },
    {
        name: 'AbapDebugStep',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Step through ABAP code in the active debug session.',
        inputSchema: {
            type: 'object',
            properties: {
                step_type: {
                    type: 'string',
                    enum: [
                        'stepInto',
                        'stepOver',
                        'stepReturn',
                        'stepContinue',
                        'terminateDebuggee',
                    ],
                    description: 'stepInto (F5), stepOver (F6), stepReturn (F7), stepContinue (F8), terminateDebuggee.',
                },
            },
            required: ['step_type'],
        },
    },
    {
        name: 'AbapDebugVariable',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Inspect variable values in the active ABAP debug session.',
        inputSchema: {
            type: 'object',
            properties: {
                variables: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Variable names, e.g. ["LV_COUNT", "WA_MARA", "IT_TABLE"].',
                },
            },
            required: ['variables'],
        },
    },
    {
        name: 'AbapDebugStack',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Get the current call stack in the active ABAP debug session.',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'AbapDebugSetVariable',
        available_in: ['onprem', 'legacy'],
        description: '[debug] Change the value of a variable in the active ABAP debug session.',
        inputSchema: {
            type: 'object',
            properties: {
                variable_name: {
                    type: 'string',
                    description: 'Variable name to change.',
                },
                value: { type: 'string', description: 'New value.' },
            },
            required: ['variable_name', 'value'],
        },
    },
];
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function req(connection, logger, url, method, opts = {}) {
    return connection.makeAdtRequest({
        url,
        method,
        timeout: opts.timeoutMs ?? 60_000,
        params: opts.params,
        data: opts.body,
        headers: opts.headers ?? { Accept: 'application/xml' },
    });
}
function respText(resp) {
    const d = resp?.data;
    return typeof d === 'string' ? d : JSON.stringify(d ?? null);
}
function ok(text) {
    return { isError: false, content: [{ type: 'text', text }] };
}
function fail(err, logger, label = 'debug tool') {
    logger?.error(`${label} failed`, err);
    return {
        isError: true,
        content: [{ type: 'text', text: String(err?.message ?? err) }],
    };
}
// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
async function handleAbapDebugSession(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.action)
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'action is required');
        const user = args.username ?? (await getConnectionUser(connection));
        if (args.action === 'status') {
            const session = debugSessions.get(sessionKey(connection));
            try {
                const resp = await req(connection, logger, '/sap/bc/adt/debugger/listeners', 'GET', {
                    params: { debuggingMode: 'user', requestUser: user },
                });
                return ok(`Active debug session: ${session ? `terminal=${session.terminalId} ide=${session.ideId} user=${session.user}` : 'none registered in this server'}\n` +
                    `\nSAP listener status:\n${respText(resp)}`);
            }
            catch (e) {
                return ok(`Session state: ${session ? 'registered' : 'none'}\nSAP listener query failed: ${e.message}`);
            }
        }
        if (args.action === 'detach') {
            const { key, session } = getOrCreateSession(connection, user);
            try {
                await req(connection, logger, '/sap/bc/adt/debugger/listeners', 'DELETE', {
                    params: {
                        debuggingMode: 'user',
                        requestUser: user,
                        terminalId: session.terminalId,
                        ideId: session.ideId,
                        checkConflict: false,
                        notifyConflict: true,
                    },
                });
            }
            catch {
                /* already detached */
            }
            debugSessions.delete(key);
            return ok('🔌 Debug session detached.');
        }
        // listen
        const { session } = getOrCreateSession(connection, user);
        const regParams = {
            debuggingMode: 'user',
            requestUser: user,
            terminalId: session.terminalId,
            ideId: session.ideId,
            checkConflict: true,
            isNotifiedOnConflict: true,
        };
        // Register the listener (blocks briefly; returns when a debuggee attaches
        // or the server-side wait times out).
        const resp = await req(connection, logger, '/sap/bc/adt/debugger/listeners', 'POST', {
            params: regParams,
            timeoutMs: 45_000,
        });
        const body = respText(resp);
        const isConflict = /conflict/i.test(body) && resp.status >= 400;
        if (isConflict) {
            return ok(`❌ Debug listener conflict:\n${body}\nAnother debugger may already be attached for this user.`);
        }
        if (resp.status >= 400 ||
            /ExceptionResourceNotAvailable|no debuggee/i.test(body)) {
            return ok(`Listener registered (terminal ${session.terminalId}). No breakpoint hit within the wait window yet.\n` +
                `Set a breakpoint with AbapDebugSetBreakpoint, then re-run AbapDebugSession (listen) or check AbapDebugSession (status).\n${body}`);
        }
        return ok(`🐛 Breakpoint hit!\n${body}\n\nUse AbapDebugStep / AbapDebugVariable / AbapDebugStack to inspect the program state.`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugSession');
    }
}
async function handleAbapDebugSetBreakpoint(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.source_url || !args.line) {
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'source_url and line are required');
        }
        const user = args.username ?? (await getConnectionUser(connection));
        const { session } = getOrCreateSession(connection, user);
        const bpUri = `${args.source_url}#start=${args.line}`;
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<dbg:breakpoints scope="external" debuggingMode="user" requestUser="${user}" ` +
            `terminalId="${session.terminalId}" ideId="${session.ideId}" systemDebugging="false" deactivated="false" ` +
            `xmlns:dbg="http://www.sap.com/adt/debugger">` +
            `<syncScope mode="full"></syncScope>` +
            `<breakpoint xmlns:adtcore="http://www.sap.com/adt/core" kind="line" clientId="${session.ideId}" skipCount="0" adtcore:uri="${bpUri}"/>` +
            `</dbg:breakpoints>`;
        const resp = await req(connection, logger, '/sap/bc/adt/debugger/breakpoints', 'POST', {
            body,
            headers: {
                'Content-Type': 'application/xml',
                Accept: 'application/xml',
            },
        });
        const bodyText = respText(resp);
        const ids = [...bodyText.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
        const idLine = ids.length ? `Breakpoint id(s): ${ids.join(', ')}` : '';
        return ok(`🔴 Breakpoint set at ${args.source_url} line ${args.line}.\n${idLine}\n${bodyText}`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugSetBreakpoint');
    }
}
async function handleAbapDebugDeleteBreakpoint(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.breakpoint_id)
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'breakpoint_id is required');
        const user = args.username ?? (await getConnectionUser(connection));
        const { session } = getOrCreateSession(connection, user);
        await req(connection, logger, `/sap/bc/adt/debugger/breakpoints/${encodeURIComponent(args.breakpoint_id)}`, 'DELETE', {
            params: {
                scope: 'external',
                debuggingMode: 'user',
                requestUser: user,
                terminalId: session.terminalId,
                ideId: session.ideId,
            },
        });
        return ok(`⚪ Breakpoint deleted: ${args.breakpoint_id}`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugDeleteBreakpoint');
    }
}
async function handleAbapDebugStep(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.step_type)
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'step_type is required');
        const resp = await req(connection, logger, '/sap/bc/adt/debugger', 'POST', {
            params: { method: args.step_type },
        });
        return ok(`Step: ${args.step_type}\n${respText(resp)}`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugStep');
    }
}
async function handleAbapDebugVariable(context, args) {
    const { connection, logger } = context;
    try {
        if (!Array.isArray(args?.variables) || args.variables.length === 0) {
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'variables (non-empty array) is required');
        }
        const vars = args.variables
            .map((v) => `<STPDA_ADT_VARIABLE><ID>${v}</ID></STPDA_ADT_VARIABLE>`)
            .join('');
        const body = `<?xml version="1.0" encoding="UTF-8" ?><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"><asx:values>` +
            `<DATA>${vars}</DATA></asx:values></asx:abap>`;
        const resp = await req(connection, logger, '/sap/bc/adt/debugger', 'POST', {
            params: { method: 'getVariables' },
            body,
            headers: {
                Accept: 'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.debugger.Variables',
                'Content-Type': 'application/vnd.sap.as+xml; charset=UTF-8; dataname=com.sap.adt.debugger.Variables',
            },
        });
        return ok(`Variables:\n${respText(resp)}`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugVariable');
    }
}
async function handleAbapDebugStack(context) {
    const { connection, logger } = context;
    try {
        const resp = await req(connection, logger, '/sap/bc/adt/debugger/stack', 'POST', {
            params: { method: 'getStack', emode: '_', semanticURIs: true },
        });
        return ok(`Call stack:\n${respText(resp)}`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugStack');
    }
}
async function handleAbapDebugSetVariable(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.variable_name || args.value === undefined) {
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'variable_name and value are required');
        }
        const resp = await req(connection, logger, '/sap/bc/adt/debugger', 'POST', {
            params: { method: 'setVariableValue', variableName: args.variable_name },
            body: args.value,
        });
        return ok(`Variable ${args.variable_name} set to: ${respText(resp)}`);
    }
    catch (error) {
        return fail(error, logger, 'AbapDebugSetVariable');
    }
}
//# sourceMappingURL=handleAbapDebug.js.map