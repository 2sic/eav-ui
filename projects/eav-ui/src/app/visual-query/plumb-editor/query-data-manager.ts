import { classLog } from '../../shared/logging';
import { DataSourceInstance } from '../models/data-source-instance.model';
import { VisualQueryModel } from '../models/visual-query.model';
import { DataSourceSet } from './data-source-set.model';
import { findDefByType } from './datasource.helpers';
import { domIdOfGuid, guidOfDomId } from './plumber-constants';

const logSpecs = {
  all: false,
  findDataSourceAndDom: false,
  // fields: ['TestIn2', 'Default'],
}

export class QueryDataManager {
  log = classLog({QueryDataManager}, logSpecs);

  constructor(
    private jsPlumbRoot: HTMLElement, 
    public query: VisualQueryModel,
    public dataSources: DataSourceInstance[]
  ) { }

  findDomAndDef(guid: string, partAssemblyAndType: string): (DataSourceSet & { definition: DataSourceInstance }) | null {
    const dsSet = this.findDataSourceAndDom(guid);
    if (!dsSet)
      return null;
    const dsDef = findDefByType(this.dataSources, partAssemblyAndType);
    if (!dsDef)
      return null;
    return { ...dsSet, definition: dsDef };
  }

  findDataSourceAndDom(sourceElementId: string) : DataSourceSet | null {
    const l = this.log.fnIf('findDataSourceAndDom', { sourceElementId });

    // if DOM doesn't exist, do nothing
    const domDataSource = this.jsPlumbRoot.querySelector<HTMLElement>('#' + domIdOfGuid(sourceElementId));
    if (!domDataSource)
      return l.r(null, "DOM not found, exit");

    const guid = guidOfDomId(domDataSource.id);
    const dataSource = this.query.DataSources.find(pipeDs => pipeDs.EntityGuid === guid);
    return l.r({ domDataSource, dataSource }, "returning data source");
  }
}

