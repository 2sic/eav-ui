import { EnvironmentInjector, Injectable, Injector, Signal, computed, createEnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { FieldSettings } from 'projects/edit-types';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';
import { FieldState } from './field-state';
import { EntityFormStateService } from '../../entity-form-state.service';

@Injectable()
export class FieldInjectorService {

  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);
  private fieldsSettingsService = inject(FieldsSettingsService);

  private entityForm = inject(EntityFormStateService);
  private group = this.entityForm.formGroup();

  constructor() { }


  public getInjectors(fieldConfig: FieldConfigSet, isPreview: boolean) {
    // used for passing data to controls when fields have multiple controls (e.g. field and a preview)
    const controlConfig: FieldControlConfig = { isPreview };

    // 2024-06-18 2dm experimental new injector with fieldConfig etc.
    const fieldName = fieldConfig.fieldName;
    const settings$ = this.fieldsSettingsService.getFieldSettings$(fieldName);
    let settings: Signal<FieldSettings>;
    runInInjectionContext(this.injector, () => {
      settings = this.fieldsSettingsService.getFieldSettingsSignal(fieldName);
    });
    const basics = computed(() => BasicControlSettings.fromSettings(settings()), { equal: RxHelpers.objectsEqual });

    const fieldState = new FieldState(
      fieldName,
      fieldConfig,
      controlConfig,
      this.group,
      this.group.controls[fieldName],
      settings$,
      settings,
      basics,
    );

    const providers = [
      { provide: FieldState, useValue: fieldState },
    ];
    const componentInjector = Injector.create({
      providers: providers,
      parent: this.injector,
      name: 'FieldInjector',
    });

    const newEnvInjector = createEnvironmentInjector(
      providers,
      this.envInjector,
      'FieldEnvInjector'
    );

    return { injector: componentInjector, environmentInjector: newEnvInjector };
  }
}