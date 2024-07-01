import { EnvironmentInjector, Injectable, Injector, Signal, computed, createEnvironmentInjector, inject, runInInjectionContext, signal } from '@angular/core';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { FieldSettings } from 'projects/edit-types';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';
import { FieldConfigSet } from './field-config-set.model';
import { FieldState } from './field-state';
import { EntityFormStateService } from '../../entity-form-state.service';
import { CalculatedInputType, ControlStatus, controlToControlStatus } from '../../../shared/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { mapUntilObjChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';
import { EmptyFieldHelpers } from '../../fields/empty/empty-field-helpers';

/**
 * This service creates custom injectors for each field.
 * It's used in the fields-builder to initialize dynamic controls.
 */
@Injectable()
export class FieldInjectorService {

  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);
  private fieldsSettingsService = inject(FieldsSettingsService);

  private entityForm = inject(EntityFormStateService);
  private group = this.entityForm.formGroup();

  constructor() { }

  public getInjectors(fieldConfig: FieldConfigSet, inputType: CalculatedInputType) {
    // Create settings() and basics() signal for further use
    const fieldName = fieldConfig.fieldName;
    const settings$ = this.fieldsSettingsService.getFieldSettings$(fieldName);
    let settings: Signal<FieldSettings>;
    runInInjectionContext(this.injector, () => {
      settings = this.fieldsSettingsService.getFieldSettingsSignal(fieldName);
    });
    const basics = computed(() => BasicControlSettings.fromSettings(settings()), { equal: RxHelpers.objectsEqual });

    // Control and Control Status
    const control = this.group.controls[fieldName];
    let controlStatusChangeSignal: Signal<ControlStatus<unknown>>;

    // if (fieldName === 'Icon')
    //   console.log('2dg - FieldInjectorService.getInjectors - control:', control);

    // Create a signal to watch for value changes
    // Note: 2dm is not sure if this is a good thing to provide, since it could be misused
    // This signal spreads value changes even if they don't spread to the state/store
    // so we must be careful with what we do with it
    if (control) {
      runInInjectionContext(this.injector, () => {
        controlStatusChangeSignal = toSignal(control.valueChanges.pipe(
          mapUntilObjChanged(_ => controlToControlStatus(control)
        )), { initialValue: controlToControlStatus(control) });
      });
    } else {
      // No control found - could be a problem, could be expected
      // If it's an empty message field, this is kind of expected, since it doesn't have a value control in the form
      if (!EmptyFieldHelpers.isEmptyField(inputType)) {
        console.error(`Error: can't create value-change signal for ${fieldName} - control not found. Input type is not empty, it's ${inputType.inputType}.`);
        // try to have a temporary result, so that in most cases it won't just fail
        controlStatusChangeSignal = signal({ value: null, disabled: true, dirty: false, invalid: false, touched: false, touchedAndInvalid: false } satisfies ControlStatus<unknown>);
      }
    }


    const fieldState = new FieldState(
      fieldName,
      fieldConfig,
      this.group,
      control,
      settings$,
      settings,
      basics,
      controlStatusChangeSignal,
    );

    const providers = [
      { provide: FieldState, useValue: fieldState },
    ];

    // Component injector, not actually sure if it's used, because standalone only use environmentInjector AFAIK
    const injector = Injector.create({
      providers: providers,
      parent: this.injector,
      name: 'FieldInjector',
    });

    // Environment injector
    const environmentInjector = createEnvironmentInjector(
      providers,
      this.envInjector,
      'FieldEnvInjector'
    );

    return { injector, environmentInjector, fieldState };
  }
}
