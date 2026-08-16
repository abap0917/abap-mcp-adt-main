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
import type { HandlerContext } from '../../lib/handlers/interfaces.js';
export declare const TOOL_DEFINITIONS: ({
    readonly name: "AbapDebugSession";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Manage an ABAP debugging session: listen (register a debugger listener and wait for a breakpoint to be hit), status, detach.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly action: {
                readonly type: "string";
                readonly enum: readonly ["listen", "status", "detach"];
                readonly description: "listen: wait for breakpoint hit; status: show current state; detach: end session.";
            };
            readonly username: {
                readonly type: "string";
                readonly description: "SAP username to debug (default: connected user).";
            };
            readonly source_url?: undefined;
            readonly line?: undefined;
            readonly breakpoint_id?: undefined;
            readonly step_type?: undefined;
            readonly variables?: undefined;
            readonly variable_name?: undefined;
            readonly value?: undefined;
        };
        readonly required: readonly ["action"];
    };
} | {
    readonly name: "AbapDebugSetBreakpoint";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Set a line breakpoint in an ABAP program. Returns the breakpoint id(s), usable with AbapDebugDeleteBreakpoint.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly source_url: {
                readonly type: "string";
                readonly description: "ADT source URL of the object, e.g. /sap/bc/adt/programs/programs/Z_MY_PROG/source/main.";
            };
            readonly line: {
                readonly type: "number";
                readonly description: "Line number for the breakpoint.";
            };
            readonly username: {
                readonly type: "string";
                readonly description: "SAP username (default: connected user).";
            };
            readonly action?: undefined;
            readonly breakpoint_id?: undefined;
            readonly step_type?: undefined;
            readonly variables?: undefined;
            readonly variable_name?: undefined;
            readonly value?: undefined;
        };
        readonly required: readonly ["source_url", "line"];
    };
} | {
    readonly name: "AbapDebugDeleteBreakpoint";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Delete a breakpoint by its id (from AbapDebugSetBreakpoint).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly breakpoint_id: {
                readonly type: "string";
                readonly description: "Breakpoint id returned by AbapDebugSetBreakpoint.";
            };
            readonly action?: undefined;
            readonly username?: undefined;
            readonly source_url?: undefined;
            readonly line?: undefined;
            readonly step_type?: undefined;
            readonly variables?: undefined;
            readonly variable_name?: undefined;
            readonly value?: undefined;
        };
        readonly required: readonly ["breakpoint_id"];
    };
} | {
    readonly name: "AbapDebugStep";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Step through ABAP code in the active debug session.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly step_type: {
                readonly type: "string";
                readonly enum: readonly ["stepInto", "stepOver", "stepReturn", "stepContinue", "terminateDebuggee"];
                readonly description: "stepInto (F5), stepOver (F6), stepReturn (F7), stepContinue (F8), terminateDebuggee.";
            };
            readonly action?: undefined;
            readonly username?: undefined;
            readonly source_url?: undefined;
            readonly line?: undefined;
            readonly breakpoint_id?: undefined;
            readonly variables?: undefined;
            readonly variable_name?: undefined;
            readonly value?: undefined;
        };
        readonly required: readonly ["step_type"];
    };
} | {
    readonly name: "AbapDebugVariable";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Inspect variable values in the active ABAP debug session.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly variables: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Variable names, e.g. [\"LV_COUNT\", \"WA_MARA\", \"IT_TABLE\"].";
            };
            readonly action?: undefined;
            readonly username?: undefined;
            readonly source_url?: undefined;
            readonly line?: undefined;
            readonly breakpoint_id?: undefined;
            readonly step_type?: undefined;
            readonly variable_name?: undefined;
            readonly value?: undefined;
        };
        readonly required: readonly ["variables"];
    };
} | {
    readonly name: "AbapDebugStack";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Get the current call stack in the active ABAP debug session.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly action?: undefined;
            readonly username?: undefined;
            readonly source_url?: undefined;
            readonly line?: undefined;
            readonly breakpoint_id?: undefined;
            readonly step_type?: undefined;
            readonly variables?: undefined;
            readonly variable_name?: undefined;
            readonly value?: undefined;
        };
        readonly required?: undefined;
    };
} | {
    readonly name: "AbapDebugSetVariable";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[debug] Change the value of a variable in the active ABAP debug session.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly variable_name: {
                readonly type: "string";
                readonly description: "Variable name to change.";
            };
            readonly value: {
                readonly type: "string";
                readonly description: "New value.";
            };
            readonly action?: undefined;
            readonly username?: undefined;
            readonly source_url?: undefined;
            readonly line?: undefined;
            readonly breakpoint_id?: undefined;
            readonly step_type?: undefined;
            readonly variables?: undefined;
        };
        readonly required: readonly ["variable_name", "value"];
    };
})[];
export declare function handleAbapDebugSession(context: HandlerContext, args: {
    action: 'listen' | 'status' | 'detach';
    username?: string;
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapDebugSetBreakpoint(context: HandlerContext, args: {
    source_url: string;
    line: number;
    username?: string;
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapDebugDeleteBreakpoint(context: HandlerContext, args: {
    breakpoint_id: string;
    username?: string;
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapDebugStep(context: HandlerContext, args: {
    step_type: string;
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapDebugVariable(context: HandlerContext, args: {
    variables: string[];
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapDebugStack(context: HandlerContext): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapDebugSetVariable(context: HandlerContext, args: {
    variable_name: string;
    value: string;
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=handleAbapDebug.d.ts.map