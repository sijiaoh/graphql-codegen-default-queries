import {extname} from 'path';
import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers';
import {buildScalarsFromConfig} from '@graphql-codegen/visitor-plugin-common';

export const plugin: PluginFunction = schema => {
  const scalars = buildScalarsFromConfig(schema, {});
  console.log(scalars);
  return '';
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
