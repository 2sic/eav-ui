import Papa from 'papaparse';
import { PickerOptionCustomExtended } from '../../../../../../../edit-types';
import { classLog } from '../../../../shared/logging';

const logSpecs = {
  all: false,
  parse: true,
};

export class DataSourceParserCsv {
  
  log = classLog({DataSourceParserCsv}, logSpecs);

  constructor() { }

  parse(csv: string): PickerOptionCustomExtended[] {

    const l = this.log.fnIf('parse', { csv });

    const x = Papa.parse<PickerOptionCustomExtended>(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string, header: string) => header == 'Value' ? value : value.trim(),
      dynamicTyping: true,  // auto-detect booleans, numbers, etc
    });

    // If no data, return empty array
    const data = x?.data;
    if (!data || !Array.isArray(data) || data.length == 0) return [];

    // Filter out all without a value property (but empty strings are ok)
    const filtered = data.filter(d => d.Value !== undefined);

    if (filtered.length != data.length)
      console.warn('CSV contains rows without a value', { data, filtered });

    // Use header to create empty object with all fields
    const header = x?.meta.fields ?? [];
    const preEmpty = header.reduce((acc, h) => ({
      ...acc,
      [h]: null }),
      {}
    ) as { [key: string]: any };
    const { Value, ...empty } = preEmpty;
    
    l.a('Parsed CSV', { header, empty, data, filtered });

    // Make sure all the rows have all the fields
    const complete = filtered.map(f => ({
      ...empty,
      ...f,
      Value: f.Value ?? '' // this is necessary, because the 'dynamicTyping' option will make it a null if it's empty
    }));

    return l.r(complete);
  }
}