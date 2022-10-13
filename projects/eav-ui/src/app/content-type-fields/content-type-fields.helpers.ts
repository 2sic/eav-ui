import { DataTypeConstants } from './constants/data-type.constants';

export function calculateTypeIcon(typeName: string): string {
  const typeIconMap: Record<string, string> = {
    [DataTypeConstants.Boolean]: 'toggle-on',
    [DataTypeConstants.Custom]: 'extension',
    [DataTypeConstants.DateTime]: 'today',
    [DataTypeConstants.Empty]: 'crop-free',
    [DataTypeConstants.Entity]: 'share',
    [DataTypeConstants.Hyperlink]: 'link',
    [DataTypeConstants.Number]: 'dialpad',
    [DataTypeConstants.String]: 'text-fields',
  };
  return typeIconMap[typeName] ?? 'device-unknown';
}
