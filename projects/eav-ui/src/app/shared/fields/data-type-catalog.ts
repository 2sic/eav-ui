export const DataTypeCatalog = {
  Boolean: 'Boolean',
  Custom: 'Custom',
  DateTime: 'DateTime',
  Empty: 'Empty',
  Entity: 'Entity',
  Hyperlink: 'Hyperlink',
  Number: 'Number',
  String: 'String',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type DataTypeStrict = typeof DataTypeCatalog[keyof typeof DataTypeCatalog];
