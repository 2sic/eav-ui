import { BasicControlSettings } from './../../../../../../edit-types/src/BasicControlSettings';
import { FieldSettings } from './../../../../../../edit-types/src/FieldSettings';
import { EnvironmentInjector, Injectable, Injector, Signal, computed, createEnvironmentInjector, inject, runInInjectionContext, signal } from '@angular/core';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldState } from '../../fields/field-state';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, tap } from 'rxjs';
import { EmptyFieldHelpers } from '../basic/empty-field-helpers';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { mapUntilObjChanged } from '../../../shared/rxJs/mapUntilChanged';
import { RxHelpers } from '../../../shared/rxJs/rx.helpers';
import { FieldConfigSet } from '../field-config-set.model';
import { ControlStatus, controlToControlStatus, emptyControlStatus } from '../../shared/models/control-status.model';
import { CalculatedInputType } from '../../state/fields-configs.model';

const logThis = false;
const nameOfThis = 'FieldInjectorService';
const logDetailsOnFields = ['Boolean'];
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

  log = new EavLogger(nameOfThis, logThis);

  constructor() { }

  public getInjectors(fieldConfig: FieldConfigSet, inputType: CalculatedInputType) {
    const l = this.log.fn('getInjectors');
    const fieldName = fieldConfig.fieldName;

    // Conditional logger for detailed logging
    const lDetailed = this.log.fnCond(logDetailsOnFields.includes(fieldName), 'getInjectorsDetailed', { fieldConfig, inputType });

    // Create settings() and basics() signal for further use
    const settings$ = this.fieldsSettingsService.getFieldSettings$(fieldName);
    let settings: Signal<FieldSettings>;
    runInInjectionContext(this.injector, () => {
      settings = this.fieldsSettingsService.getFieldSettingsSignal(fieldName);
    });
    const basics = computed(() => BasicControlSettings.fromSettings(settings()), { equal: RxHelpers.objectsEqual });

    // Control and Control Status
    const control = this.group.controls[fieldName];
    let controlStatusChangeSignal: Signal<ControlStatus<unknown>>;

    // Create a signal to watch for value changes
    // Note: 2dm is not sure if this is a good thing to provide, since it could be misused
    // This signal spreads value changes even if they don't spread to the state/store
    // so we must be careful with what we do with it
    if (control) {
      runInInjectionContext(this.injector, () => {
        // disabled can be caused by settings in addition to the control status
        // since the control doesn't cause a `valueChanged` on disabled, we need to watch the settings
        const disabled$ = settings$.pipe(
          map(s => s.Disabled || s.ForcedDisabled),
          mapUntilObjChanged(m => m)
        );
        const controlStatus$ = combineLatest([control.valueChanges, disabled$]).pipe(
          tap(([_, disabled]) => lDetailed.a('valueChanges on control', { control, disabled })),
          mapUntilObjChanged(([_, disabled]) => controlToControlStatus(control, disabled)),
          tap(result => lDetailed.a('controlStatusChangeSignal', { result })),
        );

        // Settings to build the initial controlStatus
        const s = settings();
        controlStatusChangeSignal = toSignal(controlStatus$, {
          initialValue: controlToControlStatus(control, s.Disabled || s.ForcedDisabled)
        });
      });
    } else {
      // No control found - could be a problem, could be expected
      // If it's an empty message field, this is kind of expected, since it doesn't have a value control in the form
      if (!EmptyFieldHelpers.isEmptyField(inputType)) {
        console.error(`Error: can't create value-change signal for ${fieldName} - control not found. Input type is not empty, it's ${inputType.inputType}.`);
        // try to have a temporary result, so that in most cases it won't just fail
        controlStatusChangeSignal = signal(emptyControlStatus);
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

    return l.r({ injector, environmentInjector, fieldState });
  }
}
