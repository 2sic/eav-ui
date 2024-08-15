import { mapUntilChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';
import { Connector } from 'projects/edit-types';
import { Observable, map } from 'rxjs';

export function connectorToDisabled$(connector: Connector<string>): Observable<boolean> {
  return connector.field$.pipe(
    map(fc => fc.settings.Disabled || fc.settings.ForcedDisabled),
    mapUntilChanged(m => m),
    // distinctUntilChanged()
  );
}

export function registerCustomElement(tag: string, constructor: CustomElementConstructor) {
  if (customElements.get(tag)) return;
  customElements.define(tag, constructor);
}
