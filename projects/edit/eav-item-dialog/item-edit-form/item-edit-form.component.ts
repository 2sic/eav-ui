import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { LocalizationHelpers } from '../../shared/helpers';
import { EavEntityAttributes } from '../../shared/models/eav';
import { EavService, FieldsSettingsService, FieldsTranslateService } from '../../shared/services';
import { ItemService, LanguageInstanceService } from '../../shared/store/ngrx-data';
import { FormValues } from './item-edit-form.models';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss'],
  providers: [FieldsSettingsService, FieldsTranslateService],
})
export class ItemEditFormComponent implements OnInit, OnDestroy {
  @ViewChild(EavFormComponent) eavFormRef: EavFormComponent;
  @Input() entityGuid: string;

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
    this.fieldsSettingsService.init(this.entityGuid);
    this.fieldsTranslateService.init(this.entityGuid);

    const attributes$ = this.itemService.getItemAttributes$(this.entityGuid);
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    this.subscription.add(
      combineLatest([attributes$, currentLanguage$, defaultLanguage$]).subscribe(([attributes, currentLanguage, defaultLanguage]) => {
        this.setFormValues(attributes, currentLanguage, defaultLanguage);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  formValueChange(formValues: FormValues) {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    this.itemService.updateItemAttributesValues(this.entityGuid, formValues, currentLanguage, defaultLanguage);
  }

  private setFormValues(attributes: EavEntityAttributes, currentLanguage: string, defaultLanguage: string) {
    if (!this.eavFormRef) { return; }

    const itemValues: FormValues = {};
    for (const [name, values] of Object.entries(attributes)) {
      itemValues[name] = LocalizationHelpers.translate(currentLanguage, defaultLanguage, values, null);
    }
    const formValues = this.eavFormRef.form.value;

    // always true if values are not simple types
    // e.g. if form has a single entity field which stores value as an array, this check won't work
    const valueIsChanged = Object.keys(itemValues).some(key => itemValues[key] !== formValues[key]);
    angularConsoleLog('VALUECHANGED:', valueIsChanged, 'NEW VALUES:', itemValues, 'FORM VALUES:', formValues);
    if (valueIsChanged) {
      this.eavFormRef.form.patchValue(itemValues, { emitEvent: false });
    }

    // important to be after patchValue
    this.eavService.formValueChange$.next({
      formId: this.eavService.eavConfig.formId,
      entityGuid: this.entityGuid,
      entityValues: itemValues,
    });
  }
}
