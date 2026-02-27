import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { CustomGps } from '../../../../../../../edit-types/src/FieldSettings-CustomGps';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { CoordinatesDto } from './coordinates-dto';

export class CustomGpsSettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.CustomGps;

  constructor() { super({ CustomGpsSettingsHelper }); }

  update({ settings, tools }: FieldSettingsUpdateTask): FieldSettings {
    const global: CoordinatesDto = tools.eavConfig.settings?.Values["Settings.GoogleMaps.DefaultCoordinates"] as CoordinatesDto || null;
    const fixedSettings: FieldSettings & { _defaults: CustomGps['_defaults'] } = {
      ...settings,
      _defaults: global ? { lat: global.Latitude, lng: global.Longitude } : null,
    };
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(CustomGpsSettingsHelper);
