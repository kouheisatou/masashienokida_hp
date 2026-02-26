import { readFileSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'vitest';

// openapi.yml は backend/ の 2 つ上（リポジトリルート）にある
const OPENAPI_PATH = resolve(__dirname, '../../../../openapi.yml');

interface OpenApiSpec {
  components: {
    schemas: Record<string, unknown>;
  };
  paths: Record<
    string,
    Record<
      string,
      {
        operationId?: string;
        responses?: Record<
          string,
          {
            content?: {
              'application/json'?: {
                schema?: unknown;
              };
            };
          }
        >;
      }
    >
  >;
}

let _spec: OpenApiSpec | null = null;

function getSpec(): OpenApiSpec {
  if (!_spec) {
    _spec = yaml.load(readFileSync(OPENAPI_PATH, 'utf-8')) as OpenApiSpec;
  }
  return _spec;
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// $ref を components/schemas から解決するカスタムリゾルバー
function resolveRefs(schema: unknown, components: Record<string, unknown>): unknown {
  if (schema === null || typeof schema !== 'object') return schema;

  if (Array.isArray(schema)) {
    return schema.map((item) => resolveRefs(item, components));
  }

  const obj = schema as Record<string, unknown>;

  if ('$ref' in obj && typeof obj['$ref'] === 'string') {
    const refPath = obj['$ref'] as string;
    // '#/components/schemas/Foo' → 'Foo'
    const schemaName = refPath.replace('#/components/schemas/', '');
    const resolved = components[schemaName];
    if (!resolved) throw new Error(`$ref not found: ${refPath}`);
    return resolveRefs(resolved, components);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolveRefs(value, components);
  }
  return result;
}

/**
 * openapi.yml の operationId と HTTP ステータスコードを指定して、
 * レスポンスボディが JSON Schema に準拠しているか検証する。
 *
 * @example
 * validateResponse('getNews', 200, res.body);
 */
export function validateResponse(
  operationId: string,
  statusCode: number,
  body: unknown
): void {
  const spec = getSpec();
  const components = spec.components.schemas;

  // operationId に対応するレスポンススキーマを探す
  let targetSchema: unknown = null;

  outer: for (const pathItem of Object.values(spec.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (
        operation &&
        typeof operation === 'object' &&
        'operationId' in operation &&
        operation.operationId === operationId
      ) {
        const responses = operation.responses;
        const response = responses?.[statusCode.toString()];
        targetSchema = response?.content?.['application/json']?.schema ?? null;
        break outer;
      }
    }
  }

  if (!targetSchema) {
    // レスポンスボディなし（204 など）は検証スキップ
    return;
  }

  const resolved = resolveRefs(targetSchema, components);

  let validate: ReturnType<typeof ajv.compile>;
  try {
    validate = ajv.compile(resolved as object);
  } catch (e) {
    throw new Error(`Failed to compile schema for "${operationId}": ${e}`);
  }

  const valid = validate(body);
  if (!valid) {
    const errors = ajv.errorsText(validate.errors, { separator: '\n  ' });
    expect.fail(
      `Response does not match openapi.yml schema for "${operationId}" (status ${statusCode}):\n  ${errors}\n\nActual body: ${JSON.stringify(body, null, 2)}`
    );
  }
}
