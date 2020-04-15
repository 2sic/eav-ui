import { ConnectorData } from './ConnectorData';
import { FieldConfig } from './FieldConfig';

export interface Connector<T> {

  /** Current field configuration */
  field: FieldConfig;

  /** Current field data, read/write or get other languages */
  data: ConnectorData<T>;
}
