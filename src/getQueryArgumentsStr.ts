import {IntrospectionField, IntrospectionInputTypeRef} from 'graphql';
import {removeInputNonNullType} from './removeNonNullType';

export const getQueryArgumentsStr = (
  query: IntrospectionField
): {head: string; body: string} => {
  if (!query.args.length) return {head: '', body: ''};
  const head = query.args
    .map(arg => {
      let res = `$${arg.name}: `;

      const innerType = removeInputNonNullType(arg.type);
      const isList = innerType.kind === 'LIST';

      if (isList) res += '[';

      if (isList) {
        const trueType = innerType.ofType as IntrospectionInputTypeRef;
        const trueInnerType = removeInputNonNullType(trueType);

        if (trueInnerType.kind === 'LIST')
          throw new Error('Does not support 2d arrays.');

        res += trueInnerType.name;
        if (trueType.kind === 'NON_NULL') res += '!';
      } else {
        res += innerType.name;
      }

      if (isList) res += ']';

      if (arg.type.kind === 'NON_NULL') res += '!';
      return res;
    })
    .join(', ');

  const body = query.args.map(arg => `${arg.name}: $${arg.name}`).join(', ');

  return {head: `(${head})`, body: `(${body})`};
};
