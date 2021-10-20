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
  const queryType = introspectionFromSchema(schema).__schema.types.find(
    t => t.name === 'Query'
  ) as IntrospectionObjectType | undefined;

  if (!queryType) throw new Error('Query not found');

  const file = queryType.fields
    .map(field => {
      let type:
        | IntrospectionNamedTypeRef<IntrospectionOutputType>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | IntrospectionListTypeRef<any>;

      if (field.type.kind === 'NON_NULL') type = field.type.ofType;
      else type = field.type;

      if (type.kind === 'SCALAR') {
        return `
          query ${field.name} {
            ${field.name}
          }
        `;
      }

      return '';
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
