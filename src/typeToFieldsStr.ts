import {EOL} from 'os';
import {
  IntrospectionObjectType,
  IntrospectionOutputTypeRef,
  IntrospectionType,
} from 'graphql';
import {removeNonNullType} from './removeNonNullType';

export const typeToFieldsStr = (
  types: readonly IntrospectionType[],
  queryType: IntrospectionOutputTypeRef
): string => {
  const type = removeNonNullType(queryType);
  if (type.kind === 'OBJECT') {
    const name = type.name;
    const returnType = types.find(type => type.name === name) as
      | IntrospectionObjectType
      | undefined;

    if (!returnType) throw new Error('Return type not found!');

    const fields = returnType.fields.map(field => field.name).join(EOL);

    return `
      {
        ${fields}
      }
    `;
  } else if (type.kind === 'LIST') {
    return typeToFieldsStr(types, type.ofType);
  } else {
    return '';
  }
};
