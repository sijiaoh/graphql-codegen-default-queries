import {extname} from 'path';
import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers';
import {
  IntrospectionField,
  introspectionFromSchema,
  IntrospectionObjectType,
  IntrospectionType,
} from 'graphql';
import {getArgumentsStr} from './getArgumentsStr';
import {typeToFieldsStr} from './typeToFieldsStr';

const getFileFromQueryFields = (
  types: readonly IntrospectionType[],
  queryFields: readonly IntrospectionField[],
  queryType: 'query' | 'mutation'
) => {
  return queryFields
    .map(field => {
      const argumentsStr = getArgumentsStr(field);
      const fieldsStr = typeToFieldsStr(types, field.type);

      return `
          ${queryType} ${field.name}${argumentsStr.head} {
            ${field.name}${argumentsStr.body} ${fieldsStr}
          }
        `;
    })
    .join('\n');
};

export const plugin: PluginFunction = schema => {
  let file = '';
  const types = introspectionFromSchema(schema).__schema.types;

  const queriesType = types.find(t => t.name === 'Query') as
    | IntrospectionObjectType
    | undefined;
  if (queriesType) {
    file = getFileFromQueryFields(types, queriesType.fields, 'query');
  }

  const mutationsType = types.find(t => t.name === 'Mutation') as
    | IntrospectionObjectType
    | undefined;
  if (mutationsType) {
    file += getFileFromQueryFields(types, mutationsType.fields, 'mutation');
  }

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
