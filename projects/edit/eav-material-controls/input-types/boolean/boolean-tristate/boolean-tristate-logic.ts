import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../../edit-types';

export class BooleanTristateLogic {
  constructor() { }

  update(settings$: Observable<FieldSettings>, value$: Observable<boolean | ''>): Observable<FieldSettings> {
    return combineLatest([settings$, value$]).pipe(
      map(([settings, value]) => {
        const fixedSettings: FieldSettings = { ...settings };
        fixedSettings._label = this.calculateLabel(value, fixedSettings);
        return fixedSettings;
      }),
      share(),
    );
  }

  private calculateLabel(value: boolean | '', settings: FieldSettings): string {
    if (value === true && settings.TitleTrue != null && settings.TitleTrue !== '') {
      return settings.TitleTrue;
    }
    if (value === false && settings.TitleFalse != null && settings.TitleFalse !== '') {
      return settings.TitleFalse;
    }
    if (value === null && settings.TitleIndeterminate != null && settings.TitleIndeterminate !== '') {
      return settings.TitleIndeterminate;
    }
    return settings.Name;
  }
}
