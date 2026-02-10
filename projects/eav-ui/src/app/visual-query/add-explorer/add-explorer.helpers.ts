import cloneDeep from 'lodash-es/cloneDeep';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DataSourceInstance } from '../models/data-source-instance.model';

export function filterAndSortDataSources(dataSources: DataSourceInstance[], maxDifficulty: number) {
  if (!dataSources)
    return;

  const cloned = cloneDeep(dataSources);

  const filtered = cloned.filter(dataSource =>
    dataSource.Difficulty <= maxDifficulty
    && dataSource.PartAssemblyAndType !== eavConstants.pipelineDesigner.outDataSource.PartAssemblyAndType
  );

  filtered.sort((a, b) => a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase()));

  const sorted: Record<string, DataSourceInstance[]> = {};
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
