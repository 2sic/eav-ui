import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { EavItem } from '../../shared/models/eav';
import { EavService } from '../../shared/services/eav.service';
import { FieldsSettingsService } from '../../shared/services/fields-settings.service';
import { FieldsTranslateService } from '../../shared/services/fields-translate.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { FormValues } from './item-edit-form.models';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss'],
  providers: [FieldsSettingsService, FieldsTranslateService],
})
export class ItemEditFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(EavFormComponent) eavFormRef: EavFormComponent;
  @Input() item: EavItem;

  private subscription: Subscription;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
  ) { }

  ngOnInit() {
    this.subscription = new Subscription();
    this.fieldsSettingsService.init(this.item);
    this.fieldsTranslateService.init(this.item);

    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId).subscribe(() => {
        this.setFormValues();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.item != null) {
      this.setFormValues();
    }
  }

  formValueChange(formValues: FormValues) {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    this.itemService.updateItemAttributesValues(this.item.Entity.Guid, formValues, currentLanguage, defaultLanguage);
  }

  private setFormValues() {
    if (!this.eavFormRef) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    const formValues: FormValues = {};
    for (const [name, values] of Object.entries(this.item.Entity.Attributes)) {
      formValues[name] = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
    }

    if (this.valueIsChanged(formValues, this.eavFormRef.form.value)) {
      this.eavFormRef.form.patchValue(formValues, { emitEvent: false });
    }
    // important to be after patchValue
    this.eavService.formValueChange$.next({
      formId: this.eavService.eavConfig.formId,
      entityGuid: this.item.Entity.Guid,
      entityValues: formValues,
    });
  }

  /** Check if value in form changed */
  private valueIsChanged(newValues: FormValues, oldValues: FormValues) {
    // always true if values are not simple types
    // e.g. if form has a single entity field which stores value as an array, this check won't work
    const valueIsChanged = Object.keys(newValues).some(key => newValues[key] !== oldValues[key]);
    angularConsoleLog('VALUECHANGED:', valueIsChanged, 'NEW VALUES:', newValues, 'FORM VALUES:', oldValues);
    return valueIsChanged;
  }
}
