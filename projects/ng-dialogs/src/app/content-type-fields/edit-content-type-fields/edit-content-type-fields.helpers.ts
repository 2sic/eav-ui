import { calculateTypeIcon } from '../content-type-fields.helpers';

const dataTypeLabels: Record<string, { label: string, description: string }> = {
  Boolean: { label: 'Boolean (yes/no)', description: 'Yes/no or true/false values' },
  Custom: { label: 'Custom - ui-tools or custom types', description: 'Use for things like gps-pickers (which writes into multiple fields) or for custom-data which serializes something exotic into the db like an array, a custom json or anything' },
  DateTime: { label: 'Date and/or time', description: 'For date, time or combined values' },
  Empty: { label: 'Empty - for form-titles etc.', description: 'Use to structure your form' },
  Entity: { label: 'Entity (other content-items)', description: 'One or more other content-items' },
  Hyperlink: { label: 'Link / file reference', description: 'Hyperlink or reference to a picture / file' },
  Number: { label: 'Number', description: 'Any kind of number' },
  String: { label: 'Text / string', description: 'Any kind of text' },
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
