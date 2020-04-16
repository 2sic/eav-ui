import { Observable } from 'rxjs';

import { ConnectorData } from './ConnectorData';
import { FieldConfig } from './FieldConfig';
import { ExperimentalProps } from './ExperimentalProps';

export interface Connector<T> {

  /** Current field configuration */
  field: FieldConfig;

  /** Observable on field configuration */
  field$: Observable<FieldConfig>;

  /** Current field data, read/write or get other languages */
  data: ConnectorData<T>;

  /** Opens component in dialog mode */
  expand(expand: boolean): void;

  /** Data not yet standardized */
  _experimental: ExperimentalProps;
}
