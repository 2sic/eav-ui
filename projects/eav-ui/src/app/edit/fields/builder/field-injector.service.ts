import { EnvironmentInjector, Injectable, Injector, Signal, createEnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { combineLatest, tap } from 'rxjs';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { FeaturesScopedService } from '../../../features/features-scoped.service';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { classLog } from '../../../shared/logging';
import { mapUntilObjChanged } from '../../../shared/rxJs/mapUntilChanged';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { DebugFields } from '../../edit-debug';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { FieldState } from '../../fields/field-state';
import { EditRoutingService } from '../../routing/edit-routing.service';
import { UiControl } from '../../shared/controls/ui-control';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldConfigSet } from '../field-config-set.model';
import { BasicControlSettings } from './../../../../../../edit-types/src/BasicControlSettings';
import { InjectorBundle } from './injector-bundle.model';

const logSpecs = {
  getInjectors: true,
  fields: [...DebugFields] as string[], // example: ['Boolean'],
};

const detailedDebug = false;

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
  #entityFormStateSvc = inject(EntityFormStateService);
  #featuresSvc = inject(FeaturesScopedService);

  #editRoutingService = inject(EditRoutingService);

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
    const l = this.log.fnIf('getInjectors', { fieldConfig, inputType });

    const name = fieldConfig.fieldName;

    // Create settings() and basics() signal for further use
    const settings = this.#fieldsSettingsSvc.settings[name];
    const basics = computedObj('basics', () => BasicControlSettings.fromSettings(settings()));

    // Control and Control Status
    const formGroup = this.#entityFormStateSvc.formGroup;
    const control = formGroup.controls[name];    
    const controlStatusChangeSignal = this.#buildUiSignal(name, control, inputType, settings);

    /** The UI Value changes. Since it can also contain arrays, so we're using the strong equal */
    const uiValue: Signal<FieldValue> = (() => {
      if (!control) return signalObj('value-change-empty', null);
      const debouncedValue$ = control.valueChanges.pipe(
        // tap(v => console.warn('2dm value change on UI - before equals', v)),
        // distinctUntilChanged((p, c) => {
        //   const eq = isEqual(p, c);
        //   console.warn('2dm value change on UI - equals', p, c, eq);
        //   return eq;
        // }),
        mapUntilObjChanged(v => v),
        // tap(v => console.warn('2dm value change on UI - after equals', v)),
      );
      return toSignal(debouncedValue$, { injector: this.#injector, initialValue: control.value });
    })();

    const fieldState = new FieldState(
      name,
      fieldConfig,
      formGroup,
      settings,
      basics,
      controlStatusChangeSignal,
      uiValue,
      this.#fieldsSettingsSvc.translationState[name],
      this.#editRoutingService.isExpandedSignal(fieldConfig.index, fieldConfig.entityGuid, this.#injector),
      this.#fieldsSettingsSvc.pickerData[name] ?? null,
      this.#featuresSvc,
      this.#injector,
    );

    const injectors = this.#createInjectors(fieldState);
    return l.r(injectors);
  }

  /**
   * Create a signal for the control status - mainly disabled etc.
   */
  #buildUiSignal(fieldName: string, control: AbstractControl, inputType: InputTypeSpecs, settings: Signal<FieldSettings>): Signal<UiControl> {
    // Conditional logger for detailed logging
    const lDetailed = this.log.fnCond(this.log.specs.fields.includes(fieldName), 'buildControlChangeSignal', { fieldName, inputType });

    // Create a signal to watch for control-state changes
    if (control) {
      const settings$ = toObservable(settings, { injector: this.#injector });

      return runInInjectionContext(this.#injector, () => {
        // Watch the control for state changes - this is triggered on the ValueChanges
        // but we only want to continue triggering if a relevant state changed.
        const uiStateChange$ = control.valueChanges.pipe(
          mapUntilObjChanged(_ => ({ dirty: control.dirty, invalid: control.invalid, touched: control.touched, disabled: control.disabled })),
          tap(state => detailedDebug && console.error('controlStateChange', state)),
        );

        // disabled can be caused by settings in addition to the control status
        // since the control doesn't cause a `valueChanged` on disabled, we need to watch the settings
        const uiStatus$ = combineLatest([
          uiStateChange$,
          settings$.pipe(mapUntilObjChanged(s => s.uiDisabled)),
        ]).pipe(
          tap(([_, disabled]) => lDetailed.a('controlStateChange on control', { control, disabled })),
          mapUntilObjChanged(([_, disabled]) => new UiControl(control, fieldName, disabled)),
          tap(result => lDetailed.a('controlStatusChangeSignal', { result })),
        );

        // Build controlStatus observable.
        // Should be changed to a pure signal without the observables probably in Angular 18
        // which probably has a signal for this as well...
        return toSignal(uiStatus$, { initialValue: new UiControl(control, fieldName, settings().uiDisabled) });
      });
    }
    
    // No control found - could be a problem, could be expected
    // If it's an empty message field, this is kind of expected, since it doesn't have a value control in the form
    if (!InputTypeHelpers.isEmpty(inputType.inputType)) {
      console.error(`Error: can't create signal for control of ${fieldName} (not found). Input type is not empty, it's ${inputType.inputType}.`);
      // try to have a temporary result, so that in most cases it won't just fail
      return signalObj('control-status-empty', UiControl.emptyControl());
    }
    return null;
  }

  /**
   * Create the injector definitions to use for this field.
   */
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
