import Papa from 'papaparse';


export class DataSourceParserCsv {
  
  constructor() { }

  parse(csv: string): unknown[] {
    console.warn('2dm - parsing csv', { csv });

    const x = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      // transformHeader: (header: string) => header.trim(),
      // transform: (value: string, header: string) => value.trim(),
    });

    const data = x?.data;
    if (!data || !Array.isArray(data) || data.length == 0) return [];

    

    console.warn(x);
  }
}