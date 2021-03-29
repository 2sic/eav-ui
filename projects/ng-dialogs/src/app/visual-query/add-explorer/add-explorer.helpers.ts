import cloneDeep from 'lodash-es/cloneDeep';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DataSource, SortedDataSources } from '../models';

export function filterAndSortDataSources(dataSources: DataSource[], maxDifficulty: number) {
  if (!dataSources) { return; }

  const cloned = cloneDeep(dataSources);

  const filtered = cloned.filter(dataSource =>
    dataSource.Difficulty <= maxDifficulty
    && dataSource.PartAssemblyAndType !== eavConstants.pipelineDesigner.outDataSource.PartAssemblyAndType
  );

  filtered.sort((a, b) => a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase()));

  const sorted: SortedDataSources = {};
  for (const dataSource of filtered) {
    const type = dataSource.PrimaryType;
    if (sorted[type]) {
      sorted[type].push(dataSource);
    } else {
      sorted[type] = [dataSource];
    }
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
