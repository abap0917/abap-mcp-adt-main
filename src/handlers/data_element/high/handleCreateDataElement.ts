/**
 * CreateDataElement Handler - ABAP Data Element Creation via ADT API
 *
 * Uses DataElementBuilder from @babamba2/mcp-abap-adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: create -> activate -> verify
 */

import { createAdtClient } from '../../../lib/clients';
import { updateDataElementXml } from '../../../lib/ddicDataElementUpdate';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { callDdicActivate, callDdicDtel } from '../../../lib/rfcBackend';
import { getSystemContext } from '../../../lib/systemContext';
import {
  type AxiosResponse,
  ErrorCode,
  McpError,
  return_error,
  return_response,
  safeCheckOperation,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';
export const TOOL_DEFINITION = {
  name: 'CreateDataElement',
  available_in: ['onprem', 'cloud'] as const,
  description:
    'Create a new ABAP data element in SAP system with all required steps: create, activate, and verify.',
  inputSchema: {
    type: 'object',
    properties: {
      data_element_name: {
        type: 'string',
        description:
          'Data element name (e.g., ZZ_E_TEST_001). Must follow SAP naming conventions.',
      },
      description: {
        type: 'string',
        description:
          'Data element description. If not provided, data_element_name will be used.',
      },
      package_name: {
        type: 'string',
        description: 'Package name (e.g., ZOK_LOCAL, $TMP for local objects)',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., E19K905635). Required for transportable packages.',
      },
      data_type: {
        type: 'string',
        description:
          "Data type (e.g., CHAR, NUMC) or domain name when type_kind is 'domain'.",
        default: 'CHAR',
      },
      length: {
        type: 'number',
        description: 'Data type length. Usually inherited from domain.',
        default: 100,
      },
      decimals: {
        type: 'number',
        description: 'Decimal places. Usually inherited from domain.',
        default: 0,
      },
      short_label: {
        type: 'string',
        description:
          'Short field label (max 10 chars). Applied during update step after creation.',
      },
      medium_label: {
        type: 'string',
        description:
          'Medium field label (max 20 chars). Applied during update step after creation.',
      },
      long_label: {
        type: 'string',
        description:
          'Long field label (max 40 chars). Applied during update step after creation.',
      },
      heading_label: {
        type: 'string',
        description:
          'Heading field label (max 55 chars). Applied during update step after creation.',
      },
      type_kind: {
        type: 'string',
        description:
          "Type kind: 'domain' (default), 'predefinedAbapType', 'refToPredefinedAbapType', 'refToDictionaryType', 'refToClifType'. If not specified, defaults to 'domain'.",
        enum: [
          'domain',
          'predefinedAbapType',
          'refToPredefinedAbapType',
          'refToDictionaryType',
          'refToClifType',
        ],
        default: 'domain',
      },
      type_name: {
        type: 'string',
        description:
          "Type name: domain name (when type_kind is 'domain'), data element name (when type_kind is 'refToDictionaryType'), or class name (when type_kind is 'refToClifType')",
      },
      search_help: {
        type: 'string',
        description:
          'Search help name. Applied during update step after creation.',
      },
      search_help_parameter: {
        type: 'string',
        description:
          'Search help parameter. Applied during update step after creation.',
      },
      set_get_parameter: {
        type: 'string',
        description:
          'Set/Get parameter ID. Applied during update step after creation.',
      },
      master_system: {
        type: 'string',
        description:
          'Optional master system SID for the ADT create XML (e.g. S4C). Defaults to the resolved system context / SAP_MASTER_SYSTEM.',
      },
      responsible: {
        type: 'string',
        description:
          'Optional responsible user for the ADT create XML. Defaults to SAP_RESPONSIBLE / SAP_USERNAME.',
      },
    },
    required: ['data_element_name', 'package_name'],
  },
} as const;

interface DataElementArgs {
  data_element_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  data_type?: string;
  length?: number;
  decimals?: number;
  short_label?: string;
  medium_label?: string;
  long_label?: string;
  heading_label?: string;
  type_kind?:
    | 'domain'
    | 'predefinedAbapType'
    | 'refToPredefinedAbapType'
    | 'refToDictionaryType'
    | 'refToClifType';
  type_name?: string;
  search_help?: string;
  search_help_parameter?: string;
  set_get_parameter?: string;
  activate?: boolean;
  /**
   * Optional master system (SID) written into the ADT create XML
   * (e.g. 'S4C'). Falls back to the resolved system context / env.
   */
  master_system?: string;
  /** Optional responsible user written into the ADT create XML. */
  responsible?: string;
}

