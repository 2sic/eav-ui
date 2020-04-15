import { Observable } from 'rxjs';
import { ConnectorData } from './ConnectorData';

export interface ConnectorDataObservable<T> extends ConnectorData<T> {

  /** Observable on field value */
  value$: Observable<T>;

  /** Fired before form is saved */
  forceConnectorSave$: Observable<T>;
}
