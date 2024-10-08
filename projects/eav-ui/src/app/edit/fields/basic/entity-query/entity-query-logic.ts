import { FieldSettingsEntityQuery } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';
import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityQuery;

  constructor() { super({ EntityQueryLogic }); }

  update(updateSpecs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityDefault) as EntityDefaultLogic;
    const s = entityDefaultLogic.update(updateSpecs) as FieldSettings & FieldSettingsEntityQuery;
    s.Query ??= '';
    s.StreamName ||= 'Default';
    s.UrlParameters ??= '';
    return s;
  }
}

FieldLogicBase.add(EntityQueryLogic);
