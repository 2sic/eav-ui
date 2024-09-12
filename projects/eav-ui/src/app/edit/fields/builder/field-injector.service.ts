import { BasicControlSettings } from './../../../../../../edit-types/src/BasicControlSettings';
import { EnvironmentInjector, Injectable, Injector, Signal, createEnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldState } from '../../fields/field-state';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, tap } from 'rxjs';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { mapUntilObjChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FieldConfigSet } from '../field-config-set.model';
import { UiControl } from '../../shared/controls/ui-control';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { classLog, logFnIf } from '../../../shared/logging';
import { InjectorBundle } from './injector-bundle.model';
import { AbstractControl } from '@angular/forms';

const logSpecs = {
  getInjectors: true,
  fields: [] as string[], // example: ['Boolean'],
};

/**
 * This service creates custom injectors for each field.
 * It's used in the fields-builder to initialize dynamic controls.
 */
@Injectable()
export class FieldStateInjectorFactory {

  log = classLog({FieldStateInjectorFactory}, logSpecs);

  #injector = inject(Injector);
  #envInjector = inject(EnvironmentInjector);
  #fieldsSettingsSvc = inject(FieldsSettingsService);
  #entityForm = inject(EntityFormStateService);

  constructor() { }

  /**
   * Get the injectors for a specific form field.
   * Requires that the angular form has already created the field.
   * 
   * IMPORTANT: It also has a side-effect that it adds picker data to the FieldStateService.
   * this is not elegant ATM.
   * @param fieldConfig 
   * @param inputType 
   * @returns an injector bundle with control and environment injectors
   */
  public getInjectors(fieldConfig: FieldConfigSet, inputType: InputTypeSpecs): InjectorBundle {
    const l = logFnIf(this, 'getInjectors', { fieldConfig, inputType });

    const name = fieldConfig.fieldName;

    // Create settings() and basics() signal for further use
    const settings = this.#fieldsSettingsSvc.settings[name];
    const basics = computedObj('basics', () => BasicControlSettings.fromSettings(settings()));

    // Control and Control Status
    const formGroup = this.#entityForm.formGroup;
    const control = formGroup.controls[name];    
    const controlStatusChangeSignal = this.#buildControlChangeSignal(name, control, inputType, settings);

    /** The UI Value changes - note that it can sometimes contain arrays, so we're using the strong equal */
    // TODO: this is probably better solved using a toSignal(control.valueChanges)
    const uiValue: Signal<FieldValue> = computedObj('uiValue', () => controlStatusChangeSignal().value);

    const fieldState = new FieldState(
      name,
      fieldConfig,
      formGroup,
      settings,
      basics,
      controlStatusChangeSignal,
      uiValue,
      this.#fieldsSettingsSvc.translationState[name],
      this.#fieldsSettingsSvc.pickerData[name] ?? null,
    );

    return l.r(this.#createInjectors(fieldState));
  }

  #buildControlChangeSignal(fieldName: string, control: AbstractControl<any, any>, inputType: InputTypeSpecs, settings: Signal<FieldSettings>
  ): Signal<UiControl> {
    // Conditional logger for detailed logging
    const lDetailed = this.log.fnCond(this.log.specs.fields.includes(fieldName), 'buildControlChangeSignal', { fieldName, inputType });

    const settings$ = toObservable(settings, { injector: this.#injector });

    // Create a signal to watch for value changes
    // Note: 2dm is not sure if this is a good thing to provide, since it could be misused
    // This signal spreads value changes even if they don't spread to the state/store
    // so we must be careful with what we do with it
    if (control) {
      // test 2dm
      // var a = new UiControl(control, true);
      // var b = new UiControl(control, true);
      // const equals = isEqual(a, b);
      // console.warn('2dm equals', equals);

      return runInInjectionContext(this.#injector, () => {
        // disabled can be caused by settings in addition to the control status
        // since the control doesn't cause a `valueChanged` on disabled, we need to watch the settings
        const controlStatus$ = combineLatest([
          control.valueChanges,
          settings$.pipe(mapUntilObjChanged(s => s.uiDisabled)),
        ]).pipe(
          tap(([_, disabled]) => lDetailed.a('valueChanges on control', { control, disabled })),
          mapUntilObjChanged(([_, disabled]) => new UiControl(control, fieldName, disabled)),
          tap(result => lDetailed.a('controlStatusChangeSignal', { result })),
        );

        // Build controlStatus observable.
        // Should be changed to a pure signal without the observables probably in Angular 18
        // which probably has a signal for this as well...
        return toSignal(controlStatus$, {
          initialValue: new UiControl(control, fieldName, settings().uiDisabled)
        });
      });
    }
    
    // No control found - could be a problem, could be expected
    // If it's an empty message field, this is kind of expected, since it doesn't have a value control in the form
    if (!InputTypeHelpers.isEmpty(inputType.inputType)) {
      console.error(`Error: can't create value-change signal for ${fieldName} - control not found. Input type is not empty, it's ${inputType.inputType}.`);
      // try to have a temporary result, so that in most cases it won't just fail
      return signalObj('control-status-empty', UiControl.emptyControl());
    }
    return null;
  }

  #createInjectors(fieldState: FieldState<FieldValue>) {
    const providers = [
      { provide: FieldState, useValue: fieldState },
    ];

    // Component injector, not actually sure if it's used, because standalone only use environmentInjector AFAIK
    const injector = Injector.create({
      providers: providers,
      parent: this.#injector,
      name: 'FieldInjector',
    });

    // Environment injector
    const environmentInjector = createEnvironmentInjector(
      providers,
      this.#envInjector,
      'FieldEnvInjector'
    );
    return { injector, environmentInjector };
  }
}
