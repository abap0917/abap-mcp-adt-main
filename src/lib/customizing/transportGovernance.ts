/**
 * Governed transport selection for customizing writes.
 *
 * Ported from abap-config-mcp. Enterprise landscapes pre-provision transports
 * (SolMan / SAP Cloud ALM) — the engine never silently mints one. A recorded
 * commit resolves its transport like so:
 *   - explicit `transport`      → used as-is (request or task; the ABAP engine
 *                                 resolves/creates the caller's modifiable task)
 *   - `createTransport: true`   → the engine creates a new Customizing request
 *   - neither                   → the tool returns an interactive prompt listing
 *                                 the open modifiable requests instead of writing
 */

import type {
  IAbapConnection,
  ILogger,
} from '@babamba2/mcp-abap-adt-interfaces';
import { getSystemContext } from '../systemContext';
import { col, runSql } from './runSql';

export interface TransportDecision {
  kind: 'transport' | 'create' | 'prompt';
  transport?: string;
  prompt?: string;
}

/** List open modifiable transport requests (top-level, no parent). */
export async function listOpenRequests(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  opts: { user?: string; showAll?: boolean } = {},
): Promise<
  Array<{ trkorr: string; function: string; user: string; target: string }>
> {
  const ctx = getSystemContext();
  const user =
    opts.user ?? (opts.showAll ? undefined : ctx.responsible || undefined);
  const userFilter = user ? ` AND AS4USER = '${user.replace(/'/g, "''")}'` : '';
  const rows = await runSql(
    connection,
    logger,
    `SELECT TRKORR, TRFUNCTION, AS4USER, TARSYSTEM FROM E070 ` +
      `WHERE TRSTATUS = 'D' AND STRKORR = '' AND TRFUNCTION IN ('W', 'K')${userFilter} ` +
      `ORDER BY TRKORR`,
    100,
  );
  return rows.map((r) => ({
    trkorr: col(r, 'TRKORR'),
    function: col(r, 'TRFUNCTION'),
    user: col(r, 'AS4USER'),
    target: col(r, 'TARSYSTEM'),
  }));
}

/**
 * Resolve how a recorded write should get its transport.
 */
export async function resolveTransport(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  args: {
    transport?: string;
    createTransport?: boolean;
    showAllTransports?: boolean;
  },
  shortText: string,
): Promise<TransportDecision> {
  if (args.transport) {
    return {
      kind: 'transport',
      transport: args.transport.trim().toUpperCase(),
    };
  }
  if (args.createTransport) {
    return { kind: 'create' };
  }
  // Interactive prompt: list open modifiable requests, flag the CTS function.
  const reqs = await listOpenRequests(connection, logger, {
    showAll: args.showAllTransports,
  });
  const mine = reqs.filter((r) => r.function === 'W');
  const lines: string[] = [
    `No transport given and createTransport not set — nothing was written.`,
    `Choose one of:`,
    `  1. Re-run with transport: "<request-or-task>" (W = Customizing request),`,
    `  2. Re-run with createTransport: true (engine creates a new Customizing request "${shortText}"),`,
    `  3. Create one in SolMan / SAP Cloud ALM and pass its number.`,
  ];
  if (reqs.length) {
    lines.push(
      '',
      `Open modifiable requests${args.showAllTransports ? '' : ` for ${getSystemContext().responsible || 'you'}`}:`,
    );
    for (const r of reqs) {
      const tag = r.function === 'W' ? 'W-customizing' : 'K-workbench';
      lines.push(
        `  ${r.trkorr}  [${tag}]  ${r.user}  → ${r.target || '(local)'}`,
      );
    }
  } else {
    lines.push('', '(no open modifiable requests found)');
  }
  if (!args.showAllTransports && mine.length === 0 && reqs.length > 0) {
    lines.push(
      '',
      `Pass showAllTransports: true to list every user's open requests.`,
    );
  }
  return { kind: 'prompt', prompt: lines.join('\n') };
}
