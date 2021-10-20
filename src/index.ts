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
} from 'graphql';

export const plugin: PluginFunction = schema => {
  const types = introspectionFromSchema(schema).__schema.types;
  const queryType = types.find(t => t.name === 'Query') as
    | IntrospectionObjectType
    | undefined;

  if (!queryType) throw new Error('Query not found!');

  const file = queryType.fields
    .map(field => {
      let fieldType:
        | IntrospectionNamedTypeRef<IntrospectionOutputType>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | IntrospectionListTypeRef<any>;

      if (field.type.kind === 'NON_NULL') fieldType = field.type.ofType;
      else fieldType = field.type;

      if (fieldType.kind === 'OBJECT') {
        const name = fieldType.name;
        const returnType = types.find(type => type.name === name) as
          | IntrospectionObjectType
          | undefined;

        if (!returnType) throw new Error('Return type not found!');

        const fields = returnType.fields.map(field => field.name).join(EOL);

        return `
          query ${field.name} {
            ${field.name} {
              ${fields}
            }
          }
        `;
      } else {
        return `
          query ${field.name} {
            ${field.name}
          }
        `;
      }
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
