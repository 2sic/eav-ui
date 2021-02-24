import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { FieldsProps } from '../models';
import { EavContentType, EavEntityAttributes, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';
import { EavService } from './eav.service';
import { FieldsSettings2NewService } from './fields-settings2new.service';

@Injectable()
export class FieldsTranslateService implements OnDestroy {
  private entityGuid: string;
  private currentLanguage: string;
  private defaultLanguage: string;
  private attributes: EavEntityAttributes;
  private contentType: EavContentType;
  private fieldsProps: FieldsProps;
  private subscription: Subscription;

  constructor(
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private contentTypeService: ContentTypeService,
    private fieldsSettings2NewService: FieldsSettings2NewService,
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  init(item: EavItem): void {
    this.entityGuid = item.Entity.Guid;

    this.subscription = new Subscription();
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId).subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
      })
    );
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId).subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;
      })
    );
    this.subscription.add(
      this.itemService.selectItemAttributes(this.entityGuid).subscribe(attributes => {
        this.attributes = attributes;
      })
    );
    const contentTypeId = InputFieldHelper.getContentTypeId(item);
    this.subscription.add(
      this.contentTypeService.getContentTypeById(contentTypeId).subscribe(contentType => {
        this.contentType = contentType;
      })
    );
    this.subscription.add(
      this.fieldsSettings2NewService.getFieldsProps$().subscribe(fieldsProps => {
        this.fieldsProps = fieldsProps;
      })
    );
  }

  translate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }

    transactionItem = this.itemService.removeItemAttributeDimension(
      this.entityGuid, fieldName, this.currentLanguage, true, transactionItem,
    );

    const values = this.attributes[fieldName];
    const defaultValue = LocalizationHelper.getValueTranslation(values, this.defaultLanguage, this.defaultLanguage);
    const attribute = this.contentType.Attributes.find(a => a.Name === fieldName);
    transactionItem = this.itemService.addItemAttributeValue(
      this.entityGuid, fieldName, defaultValue.Value, this.currentLanguage, false, attribute.Type, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  dontTranslate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }

    transactionItem = this.itemService.removeItemAttributeDimension(
      this.entityGuid, fieldName, this.currentLanguage, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const values = this.attributes[fieldName];
    const attributeValueTranslation = LocalizationHelper.getValueTranslation(values, copyFromLanguageKey, this.defaultLanguage);
    if (attributeValueTranslation) {
      const valueAlreadyExists = values
        ? LocalizationHelper.isEditableOrReadonlyTranslationExist(values, this.currentLanguage, this.defaultLanguage)
        : false;

      if (valueAlreadyExists) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          this.entityGuid, fieldName, attributeValueTranslation.Value, this.currentLanguage, this.defaultLanguage, false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        const attribute = this.contentType.Attributes.find(a => a.Name === fieldName);
        this.itemService.addItemAttributeValue(
          this.entityGuid, fieldName, attributeValueTranslation.Value, this.currentLanguage, false, attribute.Type,
        );
      }
    } else {
      angularConsoleLog(`${this.currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }
  }

  linkReadOnly(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, this.currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, this.currentLanguage, linkWithLanguageKey, this.defaultLanguage, true, transactionItem,
    );
  }

  linkReadWrite(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, this.currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, this.currentLanguage, linkWithLanguageKey, this.defaultLanguage, false, transactionItem,
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
    return this.fieldsProps[fieldName].settings.DisableTranslation;
  }
}
