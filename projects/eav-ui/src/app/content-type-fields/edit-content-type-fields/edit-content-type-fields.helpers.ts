import { DataTypeConstants } from '../constants/data-type.constants';
import { calculateTypeIcon, calculateTypeLabel } from '../content-type-fields.helpers';

const dataTypeLabels: Record<string, { label: string, description: string }> = {
  Boolean: { label: calculateTypeLabel(DataTypeConstants.Boolean), description: 'Yes/no or true/false values' },
  Custom: { label: calculateTypeLabel(DataTypeConstants.Custom), description: 'Use for things like gps-pickers (which writes into multiple fields) or for custom-data which serializes something exotic into the db like an array, a custom json or anything' },
  DateTime: { label: calculateTypeLabel(DataTypeConstants.DateTime), description: 'For date, time or combined values' },
  Empty: { label: calculateTypeLabel(DataTypeConstants.Empty), description: 'Use to structure your form' },
  Entity: { label: calculateTypeLabel(DataTypeConstants.Entity), description: 'One or more other content-items' },
  Hyperlink: { label: calculateTypeLabel(DataTypeConstants.Hyperlink), description: 'Hyperlink or reference to a picture / file' },
  Number: { label: calculateTypeLabel(DataTypeConstants.Number), description: 'Any kind of number' },
  String: { label: calculateTypeLabel(DataTypeConstants.String), description: 'Any kind of text' },
};

export interface DataType {
  name: string;
  label: string;
  icon: string;
  description: string;
}

export function calculateDataTypes(rawDataTypes: string[]): DataType[] {
  const dataTypes: DataType[] = [];
  for (const rawDataType of rawDataTypes) {
    dataTypes.push({
      name: rawDataType,
      label: dataTypeLabels[rawDataType].label,
      icon: calculateTypeIcon(rawDataType),
      description: dataTypeLabels[rawDataType].description,
    });
  }
  return dataTypes;
}
