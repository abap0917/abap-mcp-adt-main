/**
 * RunAtcAnalysis — run an ATC (ABAP Test Cockpit) check on an object and report
 * findings, via the standard ADT ATC REST endpoints:
 *   POST /sap/bc/adt/atc/runs?worklistId=<variant>   (create run)
 *   GET  /sap/bc/adt/atc/worklists/<runId>           (fetch findings)
 *
 * Ported from abap-config-mcp (abap-adt-api atc.ts).
 */

import type { HandlerContext } from '../../lib/handlers/interfaces.js';
import { ErrorCode, McpError } from '../../lib/utils.js';

export const TOOL_DEFINITION = {
  name: 'RunAtcAnalysis',
  available_in: ['onprem', 'cloud'] as const,
  description:
    '[quality] Run an ATC (ABAP Test Cockpit) check on an object URL and return the findings (priority, check, message, location).',
  inputSchema: {
    type: 'object',
    properties: {
      object_url: {
        type: 'string',
        description:
          'ADT object URL to check, e.g. /sap/bc/adt/oo/classes/zcl_my_class (or programs/…/source/main for a report).',
      },
      variant: {
        type: 'string',
        description: 'ATC check variant (default DEFAULT).',
        default: 'DEFAULT',
      },
      max_results: {
        type: 'number',
        description: 'Maximum verdicts (default 100).',
        default: 100,
      },
    },
    required: ['object_url'],
  },
} as const;

interface AtcArgs {
  object_url: string;
  variant?: string;
  max_results?: number;
}

function xmlAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<[a-zA-Z0-9_:]*${tag}[^>]*\\b${attr}="([^"]*)"`);
  const m = xml.match(re);
  return m?.[1];
}

export async function handleRunAtcAnalysis(
  context: HandlerContext,
  args: AtcArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.object_url)
      throw new McpError(ErrorCode.InvalidParams, 'object_url is required');
    const variant = args.variant ?? 'DEFAULT';
    const maxResults = args.max_results ?? 100;
    const mainUrl = args.object_url;

    // 1. Create the run
    const runBody =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<atc:run maximumVerdicts="${maxResults}" xmlns:atc="http://www.sap.com/adt/atc">` +
      `<objectSets xmlns:adtcore="http://www.sap.com/adt/core">` +
      `<objectSet kind="inclusive">` +
      `<adtcore:objectReferences>` +
      `<adtcore:objectReference adtcore:uri="${mainUrl}"/>` +
      `</adtcore:objectReferences>` +
      `</objectSet>` +
      `</objectSets>` +
      `</atc:run>`;
    const runResp = await connection.makeAdtRequest({
      url: `/sap/bc/adt/atc/runs?worklistId=${variant}`,
      method: 'POST',
      timeout: 120_000,
      data: runBody,
      headers: { Accept: 'application/xml', 'Content-Type': 'application/xml' },
    });
    const runXml =
      typeof runResp.data === 'string'
        ? runResp.data
        : JSON.stringify(runResp.data);
    const runId = xmlAttr(runXml, 'worklistRun', 'worklistId');
    if (!runId) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `ATC run created but no worklistId found in response:\n${runXml.slice(0, 1000)}`,
          },
        ],
      };
    }

    // 2. Fetch the worklist
    const wlResp = await connection.makeAdtRequest({
      url: `/sap/bc/adt/atc/worklists/${runId}`,
      method: 'GET',
      timeout: 120_000,
      headers: { Accept: 'application/atc.worklist.v1+xml' },
    });
    const wlXml =
      typeof wlResp.data === 'string'
        ? wlResp.data
        : JSON.stringify(wlResp.data);

    // 3. Lightweight parse: object → findings (attributes only, no heavy XML lib)
    const objectBlocks = [
      ...wlXml.matchAll(
        /<([a-zA-Z0-9_:]*):object\b[^>]*>([\s\S]*?)<\/\1:object>/g,
      ),
    ];
    const lines: string[] = [];
    let findingCount = 0;
    for (const [, , inner] of objectBlocks) {
      const objName =
        xmlAttr(inner.slice(0, 400), 'object', 'name') ??
        xmlAttr(inner, 'objectReference', 'uri') ??
        '?';
      const findings = [
        ...inner.matchAll(/<([a-zA-Z0-9_:]*):finding\b([^>]*)\/?>/g),
      ];
      for (const [, , attrs] of findings) {
        findingCount++;
        const prio = attrs.match(/\bpriority="(\d+)"/)?.[1] ?? '?';
        const checkTitle = attrs.match(/\bcheckTitle="([^"]*)"/)?.[1] ?? '';
        const checkId = attrs.match(/\bcheckId="([^"]*)"/)?.[1] ?? '';
        const messageTitle = attrs.match(/\bmessageTitle="([^"]*)"/)?.[1] ?? '';
        const location = attrs.match(/\blocation="([^"]*)"/)?.[1] ?? '';
        const line =
          attrs.match(/\bline="(\d+)"/)?.[1] ??
          location.split('line=')[1] ??
          '';
        lines.push(`[P${prio}] ${checkTitle} (${checkId})`);
        lines.push(`  ${messageTitle}`);
        lines.push(`  ${objName}${line ? ` line ${line}` : ''}`);
      }
    }

    if (findingCount === 0) {
      return {
        isError: false,
        content: [
          {
            type: 'text' as const,
            text: `✅ No ATC findings for ${mainUrl} (run ${runId}, variant ${variant})`,
          },
        ],
      };
    }
    lines.unshift(
      `ATC findings for ${mainUrl} (run ${runId}, variant ${variant}): ${findingCount}`,
    );
    return {
      isError: false,
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error: any) {
    logger?.error('RunAtcAnalysis failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}
