import {
  IntrospectionInputType,
  IntrospectionInputTypeRef,
  IntrospectionListTypeRef,
  IntrospectionNamedTypeRef,
  IntrospectionOutputType,
  IntrospectionOutputTypeRef,
} from 'graphql';

export const removeNonNullType = (
  type: IntrospectionOutputTypeRef
):
  | IntrospectionNamedTypeRef<IntrospectionOutputType>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | IntrospectionListTypeRef<any> => {
  if (type.kind === 'NON_NULL') return type.ofType;
  else return type;
};

export const removeInputNonNullType = (
  type: IntrospectionInputTypeRef
):
  | IntrospectionNamedTypeRef<IntrospectionInputType>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | IntrospectionListTypeRef<any> => {
  if (type.kind === 'NON_NULL') return type.ofType;
  else return type;
};
