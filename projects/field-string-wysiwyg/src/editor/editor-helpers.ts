import { Connector } from 'projects/edit-types';
import { Observable, distinctUntilChanged, map } from 'rxjs';

export function connectorToDisabled$(connector: Connector<string>): Observable<boolean> {
  return connector.field$.pipe(
    map(fc => fc.settings.Disabled || fc.settings.ForcedDisabled),
    distinctUntilChanged()
  );
}

export function registerCustomElement(tag: string, constructor: CustomElementConstructor) {
  if (customElements.get(tag)) return;
  customElements.define(tag, constructor);
}