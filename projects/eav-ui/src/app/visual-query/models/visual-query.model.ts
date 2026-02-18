import { DataSourceDefinition } from './data-source-definition';
import { QueryDefinition } from './query-definition';

export interface VisualQueryModel {
  DataSources: DataSourceDefinition[];
  Pipeline: QueryDefinition;
}


