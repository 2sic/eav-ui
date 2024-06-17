import { Component, Directive, Input, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../../../edit-types';
import { ControlStatus } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { FieldConfigSet, FieldControlConfig } from '../../builder/fields-builder/field-config-set.model';
import { Field } from '../../builder/fields-builder/field.model';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';

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

  // TODO: @2dg - get rid of this, replace with basics().label or basics().labelWithRequired
  label$: Observable<string>;

  // TODO: @2dg - get rid of this, replace with basics().placeholder
  placeholder$: Observable<string>;

  // TODO: @2dg - get rid of this, replace with basics().required
  required$: Observable<boolean>;

  /**
   * The signal containing the settings - will be setup later, as we need the exact name
   * note that once the `config` is a signal input, we can change this.
   */
  private settingsSignal = signal<FieldSettings>(null);
  basics = computed(() => BasicControlSettings.fromSettings(this.settingsSignal()))

  // TODO: @2DM - GET RED OF THE FORMcONFIG HERE
  constructor(public fieldsSettingsService: FieldsSettingsService) { super(); }

  ngOnInit() {
    // Remember current control and publish status on signal (new) and observable (old)
    this.control = this.group.controls[this.config.fieldName];
    const initialControlStatus = controlToStatus<T>(this.control);
    this.controlStatus$ = new BehaviorSubject(initialControlStatus);
    this.controlStatus.set(initialControlStatus);
    this.control.valueChanges.subscribe(() => {
      const newStatus: ControlStatus<T> = controlToStatus(this.control);
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
    this.subscriptions.add(this.settings$.subscribe(this.settingsSignal.set));

    this.label$ = this.settings$.pipe(map(settings => settings.Name), distinctUntilChanged());
    this.placeholder$ = this.settings$.pipe(map(settings => settings.Placeholder), distinctUntilChanged());
    this.required$ = this.settings$.pipe(map(settings => settings._currentRequired), distinctUntilChanged());
  }

  ngOnDestroy() {
    this.controlStatus$.complete();
    this.settings$.complete();
    super.ngOnDestroy();
  }
}

function controlToStatus<T>(control: BaseFieldComponent<T>['control']): ControlStatus<T> {
  const touched = control.touched;
  const invalid = control.invalid;
  return {
    dirty: control.dirty,
    disabled: control.disabled,
    invalid,
    touched,
    touchedAndInvalid: touched && invalid,
    value: control.value,
  };
}