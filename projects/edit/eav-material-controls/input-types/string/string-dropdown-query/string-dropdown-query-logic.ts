import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';

export class StringDropdownQueryLogic extends EntityDefaultLogic {
  constructor() {
    super();
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = super.init(settings);
    if (fixedSettings.Value == null) { fixedSettings.Value = ''; }
    if (fixedSettings.Label == null) { fixedSettings.Label = ''; }
    if (fixedSettings.EnableTextEntry == null) { fixedSettings.EnableTextEntry = false; }
    if (fixedSettings.Separator == null || fixedSettings.Separator === '') { fixedSettings.Separator = ','; }
    return fixedSettings;
  }
}

export class StringDropdownQueryLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.StringDropdownQuery;
    FieldLogicManager.singleton().add(this);
  }

  init(settings: FieldSettings): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.init(settings);
    fixedSettings.Value ??= '';
    fixedSettings.Label ??= '';
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings.Separator ||= ',';
    return fixedSettings;
  }
}

const any = new StringDropdownQueryLogic2();
