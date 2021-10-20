import {EOL} from 'os';
import {extname} from 'path';
import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers';
import {
  introspectionFromSchema,
  IntrospectionListTypeRef,
  IntrospectionNamedTypeRef,
  IntrospectionObjectType,
  IntrospectionOutputType,
  IntrospectionOutputTypeRef,
} from 'graphql';

const removeNonNullType = (
  type: IntrospectionOutputTypeRef
):
  | IntrospectionNamedTypeRef<IntrospectionOutputType>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | IntrospectionListTypeRef<any> => {
  if (type.kind === 'NON_NULL') return type.ofType;
  else return type;
};

export const plugin: PluginFunction = schema => {
  const types = introspectionFromSchema(schema).__schema.types;
  const queriesType = types.find(t => t.name === 'Query') as
    | IntrospectionObjectType
    | undefined;

  if (!queriesType) throw new Error('Query not found!');

  const file = queriesType.fields
    .map(query => {
      const queryType = removeNonNullType(query.type);

      const typeToQueryString = (
        type: ReturnType<typeof removeNonNullType>
      ): string => {
        if (type.kind === 'OBJECT') {
          const name = type.name;
          const returnType = types.find(type => type.name === name) as
            | IntrospectionObjectType
            | undefined;

          if (!returnType) throw new Error('Return type not found!');

          const fields = returnType.fields.map(field => field.name).join(EOL);

          return `
            query ${query.name} {
              ${query.name} {
                ${fields}
              }
            }
          `;
        } else if (type.kind === 'LIST') {
          const innerType = removeNonNullType(type.ofType);
          return typeToQueryString(innerType);
        } else {
          return `
            query ${query.name} {
              ${query.name}
            }
          `;
        }
      };
      return typeToQueryString(queryType);
    })
    .join('\n');

  return file;
};

export const validate: PluginValidateFn = (
  _schema,
  _documents,
  _config,
  outputFile,
  allPlugins
) => {
  const singlePlugin = allPlugins.length === 1;

  if (singlePlugin && extname(outputFile) !== '.graphql') {
    throw new Error(
      'Plugin "graphql-codegen-default-queries" requires extension to be ".graphql"!'
    );
  }
};
