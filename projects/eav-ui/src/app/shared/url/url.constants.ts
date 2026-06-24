export const PREFIX = {
  Prefill: 'prefill:',
  UiFields: 'uifields:',
  Params: 'parameters:',
  Copy: 'copy:',
  Save: 'save:',
  Data: 'data64:',
} as const;

export const SEPARATOR = {
  Item: ',',
  Val: '&',
  List: ':',
  Metadata: '~',
} as const;



export function toOrderedParams(values: unknown[]): string {
  return values.join(SEPARATOR.List);
}
