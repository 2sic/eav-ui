export const DataTypeConstants = {
  String: 'String',
  Entity: 'Entity',
  Boolean: 'Boolean',
  Number: 'Number',
  Custom: 'Custom',
  DateTime: 'DateTime',
  Hyperlink: 'Hyperlink',
  Empty: 'Empty',
} as const;

export type DataTypeConstant = typeof DataTypeConstants[keyof typeof DataTypeConstants];
