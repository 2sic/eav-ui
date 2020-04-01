import { TextFilterModel, NumberFilterModel } from '@ag-grid-community/all-modules';

import { PubMetaFilterModel } from '../ag-grid-components/pub-meta-filter/pub-meta-filter.model';
import { BooleanFilterModel } from '../../shared/components/boolean-filter/boolean-filter.model';

export interface AgGridFilterModel {
  [key: string]: PubMetaFilterModel | TextFilterModel | NumberFilterModel | BooleanFilterModel;
}
