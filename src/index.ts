import {extname} from 'path';
import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers';
import {introspectionFromSchema, IntrospectionObjectType} from 'graphql';
import {getQueryArgumentsStr} from './getQueryArgumentsStr';
import {removeNonNullType} from './removeNonNullType';
import {typeToFieldsStr} from './typeToFieldsStr';

export const plugin: PluginFunction = schema => {
  const types = introspectionFromSchema(schema).__schema.types;
  const queriesType = types.find(t => t.name === 'Query') as
    | IntrospectionObjectType
    | undefined;

  if (!queriesType) throw new Error('Query not found!');

  const file = queriesType.fields
    .map(query => {
      const queryType = removeNonNullType(query.type);
      const argumentsStr = getQueryArgumentsStr(query);
      const fieldsStr = typeToFieldsStr(types, query, queryType);

      return `
        query ${query.name}${argumentsStr.head} {
          ${query.name}${argumentsStr.body} ${fieldsStr}
        }
      `;
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
