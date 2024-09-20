import Papa from 'papaparse';
import { PickerOptionCustomExtended } from '../../../../../../../edit-types';

export class DataSourceParserCsv {
  
  constructor() { }

  parse(csv: string): PickerOptionCustomExtended[] {

    const x = Papa.parse<PickerOptionCustomExtended>(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string, header: string) => header == 'Value' ? value : value.trim(),
    });

    const data = x?.data;
    if (!data || !Array.isArray(data) || data.length == 0) return [];

    // Filter out all without a value property (but empty strings are ok)
    const filtered = data.filter(d => d.Value !== undefined);

    if (filtered.length != data.length)
      console.warn('CSV contains rows without a value', { data, filtered });

    return filtered;
  }
}