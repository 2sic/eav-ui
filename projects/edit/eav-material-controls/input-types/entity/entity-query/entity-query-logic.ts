import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';

export class EntityQueryLogic extends EntityDefaultLogic {
  constructor() {
    super();
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = super.init(settings);
    if (fixedSettings.Query == null) { fixedSettings.Query = ''; }
    if (fixedSettings.StreamName == null || fixedSettings.StreamName === '') { fixedSettings.StreamName = 'Default'; }
    if (fixedSettings.UrlParameters == null) { fixedSettings.UrlParameters = ''; }
    return fixedSettings;
  }
}

export class EntityQueryLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.EntityQuery;
    FieldLogicManager.singleton().add(this);
  }

  update(settings: FieldSettings, value: string[]): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value);
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';
    return fixedSettings;
  }
}

const any = new EntityQueryLogic2();
