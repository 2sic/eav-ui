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
import { ControlStatus, controlToControlStatus, emptyControlStatus } from '../../shared/controls/control-status.model';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { FieldValue } from '../../../../../../edit-types';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { PickerDataFactory } from '../picker/picker-data.factory';
import { classLog, logFnIf } from '../../../shared/logging';
import { InjectorBundle } from './injector-bundle.model';

const logSpecs = {
  getInjectors: true,
  fields: [] as string[], // example: ['Boolean'],
};

/**
 * This service creates custom injectors for each field.
 * It's used in the fields-builder to initialize dynamic controls.
 */
@Injectable()
export class FieldInjectorService {

  log = classLog({FieldInjectorService}, logSpecs);

  #injector = inject(Injector);
  #envInjector = inject(EnvironmentInjector);
  #fieldsSettingsService = inject(FieldsSettingsService);
  #entityForm = inject(EntityFormStateService);

  constructor() { }

  public getInjectors(fieldConfig: FieldConfigSet, inputType: InputTypeSpecs): InjectorBundle {
    const l = logFnIf(this, 'getInjectors');
    const fieldName = fieldConfig.fieldName;

    // Conditional logger for detailed logging
    const lDetailed = this.log.fnCond(this.log.specs.fields.includes(fieldName), 'getInjectorsDetailed', { fieldConfig, inputType });

    // Create settings() and basics() signal for further use
    const settings = this.#fieldsSettingsService.settings[fieldName];

    const settings$ = toObservable(settings, { injector: this.#injector });

    const basics = computedObj('basics', () => BasicControlSettings.fromSettings(settings()));

    // Control and Control Status
    const formGroup = this.#entityForm.formGroup();
    const control = formGroup.controls[fieldName];
    let controlStatusChangeSignal: Signal<ControlStatus<FieldValue>>;

    // Create a signal to watch for value changes
    // Note: 2dm is not sure if this is a good thing to provide, since it could be misused
    // This signal spreads value changes even if they don't spread to the state/store
    // so we must be careful with what we do with it
    if (control) {
      runInInjectionContext(this.#injector, () => {
        // disabled can be caused by settings in addition to the control status
        // since the control doesn't cause a `valueChanged` on disabled, we need to watch the settings
        const controlStatus$ = combineLatest([
          control.valueChanges,
          settings$.pipe(mapUntilObjChanged(s => s.uiDisabled)),
        ]).pipe(
          tap(([_, disabled]) => lDetailed.a('valueChanges on control', { control, disabled })),
          mapUntilObjChanged(([_, disabled]) => controlToControlStatus(control, disabled) as ControlStatus<FieldValue>),
          tap(result => lDetailed.a('controlStatusChangeSignal', { result })),
        );

        // Build controlStatus observable.
        // Should be changed to a pure signal without the observables probably in Angular 18
        // which probably has a signal for this as well...
        controlStatusChangeSignal = toSignal(controlStatus$, {
          initialValue: controlToControlStatus(control, settings().uiDisabled)
        });
      });
    } else {
      // No control found - could be a problem, could be expected
      // If it's an empty message field, this is kind of expected, since it doesn't have a value control in the form
      if (!InputTypeHelpers.isEmpty(inputType.inputType)) {
        console.error(`Error: can't create value-change signal for ${fieldName} - control not found. Input type is not empty, it's ${inputType.inputType}.`);
        // try to have a temporary result, so that in most cases it won't just fail
        controlStatusChangeSignal = signalObj('control-status-empty', emptyControlStatus);
      }
    }

    /** The UI Value changes - note that it can sometimes contain arrays, so we're using the strong equal */
    // TODO: this is probably better solved using a toSignal(control.valueChanges)
    const uiValue: Signal<FieldValue> = computedObj('uiValue', () => controlStatusChangeSignal().value);

    const pdf = new PickerDataFactory(this.#injector);

    const fieldState = new FieldState(
      fieldName,
      fieldConfig,
      formGroup,
      control,
      settings,
      basics,
      controlStatusChangeSignal,
      uiValue,
      this.#fieldsSettingsService.translationState[fieldName],
      pdf.createPickerData(inputType),
    );

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

    return l.r({ injector, environmentInjector, fieldState });
  }
}