/**
 * Main handler for CreateDataElement MCP tool
 *
 * Uses DataElementBuilder from @babamba2/mcp-abap-adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export async function handleCreateDataElement(
  context: HandlerContext,
  args: DataElementArgs,
) {
  const { connection, logger } = context;
  try {
    // Validate required parameters
    if (!args?.data_element_name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Data element name is required',
      );
    }
    if (!args?.package_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Package name is required');
    }

    // Validate transport_request: required for non-$TMP packages
    validateTransportRequest(args.package_name, args.transport_request);

    const typedArgs = args as DataElementArgs;
    const dataElementName = typedArgs.data_element_name.toUpperCase();

    // ADT create/update XML carries masterSystem + responsible. The client
    // library writes `adtcore:responsible=""` when the value is empty and
    // omits masterSystem — the SAP server rejects that with "条件检查失败"
    // (conditional check failed), so resolve real values from the system
    // context / env before delegating.
    const sysCtx = getSystemContext();
    const masterSystem =
      typedArgs.master_system ||
      sysCtx.masterSystem ||
      process.env.SAP_MASTER_SYSTEM ||
      undefined;
    const responsible =
      typedArgs.responsible ||
      sysCtx.responsible ||
      process.env.SAP_RESPONSIBLE ||
      process.env.SAP_USERNAME ||
      undefined;

    // Field labels are required by the ADT create/update XML ("缺少描述"
    // when empty) — default each to the description (truncated to the
    // allowed label lengths), mirroring how SE11 fills them.
    const descLabel = typedArgs.description || dataElementName;
    const shortLabel = (typedArgs.short_label ?? descLabel).slice(0, 10);
    const mediumLabel = (typedArgs.medium_label ?? descLabel).slice(0, 20);
    const longLabel = (typedArgs.long_label ?? descLabel).slice(0, 40);
    const headingLabel = (typedArgs.heading_label ?? descLabel).slice(0, 55);

    // ECC fallback — ADT /sap/bc/adt/ddic/dataelements is absent on
    // BASIS < 7.50. Route through ZMCP_ADT_DDIC_DTEL OData FI.
    if (process.env.SAP_VERSION?.toUpperCase() === 'ECC') {
      return handleCreateDataElementEcc(context, typedArgs, dataElementName);
    }

    logger?.info(`Starting data element creation: ${dataElementName}`);

    const client = createAdtClient(connection, logger);
    const shouldActivate = typedArgs.activate !== false;
    const typeKind = typedArgs.type_kind || 'domain';
    let lockHandle: string | undefined;
    try {
      // Validate
      await client.getDataElement().validate({
        dataElementName,
        packageName: typedArgs.package_name,
        description: typedArgs.description || dataElementName,
      });

      // Create (registers bare object in SAP)
      const createConfig: any = {
        dataElementName,
        description: typedArgs.description || dataElementName,
        packageName: typedArgs.package_name,
        typeKind: typeKind,
        dataType: typedArgs.data_type,
        typeName: typedArgs.type_name,
        length: typedArgs.length,
        decimals: typedArgs.decimals,
        transportRequest: typedArgs.transport_request,
        masterSystem,
        responsible,
        shortLabel,
        mediumLabel,
        longLabel,
        headingLabel,
      };
      await client.getDataElement().create(createConfig);

      // Lock
      lockHandle = await client.getDataElement().lock({ dataElementName });

      // Update with read-modify-write: reads current XML from SAP, patches
      // with properties, PUTs back. Done in-process (not via the client
      // library) because the client's attribute patch targets the first
      // `adtcore:description` match — which on some systems is the
      // packageRef's, leaving the root without a description and failing
      // with "缺少描述".
      await updateDataElementXml(
        connection,
        {
          dataElementName,
          description: typedArgs.description || dataElementName,
          dataType: typedArgs.data_type || 'CHAR',
          length: typedArgs.length || 100,
          decimals: typedArgs.decimals || 0,
          typeKind: typeKind,
          typeName: typedArgs.type_name,
          searchHelp: typedArgs.search_help,
          searchHelpParameter: typedArgs.search_help_parameter,
          setGetParameter: typedArgs.set_get_parameter,
          transportRequest: typedArgs.transport_request,
          shortLabel,
          mediumLabel,
          longLabel,
          headingLabel,
        },
        lockHandle,
      );

      // Unlock
      await client.getDataElement().unlock({ dataElementName }, lockHandle);
      lockHandle = undefined;

      // Check
      try {
        await safeCheckOperation(
          () => client.getDataElement().check({ dataElementName }),
          dataElementName,
          {
            debug: (message: string) => logger?.debug(message),
          },
        );
      } catch (checkError: any) {
        if (!(checkError as any).isAlreadyChecked) {
          throw checkError;
        }
      }

      // Activate if requested
      if (shouldActivate) {
        await client.getDataElement().activate({ dataElementName });
      }

      logger?.info(`✅ CreateDataElement completed: ${dataElementName}`);

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            data_element_name: dataElementName,
            package: typedArgs.package_name,
            transport_request: typedArgs.transport_request,
            data_type: typedArgs.data_type || null,
            status: shouldActivate ? 'active' : 'inactive',
            message: `Data element ${dataElementName} created${shouldActivate ? ' and activated' : ''} successfully`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      if (lockHandle) {
        try {
          await client.getDataElement().unlock({ dataElementName }, lockHandle);
        } catch (_unlockError) {
          // Ignore unlock errors during cleanup
        }
      }

      logger?.error(
        `Error creating data element ${dataElementName}: ${error?.message || error}`,
      );

      if (
        error.message?.includes('already exists') ||
        error.response?.data?.includes('ExceptionResourceAlreadyExists')
      ) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Data element ${dataElementName} already exists. Please delete it first or use a different name.`,
        );
      }

      const errorMessage = error.response?.data
        ? typeof error.response.data === 'string'
          ? error.response.data
          : String(error.response.data).substring(0, 500)
        : error.message || String(error);

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create data element ${dataElementName}: ${errorMessage}`,
      );
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    return return_error(error);
  }
}

/**
 * ECC fallback for CreateDataElement.
 *
 * Supports type_kind='domain' (most common). Other type_kinds fall back
 * to an error until we need them — the ECC RFC FM could be extended to
 * cover them later by exposing more DD04V fields.
 */
