import { NumberFilterModel, TextFilterModel } from '@ag-grid-community/all-modules';
import { BooleanFilterModel } from '../../shared/components/boolean-filter/boolean-filter.model';
import { EntityFilterModel } from '../../shared/components/entity-filter/entity-filter.model';
import { PubMetaFilterModel } from '../ag-grid-components/pub-meta-filter/pub-meta-filter.model';

export interface AgGridFilterModel {
  [key: string]: PubMetaFilterModel | TextFilterModel | NumberFilterModel | BooleanFilterModel | EntityFilterModel;
}
