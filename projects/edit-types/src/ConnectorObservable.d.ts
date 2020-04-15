import { Observable } from 'rxjs';
import { Connector } from './Connector';
import { FieldConfig } from './FieldConfig';
import { ConnectorDataObservable } from './ConnectorDataObservable';

export interface ConnectorObservable<T> extends Connector<T> {

  /** Observable on field configuration */
  field$: Observable<FieldConfig>;

  /** Current field data, read/write or get other languages */
  data: ConnectorDataObservable<T>;
}
