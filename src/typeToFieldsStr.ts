import {EOL} from 'os';
import {
  IntrospectionField,
  IntrospectionObjectType,
  IntrospectionType,
} from 'graphql';
import {removeNonNullType} from './removeNonNullType';

export const typeToFieldsStr = (
  types: readonly IntrospectionType[],
  query: IntrospectionField,
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
      {
        ${fields}
      }
    `;
  } else if (type.kind === 'LIST') {
    const innerType = removeNonNullType(type.ofType);
    return typeToFieldsStr(types, query, innerType);
  } else {
    return '';
  }
};
