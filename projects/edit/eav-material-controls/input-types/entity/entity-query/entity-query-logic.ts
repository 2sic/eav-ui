import { FieldSettings } from '../../../../../edit-types';
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
