import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { FormValueChange } from '../../eav-dynamic-form/components/eav-form/eav-form.models';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { EavItem } from '../../shared/models/eav';
import { EavService } from '../../shared/services/eav.service';
import { FieldsSettingsService } from '../../shared/services/fields-settings.service';
import { FieldsSettings2Service } from '../../shared/services/fields-settings2.service';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { BuildFieldsService } from './build-fields.service';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss'],
  providers: [BuildFieldsService, FieldsSettingsService, FieldsSettings2Service],
})
export class ItemEditFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(EavFormComponent) form: EavFormComponent;
  @Input() item: EavItem;
  @Output() private itemFormValueChange = new EventEmitter<void>();

  rootConfig: FieldConfigSet;
  fieldConfigs: FieldConfigSet[];
  currentLanguage: string;

  private defaultLanguage: string;
  private subscription = new Subscription();

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private buildFieldsService: BuildFieldsService,
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsSettings2Service: FieldsSettings2Service,
  ) { }

  ngOnInit() {
    this.fieldsSettings2Service.init(this.item);
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId).subscribe(defaultLang => {
        this.defaultLanguage = defaultLang;
      })
    );

    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId).subscribe(currentLang => {
        this.currentLanguage = currentLang;
        this.setFormValues();
      })
    );

    // create input fields from content type
    const contentTypeId = InputFieldHelper.getContentTypeId(this.item);
    this.contentTypeService.getContentTypeById(contentTypeId).pipe(take(1)).subscribe(contentType => {
      const allConfigs = this.buildFieldsService.buildFieldConfigs(
        contentType,
        this.item,
        this.eavService.eavConfig.formId,
        this.currentLanguage,
        this.defaultLanguage,
        this.eavService.eavConfig.enableHistory,
        this.fieldsSettingsService,
      );
      this.rootConfig = allConfigs[0];
      this.fieldConfigs = (this.rootConfig.field as FieldConfigGroup).fieldGroup;
    });
  }

  ngOnDestroy() {
    this.destroyFieldConfigs(this.fieldConfigs);
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.item != null) {
      this.setFormValues();
    }
  }

  /** Update NGRX/store on form value change */
  formValueChange(change: FormValueChange) {
    this.itemService.updateItemAttributesValues(this.item.Entity.Guid, change.formValues, this.currentLanguage, this.defaultLanguage);

    // run formulas when form value is changed
    change.formulaInstance.runSettingsFormulas();
    change.formulaInstance.runValueFormulas();
    this.itemFormValueChange.emit();
  }

  checkAreAllControlsDisabled() {
    let allDisabled = true;
    const controlKeys = Object.keys(this.form.form.controls);
    for (const key of controlKeys) {
      if (!this.form.form.controls[key].disabled) {
        allDisabled = false;
        break;
      }
    }
    return allDisabled;
  }

  private setFormValues() {
    if (!this.form) { return; }

    const formValues: { [name: string]: any } = {};
    Object.keys(this.item.Entity.Attributes).forEach(attributeKey => {
      formValues[attributeKey] = LocalizationHelper.translate(
        this.currentLanguage,
        this.defaultLanguage,
        this.item.Entity.Attributes[attributeKey],
        null,
      );
    });

    // spm true only on language change?
    if (this.form.valueIsChanged(formValues)) {
      // set new values to form
      this.form.patchValue(formValues, false);
    }
    // important to be after patchValue
    this.eavService.formValueChange$.next({
      formId: this.eavService.eavConfig.formId,
      entityGuid: this.item.Entity.Guid,
      entityValues: formValues,
    });
  }

  private destroyFieldConfigs(fieldConfigs: FieldConfigSet[]) {
    for (const config of fieldConfigs) {
      config.field.focused$?.complete();
      config.field.settings$.complete();
      config.field.fieldHelper?.destroy();

      const group = (config.field as FieldConfigGroup).fieldGroup;
      if (!group) { return; }
      this.destroyFieldConfigs(group);
    }
  }
}
