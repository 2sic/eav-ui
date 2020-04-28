import cloneDeep from 'lodash-es/cloneDeep';
import { DataSource, SortedDataSources } from './data-sources.model';

export function filterAndSortDataSources(dataSources: DataSource[], maxDifficulty: number): SortedDataSources {
  const cloned = cloneDeep(dataSources);

  const filtered = cloned.filter(dataSource => dataSource.Difficulty <= maxDifficulty);

  filtered.sort((a, b) => a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase()));

  const sorted: SortedDataSources = {};
  for (const dataSource of filtered) {
    const type = dataSource.PartAssemblyAndType.substring(dataSource.PartAssemblyAndType.lastIndexOf('.') + 1);
    sorted[type] ? sorted[type].push(dataSource) : sorted[type] = [dataSource];
  }

  return sorted;
}

export function toggleInArray(item: string, array: string[]) {
  const index = array.indexOf(item);
  if (index === -1) {
    array.push(item);
  } else {
    array.splice(index, 1);
  }
}
