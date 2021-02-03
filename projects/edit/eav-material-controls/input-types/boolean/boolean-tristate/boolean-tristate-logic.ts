import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';

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

export class BooleanTristateLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.BooleanTristate;
    FieldLogicManager.singleton().add(this);
  }

  update(settings: FieldSettings, value: boolean | ''): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings._label = this.calculateLabel(value, fixedSettings);
    return fixedSettings;
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

const any = new BooleanTristateLogic2();
