import { Observable } from 'rxjs';
import { mapUntilChanged } from '../../../eav-ui/src/app/shared/rxJs/mapUntilChanged';
import { Connector } from '../../../edit-types/index-for-documentation';

export function connectorToDisabled$(connector: Connector<string>): Observable<boolean> {
  return connector.field$.pipe(
    mapUntilChanged(fc => fc.settings.uiDisabled),
  );
}

export function registerCustomElement(tag: string, constructor: CustomElementConstructor) {
  if (customElements.get(tag)) return;
  customElements.define(tag, constructor);
}