async function handleCreateDataElementEcc(
  context: HandlerContext,
  args: DataElementArgs,
  dataElementName: string,
) {
  const { connection, logger } = context;
  const shouldActivate = args.activate !== false;
  const typeKind = args.type_kind || 'domain';

  if (typeKind !== 'domain') {
    throw new McpError(
      ErrorCode.InvalidParams,
      `ECC CreateDataElement fallback currently supports only type_kind='domain' (got '${typeKind}'). ` +
        `Extend ZMCP_ADT_DDIC_DTEL FM if you need predefinedAbapType / refTo* support.`,
    );
  }
  if (!args.type_name) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `ECC CreateDataElement (type_kind='domain') requires type_name = domain name`,
    );
  }

  const domName = args.type_name.toUpperCase();

  const dd04v: Record<string, string> = {
    ROLLNAME: dataElementName,
    DDLANGUAGE: 'E',
    DOMNAME: domName,
    HEADLEN: '55',
    SCRLEN1: '10',
    SCRLEN2: '20',
    SCRLEN3: '40',
    DDTEXT: args.description || dataElementName,
    REPTEXT: args.medium_label || args.description || dataElementName,
    SCRTEXT_S: args.short_label || dataElementName.substring(0, 10),
    SCRTEXT_M: args.medium_label || args.description || dataElementName,
    SCRTEXT_L: args.long_label || args.description || dataElementName,
  };
  if (args.heading_label) {
    dd04v.REPTEXT = args.heading_label;
  }

  const payload_json = JSON.stringify({ dd04v });

  try {
    logger?.info(
      `ECC: creating data element ${dataElementName} via ZMCP_ADT_DDIC_DTEL`,
    );

    await callDdicDtel(connection, 'CREATE', {
      name: dataElementName,
      devclass: args.package_name,
      transport: args.transport_request,
      payload_json,
    });

    if (shouldActivate) {
      await callDdicActivate(connection, 'DTEL', dataElementName);
    }

    logger?.info(`✅ CreateDataElement (ECC) completed: ${dataElementName}`);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          data_element_name: dataElementName,
          package: args.package_name,
          transport_request: args.transport_request,
          data_type: args.data_type || null,
          status: shouldActivate ? 'active' : 'inactive',
          message: `Data element ${dataElementName} created${shouldActivate ? ' and activated' : ''} successfully (ECC fallback via OData)`,
          path: 'ecc-odata-rfc',
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(
      `ECC CreateDataElement error for ${dataElementName}: ${error?.message || error}`,
    );
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create data element ${dataElementName} (ECC fallback): ${error?.message || String(error)}`,
    );
  }
}
