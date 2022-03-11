export const DataTypeConstants = {
  Boolean: 'Boolean',
  Custom: 'Custom',
  DateTime: 'DateTime',
  Empty: 'Empty',
  Entity: 'Entity',
  Hyperlink: 'Hyperlink',
  Number: 'Number',
  String: 'String',
} as const;

export type DataTypeConstant = typeof DataTypeConstants[keyof typeof DataTypeConstants];
