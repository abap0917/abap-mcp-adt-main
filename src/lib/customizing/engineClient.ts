/**
 * In-system engine ICF client — JSON protocol between the MCP server and the
 * ABAP handlers deployed at /sap/bc/zmcp_cust (customizing engine) and
 * /sap/bc/zmcp_diag (read-only diagnostic engine).
 *
 * Ported from abap-config-mcp. Request JSON uses lowercase keys (ABAP
 * /ui2/cl_json deserialises case-insensitively); the response uses UPPERCASE
 * keys (serialised by /ui2/cl_json with pretty_mode none).
 */

import type {
  IAbapConnection,
  ILogger,
} from '@babamba2/mcp-abap-adt-interfaces';
import { DIAG_ICF_PATH, ENGINE_ICF_PATH } from '../../abap/engineMeta';

export interface EngineResponse {
  STATUS: string;
  OPERATION?: string;
  VERSION?: string;
  DRY_RUN?: string;
  TABLE?: string;
  ROWS_PLANNED?: number;
  ROWS_WRITTEN?: number;
  TRANSPORT?: string;
  MESSAGES?: string[];
  DATA_JSON?: string;
  RUN_ID?: string;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  Accept: 'application/json',
};

async function callIcf(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  path: string,
  operation: string,
  req: Record<string, unknown>,
  timeoutMs: number,
): Promise<EngineResponse> {
  const body = JSON.stringify({ operation, ...req });
  logger?.info(`[customizing] engine call ${path} op=${operation}`);
  const resp = await connection.makeAdtRequest({
    url: path,
    method: 'POST',
    timeout: timeoutMs,
    data: body,
    headers: JSON_HEADERS,
  });
  let data: any = resp.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      throw new Error(
        `Engine returned non-JSON (HTTP ${resp.status}): ${String(data).slice(0, 400)}`,
      );
    }
  }
  if (!data || typeof data !== 'object') {
    throw new Error(
      `Engine returned empty/invalid payload (HTTP ${resp.status})`,
    );
  }
  const out = data as EngineResponse;
  if (!out.STATUS && resp.status !== 200) {
    throw new Error(
      `Engine HTTP ${resp.status}: ${String(resp.data).slice(0, 400)}`,
    );
  }
  return out;
}

/** POST a JSON request to the customizing engine (writes / IMG index reads). */
export function callEngine(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  operation: string,
  req: Record<string, unknown> = {},
  timeoutMs = 600_000, // org_copy commits can run minutes
): Promise<EngineResponse> {
  return callIcf(
    connection,
    logger,
    ENGINE_ICF_PATH,
    operation,
    req,
    timeoutMs,
  );
}

/** POST a JSON request to the Tier-0 diagnostic engine. */
export function callDiag(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  operation: string,
  req: Record<string, unknown> = {},
  timeoutMs = 30_000,
): Promise<EngineResponse> {
  return callIcf(connection, logger, DIAG_ICF_PATH, operation, req, timeoutMs);
}
