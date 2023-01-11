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

export function calculateTypeLabel(typeName: string): string {
  const typeLabelMap: Record<string, string> = {
    [DataTypeConstants.Boolean]: 'Boolean (yes/no)',
    [DataTypeConstants.Custom]: 'Custom - ui-tools or custom types',
    [DataTypeConstants.DateTime]: 'Date and/or time',
    [DataTypeConstants.Empty]: 'Empty - for form-titles etc.',
    [DataTypeConstants.Entity]: 'Entity (other content-items)',
    [DataTypeConstants.Hyperlink]: 'Link / file reference',
    [DataTypeConstants.Number]: 'Number',
    [DataTypeConstants.String]: 'Text / string',
  };
  return typeLabelMap[typeName] ?? 'device_unknown';
}
