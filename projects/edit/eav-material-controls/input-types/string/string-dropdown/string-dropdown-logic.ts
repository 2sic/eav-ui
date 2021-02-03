import { combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';
import { calculateDropdownOptions } from './string-dropdown.helpers';

export class StringDropdownLogic {
  constructor() { }

  update(settings$: Observable<FieldSettings>, value$: Observable<string>): Observable<FieldSettings> {
    return combineLatest([settings$, value$]).pipe(
      map(([settings, value]) => {
        const fixedSettings: FieldSettings = { ...settings };
        fixedSettings.EnableTextEntry ||= false;
        fixedSettings._options = calculateDropdownOptions(value, fixedSettings.DropdownValues);
        return fixedSettings;
      }),
      share(),
    );
  }
}

export class StringDropdownLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.StringDropdown;
    FieldLogicManager.singleton().add(this);
  }

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings._options = calculateDropdownOptions(value, fixedSettings.DropdownValues);
    return fixedSettings;
  }
}

const any = new StringDropdownLogic2();
