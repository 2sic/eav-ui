import { DataTypeConstants } from './constants/data-type.constants';

export function calculateTypeIcon(typeName: string): string {
  const typeIconMap: Record<string, string> = {
    [DataTypeConstants.Boolean]: 'toggle_on',
    [DataTypeConstants.Custom]: 'extension',
    [DataTypeConstants.DateTime]: 'today',
    [DataTypeConstants.Empty]: 'crop_free',
    [DataTypeConstants.Entity]: 'share',
    [DataTypeConstants.Hyperlink]: 'link',
    [DataTypeConstants.Number]: 'dialpad',
    [DataTypeConstants.String]: 'text_fields',
  };
  return typeIconMap[typeName] ?? 'device_unknown';
}
