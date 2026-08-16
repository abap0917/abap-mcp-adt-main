import type { IAdtResponse } from '@babamba2/mcp-abap-adt-interfaces';
import type { AxiosResponse } from 'axios';
export interface ParsedCheckRunResult {
    success: boolean;
    status: string;
    message: string;
    errors: Array<{
        type: string;
        text: string;
        line?: string | number;
        href?: string;
    }>;
    warnings: Array<{
        type: string;
        text: string;
        line?: string | number;
        href?: string;
    }>;
    info: Array<{
        type: string;
        text: string;
        line?: string | number;
        href?: string;
    }>;
    total_messages: number;
    has_errors: boolean;
    has_warnings: boolean;
}
export declare function parseCheckRunResponse(response: IAdtResponse | AxiosResponse): ParsedCheckRunResult;
//# sourceMappingURL=checkRunParser.d.ts.map