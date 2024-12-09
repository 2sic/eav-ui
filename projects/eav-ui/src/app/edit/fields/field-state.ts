import { effect, Injector, Signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Of } from '../../../../../core';
import { BasicControlSettings } from '../../../../../edit-types/src/BasicControlSettings';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { computedObj, signalObj } from '../../shared/signals/signal.utilities';
import { TranslationState } from '../localization/translate-state.model';
import { UiControl } from '../shared/controls/ui-control';
import { FieldConfigSet } from './field-config-set.model';
import { PickerData } from './picker/picker-data';

/**
 * This is provided / injected at the fields-builder for every single field.
 * So any control or service within that field, which requests this service, will get one containing exactly that fields.
 */
export class FieldState<TValue extends FieldValue = FieldValue, TSettings extends FieldSettings = FieldSettings> {
  constructor(
    /** The fields technical name to access settings etc. */
    public name: string,

    /** Field configuration, incl. a lot of unchanging values and access to adam, dropzone etc. */
    public config: FieldConfigSet,

    /** The form group containing the field - rarely relevant, as you should use the control in most cases */
    public group: UntypedFormGroup,

    // TODO: @2pp try to find out where this is used just to create a signal for a property
    /** The settings as a signal - use this for most cases */
    public settings: Signal<TSettings>,

    /** The basic settings - use this for most cases as it will change less than the settings signal */
    public basics: Signal<BasicControlSettings>,

    /**
     * The UI control (actually it's the virtual UI control), since it's a reactive form control.
     * Note: e just introduced uiValue below, which should be used in most cases
     */
    public ui: Signal<UiControl>,

    /** The value of the field in the UI control as a signal */
    public uiValue: Signal<TValue>,

    public translationState: Signal<TranslationState>,

    /** Signal if a dialog (popup) of this field is open, like a hyperlink-dialog */
    public isOpen: Signal<boolean>,

    pickerData: PickerData,

    featuresSvc: FeaturesScopedService,

    injectorForEffects: Injector,
  ) {
    this.#pickerData = pickerData;

    // Required Features Transfer
    effect(() => {
      const reqFeaturesFromSettings = this.requiredFeatures();
      if (reqFeaturesFromSettings.length == 0)
        return;
      for (const feature of reqFeaturesFromSettings)
        featuresSvc.requireFeature(feature, `Used in field ${this.name}`);
    }, { injector: injectorForEffects });

  }

  /**
   * Picker Data - will throw an error if accessed on a field which doesn't have PickerData
   * @readonly
   * @type {PickerData}
   */
  get pickerData(): PickerData {
    if (this.#pickerData)
      return this.#pickerData;
    throw new Error(`PickerData was not initialized for the field: ${this.name}`);
  }
  #pickerData: PickerData;

  /**
   * Cool helper to just get a single value-signal from the settings.
   * It will automatically
   * - ensure that you only use valid keys
   * - return a signal with that name
   * - the signal will be correctly typed as the setting value is typed
   * @param name property name of a FieldSettings
   * @returns the signal for that property, with isEqual change detection and name
   */
  setting<K extends keyof FieldSettings>(name: K): Signal<FieldSettings[K]> {
    return computedObj(name as string, () => this.settings()[name]);
  }

  settingExt<K extends keyof TSettings>(name: K): Signal<TSettings[K]> {
    return computedObj(name as string, () => this.settings()[name]);
  }

  // settingExt<TSet extends FieldSettings, K extends keyof TSet>(name: K): Signal<TSet[K]> {
  //   return computedObj(name as string, () => (this.settings() as unknown as TSet)[name]);
  // }

  //#region Required Features

  #reqFeaturesMy = signalObj<Of<typeof FeatureNames>[]>('requiredFeatures', []);
  #reqFeaturesFromSettings = this.setting('requiredFeatures');

  requiredFeatures = computedObj('requiredFeatures', () => {
    const merged = [
      ...this.#reqFeaturesMy(),
      ...this.#reqFeaturesFromSettings() ?? [],
    ];
    // make distinct
    return Array.from(new Set(merged));
  });

  requireFeature(feature: Of<typeof FeatureNames>) {
    const current = this.#reqFeaturesMy();
    if (!current.includes(feature))
      this.#reqFeaturesMy.set([...current, feature]);
  }

  //#endregion
}
