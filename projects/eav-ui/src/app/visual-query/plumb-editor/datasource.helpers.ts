import { DataSource } from '../models';

export function findDefByType(dataSources: DataSource [], partAssemblyAndType: string): DataSource | undefined {
  return dataSources.find(ds => ds.PartAssemblyAndType === partAssemblyAndType)
}