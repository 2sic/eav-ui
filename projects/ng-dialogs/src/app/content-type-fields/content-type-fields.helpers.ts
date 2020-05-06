import { DataTypeConstants } from './constants/data-type.constants';

export function calculateTypeIcon(typeName: string): string {
  switch (typeName) {
    case DataTypeConstants.String:
      return 'text_fields';
    case DataTypeConstants.Entity:
      return 'share';
    case DataTypeConstants.Boolean:
      return 'toggle_on';
    case DataTypeConstants.Number:
      return 'dialpad';
    case DataTypeConstants.Custom:
      return 'extension';
    case DataTypeConstants.DateTime:
      return 'today';
    case DataTypeConstants.Hyperlink:
      return 'link';
    case DataTypeConstants.Empty:
      return 'crop_free';
    default:
      return 'device_unknown';
  }
}
