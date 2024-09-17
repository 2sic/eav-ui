import Papa from 'papaparse';
import { PickerOptionCustomExtended } from '../../../../../../../edit-types';


export class DataSourceParserCsv {
  
  constructor() { }

  parse(csv: string): PickerOptionCustomExtended[] {
    console.warn('2dm - parsing csv', { csv });

    const x = Papa.parse<PickerOptionCustomExtended>(csv, {
      header: true,
      skipEmptyLines: true,
      // transformHeader: (header: string) => header.trim(),
      // transform: (value: string, header: string) => value.trim(),
    });

    const data = x?.data;
    if (!data || !Array.isArray(data) || data.length == 0) return [];

    // Filter out all without a value
    const filtered = data.filter(d => d.Value);

    if (filtered.length != data.length)
      console.warn('CSV contains rows without a value', { data, filtered });

    console.warn(filtered);

    return filtered;
  }
}