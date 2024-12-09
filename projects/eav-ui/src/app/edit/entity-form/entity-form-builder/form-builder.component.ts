import { Component, inject, Injector, input, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { filter, map, Observable, take } from 'rxjs';
import { transient } from '../../../../../../core';
import { classLog } from '../../../shared/logging';
import { FormulaDesignerService } from '../../formulas/designer/formula-designer.service';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { EntityFormComponent } from '../entity-form-component/entity-form.component';
import { EntityFormStateService } from '../entity-form-state.service';
import { EntityFormSyncService } from '../entity-form-sync.service';
import { FieldInitSpecs } from './field-init-specs.model';
import { FormFieldsBuilderService } from './form-fields-builder.service';
import { FormFieldsSyncService } from './form-fields-sync.service';

const logSpecs = {
  all: true,
  getFieldsToProcess: false,
  ngOnInit: false,
  ['fieldsToProcess$']: true,
}

@Component({
    selector: 'app-edit-entity-form-builder',
    templateUrl: './form-builder.component.html',
    styleUrls: ['./form-builder.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        EntityFormComponent,
    ],
    providers: [
        FieldsSettingsService, // used for all field settings - must be shared from here
        FieldsTranslateService, // used for field translations and uses FieldsSettingsService, so also shared here
        EntityFormStateService, // used for sharing information about this entity form
    ]
})
export class EntityFormBuilderComponent implements OnInit, OnDestroy {
  entityGuid = input<string>();
  index = input<number>();

  log = classLog({EntityFormBuilderComponent}, logSpecs);

  /** Inject the form state service to start it here */
  #formStateSvc = inject(EntityFormStateService);

  #formulaDesignerService = inject(FormulaDesignerService);
  #fieldsTranslateSvc = inject(FieldsTranslateService);
  #fieldsSettingsSvc = inject(FieldsSettingsService);
  #injector = inject(Injector);

  // Transient services
  #formFieldsBuilderService = transient(FormFieldsBuilderService);
  #fieldsSyncSvc = transient(FormFieldsSyncService);
  #formSyncSvc = transient(EntityFormSyncService);

  constructor() { }

  public form = this.#formStateSvc.formGroup;

  ngOnInit() {
    const entityGuid = this.entityGuid();
    const l = this.log.fnIf('ngOnInit', { entityGuid });
    this.#fieldsSettingsSvc.init(entityGuid);
    this.#formulaDesignerService.itemSettingsServices[entityGuid] = this.#fieldsSettingsSvc;
    this.#fieldsTranslateSvc.init(entityGuid);

    const fields$ = this.#getFieldsToProcess$(entityGuid);

    // Create all the controls in the form right at the beginning
    fields$.pipe(take(1)).subscribe(allFields => this.#formFieldsBuilderService.createFields(entityGuid, this.form, allFields));

    this.#fieldsSyncSvc.keepFieldsAndStateInSync(this.form, fields$);

    // Sync state to parent: dirty, isValid, value changes
    this.#formSyncSvc.setupSync(entityGuid);

    l.end();
  }

  ngOnDestroy() {
    this.#fieldsSettingsSvc.disableForCleanUp();
  }

  #getFieldsToProcess$(entityGuid: string): Observable<FieldInitSpecs[]> {
    const l = this.log.fnIf('getFieldsToProcess', null, entityGuid);
    const form = this.form;

    const allProps = this.#fieldsSettingsSvc.allProps;
    const allProps$ = toObservable(allProps, { injector: this.#injector });

    // 1. Prepare: Take field props and enrich initial values and input types
    const fieldsToProcess: Observable<FieldInitSpecs[]> = allProps$
      .pipe(
        filter(fields => fields != null && Object.keys(fields).length > 0),
        map(allFields => {
          const fields: FieldInitSpecs[] = Object.entries(allFields)
            .map(([name, props]) => {
              const hasControl = form.controls.hasOwnProperty(name);
              const control = hasControl ? form.controls[name] : null;
              return {
                name,
                props,
                inputType: props.constants.inputTypeSpecs.inputType,
                value: props.value,
                hasControl,
                control,
              } satisfies FieldInitSpecs;
            });
          this.log.aIf('fieldsToProcess$', { entityGuid, fields });
          return fields;
        }),
      );
    return l.rSilent(fieldsToProcess);
  }
}
