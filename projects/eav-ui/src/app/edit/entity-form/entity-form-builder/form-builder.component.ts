import { AbstractControlPro } from './../../shared/validation/validation.helpers';
import { Component, Injector, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntityFormComponent } from '../entity-form-component/entity-form.component';
import { EntityFormStateService } from '../entity-form-state.service';
import { FormulaDesignerService } from '../../formulas/designer/formula-designer.service';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { FormFieldsBuilderService } from './form-fields-builder.service';
import { transient } from '../../../core';
import { FormFieldsSyncService } from './form-fields-sync.service';
import { classLog } from '../../../shared/logging';
import { EntityFormSyncService } from '../entity-form-sync.service';
import { filter, map, Observable, take } from 'rxjs';
import { FieldInitSpecs } from './field-init-specs.model';
import { toObservable } from '@angular/core/rxjs-interop';

const logSpecs = {
  all: false,
  getFieldsToProcess: true,
  ngOnInit: false,
}

@Component({
  selector: 'app-edit-entity-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EntityFormComponent,
  ],
  providers: [
    FieldsSettingsService,  // used for all field settings - must be shared from here
    FieldsTranslateService, // used for field translations and uses FieldsSettingsService, so also shared here
    EntityFormStateService, // used for sharing information about this entity form
  ],
})
export class EntityFormBuilderComponent implements OnInit, OnDestroy {

  log = classLog({EntityFormBuilderComponent}, logSpecs, true);

  @Input() entityGuid: string;

  /** Inject and start the form state service */
  #formStateSvc = inject(EntityFormStateService);
  form = this.#formStateSvc.formGroup;

  #formulaDesignerService = inject(FormulaDesignerService);

  #formFieldsBuilderService = transient(FormFieldsBuilderService);
  #fieldsSyncSvc = transient(FormFieldsSyncService);
  #formSyncSvc = transient(EntityFormSyncService);

  constructor(
    private fieldsSettingsSvc: FieldsSettingsService,
    private fieldsTranslateSvc: FieldsTranslateService,
    private injector: Injector,
  ) {
  }

  ngOnInit() {
    const l = this.log.fnIf('ngOnInit');
    this.fieldsSettingsSvc.init(this.entityGuid);
    this.#formulaDesignerService.itemSettingsServices[this.entityGuid] = this.fieldsSettingsSvc;
    this.fieldsTranslateSvc.init(this.entityGuid);

    const ftp$ = this.getFieldsToProcess$();

    // Create all the controls in the form right at the beginning
    ftp$.pipe(take(1)).subscribe(allFields => this.#formFieldsBuilderService.createFields(this.entityGuid, this.form, allFields));

    this.#fieldsSyncSvc.keepFieldsAndStateInSync(this.form, ftp$);
    
    // Sync state to parent: dirty, isValid, value changes
    this.#formSyncSvc.setupSync(this.entityGuid);

    l.end();
  }

  ngOnDestroy() {
    this.fieldsSettingsSvc.disableForCleanUp();
    Object.values(this.form.controls).forEach((control: AbstractControlPro) => {
      control._warning$.complete();
    });
  }

  getFieldsToProcess$(): Observable<FieldInitSpecs[]> {
    const l = this.log.fnIf('getFieldsToProcess');
    const form = this.form;

    const fieldProps = this.fieldsSettingsSvc.allProps;
    const fieldProps$ = toObservable(fieldProps, { injector: this.injector });

    // 1. Prepare: Take field props and enrich initial values and input types
    const fieldsToProcess: Observable<FieldInitSpecs[]> = fieldProps$.pipe(
      filter(fields => fields != null && Object.keys(fields).length > 0),
      map(allFields => {
        const fields: FieldInitSpecs[] = Object.entries(allFields).map(([fieldName, fieldProps]) => {
          const hasControl = form.controls.hasOwnProperty(fieldName);
          const control = hasControl ? form.controls[fieldName] : null;
          return {
            name: fieldName,
            props: fieldProps,
            inputType: fieldProps.constants.inputTypeSpecs.inputType,
            value: fieldProps.value,
            hasControl,
            control,
          } satisfies FieldInitSpecs;
        });
        return fields;
      }),
    );
    return l.rSilent(fieldsToProcess);
  }
}
