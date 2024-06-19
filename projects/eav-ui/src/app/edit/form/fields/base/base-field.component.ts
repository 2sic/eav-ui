import { Component, Input, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../../../edit-types';
import { ControlStatus, controlToControlStatus } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { FieldConfigSet, FieldControlConfig } from '../../builder/fields-builder/field-config-set.model';
import { Field } from '../../builder/fields-builder/field.model';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

// @Directive()
@Component({
  selector: 'app-base-field-component',
  template: ''
})
// tslint:disable-next-line:directive-class-suffix
export abstract class BaseFieldComponent<T = FieldValue> extends BaseComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;

  controlConfig: FieldControlConfig = {};

  control: AbstractControl;
  settings$: BehaviorSubject<FieldSettings>;

  controlStatus$: BehaviorSubject<ControlStatus<T>>;

  // new
  controlStatus = signal<ControlStatus<T>>(null);

  /**
   * The signal containing the settings - will be setup later, as we need the exact name
   * note that once the `config` is a signal input, we can change this.
   */
  protected settings = signal<FieldSettings>(null, { equal: RxHelpers.objectsEqual });
  basics = computed(() => BasicControlSettings.fromSettings(this.settings()), { equal: RxHelpers.objectsEqual });



  /** The Field-Settings-Service - experimental with new inject */
  public fieldsSettingsService = inject(FieldsSettingsService);

  // TODO: @2DM - GET RED OF THE FORMcONFIG HERE
  constructor(public log?: EavLogger) {
    super(log);
  }

  ngOnInit() {
    // Remember current control and publish status on signal (new) and observable (old)
    this.control = this.group.controls[this.config.fieldName];
    const initialControlStatus = controlToControlStatus<T>(this.control);
    this.controlStatus$ = new BehaviorSubject(initialControlStatus);
    this.controlStatus.set(initialControlStatus);
    this.control.valueChanges.subscribe(() => {
      const newStatus: ControlStatus<T> = controlToControlStatus(this.control);
      this.controlStatus$.next(newStatus);
      this.controlStatus.set(newStatus);
    });

    this.settings$ = new BehaviorSubject(this.fieldsSettingsService.getFieldSettings(this.config.fieldName));
    this.subscriptions.add(
      this.fieldsSettingsService.getFieldSettingsReplayed$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    // WIP
    this.subscriptions.add(this.settings$.subscribe(this.settings.set));
  }

  ngOnDestroy() {
    this.controlStatus$.complete();
    this.settings$.complete();
    super.ngOnDestroy();
  }
}

// function controlToStatus<T>(control: BaseFieldComponent<T>['control']): ControlStatus<T> {
//   const touched = control.touched;
//   const invalid = control.invalid;
//   return {
//     dirty: control.dirty,
//     disabled: control.disabled,
//     invalid,
//     touched,
//     touchedAndInvalid: touched && invalid,
//     value: control.value,
//   };
// }
