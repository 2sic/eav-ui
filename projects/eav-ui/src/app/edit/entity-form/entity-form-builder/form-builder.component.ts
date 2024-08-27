import { AbstractControlPro } from './../../shared/validation/validation.helpers';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, startWith } from 'rxjs';
import { EntityFormComponent } from '../entity-form-component/entity-form.component';
import { ControlHelpers } from '../../shared/helpers/control.helpers';
import { EntityFormStateService } from '../entity-form-state.service';
import { FormulaDesignerService } from '../../formulas/formula-designer.service';
import { BaseComponent } from '../../../shared/components/base.component';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { FormConfigService } from '../../state/form-config.service';
import { FormsStateService } from '../../state/forms-state.service';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FormFieldsBuilderService } from './form-fields-builder.service';
import { transient } from '../../../core';
import { ItemService } from '../../shared/store/item.service';

const logThis = false;
const nameOfThis = 'FormBuilderComponent';

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
export class EntityFormBuilderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;

  form = new UntypedFormGroup({});

  /** Inject the form state service, but automatically add the form for later use */
  #formStateService = inject(EntityFormStateService).setup(this.form);

  #formulaDesignerService = inject(FormulaDesignerService);
  #formFieldsBuilderService = transient(FormFieldsBuilderService);

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
    private formConfig: FormConfigService,
    private formsStateService: FormsStateService,
    private itemService: ItemService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnInit() {
    const l = this.log.fn('ngOnInit');
    this.fieldsSettingsService.init(this.entityGuid);
    this.#formulaDesignerService.itemSettingsServices[this.entityGuid] = this.fieldsSettingsService;
    this.fieldsTranslateService.init(this.entityGuid);

    const form = this.form;

    this.#formFieldsBuilderService.start(this.entityGuid, form);
    
    const formValid$ = form.valueChanges.pipe(
      map(() => !form.invalid),
      startWith(!form.invalid),
      mapUntilChanged(m => m),
    );

    const itemHeader$ = this.itemService.getItemHeader$(this.entityGuid);
    this.subscriptions.add(
      combineLatest([formValid$, itemHeader$]).pipe(
        map(([formValid, itemHeader]) => itemHeader.IsEmpty || formValid),
        mapUntilChanged(m => m),
      ).subscribe(isValid => {
        this.formsStateService.setFormValid(this.entityGuid, isValid);
      })
    );

    this.subscriptions.add(
      form.valueChanges.pipe(
        map(() => form.dirty),
        startWith(form.dirty),
        // distinctUntilChanged(), // cant have distinctUntilChanged because dirty state is not reset on form save
      ).subscribe(isDirty => {
        this.formsStateService.setFormDirty(this.entityGuid, isDirty);
      })
    );

    this.subscriptions.add(
      form.valueChanges.pipe(
        map(() => form.getRawValue() as ItemValuesOfLanguage),
        distinctUntilChanged((previous, current) => ControlHelpers.getFormChanges(previous, current) == null),
      ).subscribe((formValues) => {
        const language = this.formConfig.language();
        this.itemService.updater.updateItemAttributesValues(this.entityGuid, formValues, language);
      })
    );

    l.end();
  }

  ngOnDestroy() {
    Object.values(this.form.controls).forEach((control: AbstractControlPro) => {
      control._warning$.complete();
    });
    super.ngOnDestroy();
  }
}
