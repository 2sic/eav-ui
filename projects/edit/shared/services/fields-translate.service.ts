import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { EavEntityAttributes, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';
import { EavService } from './eav.service';
import { FieldsSettingsService } from './fields-settings.service';

@Injectable()
export class FieldsTranslateService implements OnDestroy {
  private entityGuid: string;
  private contentTypeId: string;
  private attributes: EavEntityAttributes;
  private subscription: Subscription;

  constructor(
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private contentTypeService: ContentTypeService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  init(item: EavItem): void {
    this.entityGuid = item.Entity.Guid;
    this.contentTypeId = InputFieldHelper.getContentTypeId(item);

    this.subscription = new Subscription();
    this.subscription.add(
      this.itemService.selectItemAttributes(this.entityGuid).subscribe(attributes => {
        this.attributes = attributes;
      })
    );
  }

  translate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true, transactionItem);

    const values = this.attributes[fieldName];
    const defaultValue = LocalizationHelper.getValueTranslation(values, defaultLanguage, defaultLanguage);
    const contentType = this.contentTypeService.getContentType(this.contentTypeId);
    const attribute = contentType.Attributes.find(a => a.Name === fieldName);
    transactionItem = this.itemService.addItemAttributeValue(
      this.entityGuid, fieldName, defaultValue.Value, currentLanguage, false, attribute.Type, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  dontTranslate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    transactionItem = this.itemService.removeItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const values = this.attributes[fieldName];
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const attributeValueTranslation = LocalizationHelper.getValueTranslation(values, copyFromLanguageKey, defaultLanguage);
    if (attributeValueTranslation) {
      const valueAlreadyExists = values
        ? LocalizationHelper.isEditableOrReadonlyTranslationExist(values, currentLanguage, defaultLanguage)
        : false;

      if (valueAlreadyExists) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          this.entityGuid, fieldName, attributeValueTranslation.Value, currentLanguage, defaultLanguage, false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        const contentType = this.contentTypeService.getContentType(this.contentTypeId);
        const attribute = contentType.Attributes.find(a => a.Name === fieldName);
        this.itemService.addItemAttributeValue(
          this.entityGuid, fieldName, attributeValueTranslation.Value, currentLanguage, false, attribute.Type,
        );
      }
    } else {
      angularConsoleLog(`${currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }
  }

  linkReadOnly(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, true, transactionItem,
    );
  }

  linkReadWrite(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, false, transactionItem,
    );
  }

  translateMany(): void {
    const translateable = Object.keys(this.attributes).filter(fieldName => !this.isTranslationDisabled(fieldName));

    let transactionItem: EavItem;
    for (const fieldName of translateable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translateable[translateable.length - 1];
      transactionItem = this.translate(fieldName, isTransaction, transactionItem);
    }
  }

  dontTranslateMany(): void {
    const translateable = Object.keys(this.attributes).filter(fieldName => !this.isTranslationDisabled(fieldName));

    let transactionItem: EavItem;
    for (const fieldName of translateable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translateable[translateable.length - 1];
      transactionItem = this.dontTranslate(fieldName, isTransaction, transactionItem);
    }
  }

  private isTranslationDisabled(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    return fieldsProps[fieldName].settings.DisableTranslation;
  }
}
