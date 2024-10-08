import { FieldSettings, HyperlinkLibrary } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class HyperlinkLibraryLogic extends FieldLogicBase {
  name = InputTypeCatalog.HyperlinkLibrary;

  constructor() { super({ HyperlinkLibraryLogic }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & HyperlinkLibrary;
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkLibraryLogic);
