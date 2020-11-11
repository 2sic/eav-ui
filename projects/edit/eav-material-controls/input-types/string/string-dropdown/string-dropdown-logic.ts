import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../../edit-types';
import { calculateDropdownOptions } from './string-dropdown.helpers';

export class StringDropdownLogic {
  constructor() { }

  update(settings$: Observable<FieldSettings>, value$: Observable<string>): Observable<FieldSettings> {
    return combineLatest([settings$, value$]).pipe(
      map(([settings, value]) => {
        const fixedSettings = { ...settings };
        fixedSettings.EnableTextEntry ||= false;
        fixedSettings._options = calculateDropdownOptions(value, fixedSettings.DropdownValues);
        return fixedSettings;
      }),
      share(),
    );
  }
}
