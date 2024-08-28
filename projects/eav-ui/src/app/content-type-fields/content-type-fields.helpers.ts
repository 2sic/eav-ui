import { DataTypeCatalog } from '../shared/fields/data-type-catalog';

export function calculateTypeIcon(typeName: string): string {
  const typeIconMap: Record<string, string> = {
    [DataTypeCatalog.Boolean]: 'toggle_on',
    [DataTypeCatalog.Custom]: 'extension',
    [DataTypeCatalog.DateTime]: 'today',
    [DataTypeCatalog.Empty]: 'crop_free',
    [DataTypeCatalog.Entity]: 'share',
    [DataTypeCatalog.Hyperlink]: 'link',
    [DataTypeCatalog.Number]: 'dialpad',
    [DataTypeCatalog.String]: 'text_fields',
  };
  return typeIconMap[typeName] ?? 'device_unknown';
}

export function calculateTypeLabel(typeName: string): string {
  const typeLabelMap: Record<string, string> = {
    [DataTypeCatalog.Boolean]: 'Boolean (yes/no)',
    [DataTypeCatalog.Custom]: 'Custom - ui-tools or custom types',
    [DataTypeCatalog.DateTime]: 'Date and/or time',
    [DataTypeCatalog.Empty]: 'Empty - for form-titles etc.',
    [DataTypeCatalog.Entity]: 'Entity (other content-items)',
    [DataTypeCatalog.Hyperlink]: 'Link / file reference',
    [DataTypeCatalog.Number]: 'Number',
    [DataTypeCatalog.String]: 'Text / string',
  };
  return typeLabelMap[typeName] ?? 'device_unknown';
}
