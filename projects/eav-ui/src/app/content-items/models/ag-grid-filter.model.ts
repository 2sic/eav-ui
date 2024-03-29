import { NumberFilterModel, TextFilterModel } from '@ag-grid-community/core';
import { BooleanFilterModel } from '../../shared/components/boolean-filter/boolean-filter.model';
import { EntityFilterModel } from '../../shared/components/entity-filter/entity-filter.model';
import { PubMetaFilterModel } from '../pub-meta-filter/pub-meta-filter.model';

export interface AgGridFilterModel {
  [key: string]: PubMetaFilterModel | TextFilterModel | NumberFilterModel | BooleanFilterModel | EntityFilterModel;
}
