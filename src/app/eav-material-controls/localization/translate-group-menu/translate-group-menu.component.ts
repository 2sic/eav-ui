import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import isEqual from 'lodash/isEqual';

import { EavValue, EavAttributes, EavValues, EavDimensions, InputType, Item, ContentType } from '../../../shared/models/eav';
import { FieldConfigSet, FieldConfigGroup } from '../../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { TranslationLinkTypeConstants } from '../../../shared/constants/type-constants';
import { ValidationHelper } from '../../validators/validation-helper';
import { TranslateGroupMenuHelpers } from './translate-group-menu.helpers';
import { InputTypeService } from '../../../shared/store/ngrx-data/input-type.service';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';


@Component({
  selector: 'app-translate-group-menu',
  templateUrl: './translate-group-menu.component.html',
  styleUrls: ['./translate-group-menu.component.scss']
})
export class TranslateGroupMenuComponent implements OnInit, OnDestroy {

  @Input() config: FieldConfigSet;
  fieldConfig: FieldConfigGroup;
  @Input() group: FormGroup;
  @Input()
  set toggleTranslateField(value: boolean) {
    if (this.currentLanguage !== this.defaultLanguage) {
      if (this.group.controls[this.config.field.name].disabled) {
        this.translateUnlink(this.config.field.name);
      } else {
        this.linkToDefault(this.config.field.name);
      }
    }
  }

  get inputDisabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  headerGroupSlotIsEmpty = false;
  translationState: LinkToOtherLanguageData = new LinkToOtherLanguageData(null, '', '');
  infoMessage: string;
  infoMessageLabel: string;
  item: Item;
  contentType: ContentType;

  private subscriptions: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeService: ContentTypeService
  ) { }

  ngOnInit() {
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entity.entityId, this.config.entity.entityGuid);
    this.subscribeToAttributeValues();
    this.subscribeMenuChange();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.subscribeToEntityHeaderFromStore();
    this.subscribeToItemFromStore();
    this.subscribeToContentTypeFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  openLinkToOtherLanguage() {
    // Open dialog
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
      autoFocus: false,
      width: '350px',
      data: new LinkToOtherLanguageData(
        this.config.form.formId,
        this.translationState.linkType,
        this.translationState.language,
        this.defaultLanguage,
        this.attributes,
        this.config.field.name,
      )
    });
    // spm add dialog and subdialog events through a helper
    dialogRef.keydownEvents().subscribe(e => {
      // CTRL + S
      if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault(); // spm don't open browser default save
      }
    });
    // Close dialog
    dialogRef.afterClosed().subscribe((actionResult: LinkToOtherLanguageData) => {
      if (actionResult) {
        this.triggerTranslation(actionResult);
      }
    });
  }

  translateUnlink(attributeKey: string) {
    if (!this.isTranslateEnabled(attributeKey)) {
      return;
    }
    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);
    const defaultValue: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributes[attributeKey],
      this.defaultLanguage,
      this.defaultLanguage
    );
    if (defaultValue) {
      const fieldType = InputFieldHelper.getFieldType(this.config, attributeKey);
      this.itemService.addAttributeValue(this.config.entity.entityId, attributeKey, defaultValue.value,
        this.currentLanguage, false, this.config.entity.entityGuid, fieldType);
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + this.defaultLanguage + ' because that value does not exist.');
    }

    this.refreshControlConfig(attributeKey);
  }

  linkToDefault(attributeKey: string) {
    if (!this.isTranslateEnabled(attributeKey)) {
      return;
    }
    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);

    this.refreshControlConfig(attributeKey);
  }

  translateAll() {
    this.setTranslationState(TranslationLinkTypeConstants.translate, '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.translateUnlink(attributeKey);
    });

    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  dontTranslateAll() {
    this.setTranslationState(TranslationLinkTypeConstants.dontTranslate, '');

    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkToDefault(attributeKey);
    });

    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  copyFromAll(languageKey) {
    this.setTranslationState(TranslationLinkTypeConstants.linkCopyFrom, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.copyFrom(languageKey, attributeKey);
    });

    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language
   * If value of current language don't exist then add new value
   * @param copyFromLanguageKey
   */
  copyFrom(copyFromLanguageKey: string, attributeKey: string) {
    if (!this.isTranslateEnabled(attributeKey)) {
      return;
    }
    const attributeValueTranslation: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributes[attributeKey],
      copyFromLanguageKey,
      this.defaultLanguage
    );

    if (attributeValueTranslation) {
      const valueAlreadyExist: boolean = this.attributes ?
        LocalizationHelper.isEditableOrReadonlyTranslationExist(
          this.attributes[attributeKey],
          this.currentLanguage,
          this.defaultLanguage
        )
        : false;

      if (valueAlreadyExist) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(this.config.entity.entityId, attributeKey,
          attributeValueTranslation.value, this.currentLanguage, this.defaultLanguage, false, this.config.entity.entityGuid);
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addAttributeValue(this.config.entity.entityId, attributeKey,
          attributeValueTranslation.value, this.currentLanguage, false, this.config.entity.entityGuid,
          this.config.field.type);
      }
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + copyFromLanguageKey + ' because that value does not exist.');
    }

    this.refreshControlConfig(attributeKey);
  }

  linkReadOnlyAll(languageKey) {
    this.setTranslationState(TranslationLinkTypeConstants.linkReadOnly, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadOnly(languageKey, attributeKey);
    });

    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  linkReadOnly(languageKey: string, attributeKey: string) {
    if (!this.isTranslateEnabled(attributeKey)) {
      return;
    }
    this.setTranslationState(TranslationLinkTypeConstants.linkReadOnly, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, true, this.config.entity.entityGuid);

    // TODO: investigate can only triger current language change to disable controls ???
    // this.languageService.updateCurrentLanguage(this.currentLanguage);

    this.refreshControlConfig(attributeKey);
  }

  linkReadWriteAll(languageKey) {
    this.setTranslationState(TranslationLinkTypeConstants.linkReadWrite, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadWrite(languageKey, attributeKey);
    });

    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  linkReadWrite(languageKey: string, attributeKey: string) {
    if (!this.isTranslateEnabled(attributeKey)) {
      return;
    }
    this.setTranslationState(TranslationLinkTypeConstants.linkReadWrite, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, false, this.config.entity.entityGuid);

    this.refreshControlConfig(attributeKey);
  }

  getTranslationStateClass() {
    if (!this.translationState) {
      return '';
    }

    switch (this.translationState.linkType) {
      case TranslationLinkTypeConstants.translate:
      case TranslationLinkTypeConstants.linkCopyFrom:
        return 'eav-localization-translate';
      case TranslationLinkTypeConstants.dontTranslate:
        return '';
      case TranslationLinkTypeConstants.linkReadOnly:
        return 'eav-localization-link-read-only';
      case TranslationLinkTypeConstants.linkReadWrite:
        return 'eav-localization-link-read-write';

      default:
        return '';
    }
  }

  private refreshControlConfig(attributeKey: string) {
    if (!this.fieldConfig.isParentGroup) {
      this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
      this.setAdamDisable();
      this.readTranslationState(this.attributes[this.config.field.name], this.currentLanguage, this.defaultLanguage);
      this.setInfoMessage(this.attributes[this.config.field.name], this.currentLanguage, this.defaultLanguage);
    }
  }

  private triggerTranslation(actionResult: LinkToOtherLanguageData) {
    if (!isEqual(this.translationState, actionResult)) {
      // need be sure that we have a language selected when a link option is clicked
      switch (actionResult.linkType) {
        case TranslationLinkTypeConstants.translate:
          this.fieldConfig.isParentGroup ? this.translateAll() : this.translateUnlink(this.config.field.name);
          break;
        case TranslationLinkTypeConstants.dontTranslate:
          this.fieldConfig.isParentGroup ? this.dontTranslateAll() : this.linkToDefault(this.config.field.name);
          break;
        case TranslationLinkTypeConstants.linkReadOnly:
          this.fieldConfig.isParentGroup
            ? this.linkReadOnlyAll(actionResult.language)
            : this.linkReadOnly(actionResult.language, this.config.field.name);
          break;
        case TranslationLinkTypeConstants.linkReadWrite:
          this.fieldConfig.isParentGroup
            ? this.linkReadWriteAll(actionResult.language)
            : this.linkReadWrite(actionResult.language, this.config.field.name);
          break;
        case TranslationLinkTypeConstants.linkCopyFrom:
          this.fieldConfig.isParentGroup
            ? this.copyFromAll(actionResult.language)
            : this.copyFrom(actionResult.language, this.config.field.name);
          break;
        default:
          break;
      }
    }
  }

  private setTranslationState(linkType: string, language: string) {
    this.translationState.linkType = linkType;
    this.translationState.language = language;
  }

  /**
 * Determine is control disabled or enabled
 * @param attributes
 * @param attributeKey
 * @param currentLanguage
 * @param defaultLanguage
 */
  private setControlDisable(attributes: EavValues<any>, attributeKey: string, currentLanguage: string,
    defaultLanguage: string) {
    // if control already disabled through settings then skip
    if (!this.config.field.disabled) {
      // if header group slot is empty disable control
      if (this.headerGroupSlotIsEmpty) {
        this.group.controls[attributeKey].disable({ emitEvent: false });
      } else { // else set enable/disable depending on editable translation exist
        if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
          this.group.controls[attributeKey].enable({ emitEvent: false });
        } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
          this.group.controls[attributeKey].disable({ emitEvent: false });
        } else {
          this.group.controls[attributeKey].disable({ emitEvent: false });
        }
      }
    }
  }

  /**
   * translate a field configuration (labels, validation, )
   * @param currentLanguage
   */
  private translateAllConfiguration(currentLanguage: string) {
    this.config.field.settings = LocalizationHelper.translateSettings(this.config.field.fullSettings,
      this.currentLanguage, this.defaultLanguage);
    this.config.field.label = this.config.field.settings.Name || null;
    this.config.field.validation = ValidationHelper.getValidations(this.config.field.settings);
    this.config.field.required = ValidationHelper.isRequired(this.config.field.settings);
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;

        this.translateAllConfiguration(this.currentLanguage);
        this.refreshControlConfig(this.config.field.name);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscriptions.push(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;

        this.translateAllConfiguration(this.currentLanguage);
        this.refreshControlConfig(this.config.field.name);
      })
    );
  }

  /**
 * Subscribe to item attribute values
 */
  private subscribeToAttributeValues() {
    this.subscriptions.push(
      this.attributes$.subscribe(attributes => {
        this.attributes = attributes;
      })
    );
  }

  private subscribeToEntityHeaderFromStore() {
    if (this.config.entity.header.group && this.config.entity.header.group.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid).subscribe(header => {
          if (header.group && !this.fieldConfig.isParentGroup) {
            this.headerGroupSlotIsEmpty = header.group.slotIsEmpty;
            this.setControlDisable(this.attributes[this.config.field.name], this.config.field.name,
              this.currentLanguage, this.defaultLanguage);
          }
        })
      );
    }
  }

  /**
   * Fetch current item
   */
  private subscribeToItemFromStore() {
    this.subscriptions.push(
      this.itemService.selectItemById(this.config.entity.entityId).subscribe(item => {
        this.item = item;
      })
    );
  }

  /**
   * Fetch contentType of current item
   */
  private subscribeToContentTypeFromStore() {
    const contentTypeId = this.item.entity.type === null
      ? this.item.header.contentTypeName
      : this.item.entity.type.id;
    this.subscriptions.push(
      this.contentTypeService.getContentTypeById(contentTypeId).subscribe(contentType => {
        this.contentType = contentType;
      })
    );
  }

  /**
   * Fetch inputType definition to check if input field of this type shouldn't be translated
   * @param attributeType new attribute type defined in contentTypes
   */
  public isTranslateEnabled(attributeKey: string) {
    const attributeDef = this.contentType.contentType.attributes.find(attr => attr.name === attributeKey);
    const calculatedInputType = InputFieldHelper.calculateInputType(attributeDef, this.inputTypeService);

    let inputType: InputType;
    this.inputTypeService.getInputTypeById(calculatedInputType.inputType).pipe(take(1)).subscribe(type => { inputType = type; });
    if (!inputType) {
      // if you dont find it assume its translateable
      return true;
    }
    return !inputType.DisableI18n;
  }

  private readTranslationState(attributes: EavValues<any>, currentLanguage: string, defaultLanguage: string) {
    // Determine is control disabled or enabled and info message
    if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
      const editableElements: EavDimensions<string>[] = LocalizationHelper.getAttributeValueTranslation(attributes,
        currentLanguage, defaultLanguage)
        .dimensions.filter(f => f.value !== currentLanguage);
      if (editableElements.length > 0) {
        this.setTranslationState(TranslationLinkTypeConstants.linkReadWrite, editableElements[0].value);
      } else {
        this.setTranslationState(TranslationLinkTypeConstants.translate, '');
      }
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      const readOnlyElements: EavDimensions<string>[] = LocalizationHelper.getAttributeValueTranslation(attributes,
        currentLanguage, defaultLanguage)
        .dimensions.filter(f => f.value !== currentLanguage);
      this.setTranslationState(TranslationLinkTypeConstants.linkReadOnly, readOnlyElements[0].value);
    } else {
      this.setTranslationState(TranslationLinkTypeConstants.dontTranslate, '');
    }
  }

  /**
    * Subscribe triggered when changing all in menu (forAllFields)
    */
  private subscribeMenuChange() {
    this.subscriptions.push(
      this.languageInstanceService.localizationWrapperMenuChange$.subscribe(s => {
        if (!this.fieldConfig.isParentGroup) {
          this.refreshControlConfig(this.config.field.name);
        }
      })
    );
  }

  /**
   * * Change adam disable state
   *   * @param attributeKey
   *  */
  private setAdamDisable() {
    // set Adam disabled state
    if (this.config.adam) {
      this.config.adam.disabled = this.group.controls[this.config.field.name].disabled;
    }
  }

  /**
   * set info message
   * @param attributes
   * @param currentLanguage
   * @param defaultLanguage
   */
  private setInfoMessage(attributes: EavValues<any>, currentLanguage: string, defaultLanguage: string) {
    // Determine whether control is disabled or enabled and info message
    if (this.fieldConfig.disableI18n) {
      this.infoMessage = '';
      this.infoMessageLabel = 'LangMenu.InAllLanguages';
      return;
    }

    const isEditableTranslationExist: boolean = LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage);
    const isReadonlyTranslationExist: boolean = LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage);

    if (isEditableTranslationExist || isReadonlyTranslationExist) {
      let dimensions: string[] = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map(d => d.value);

      dimensions = dimensions.filter(d => !d.includes(currentLanguage));

      const isShared = dimensions.length > 0;
      if (isShared) {
        this.infoMessage = TranslateGroupMenuHelpers.calculateSharedInfoMessage(dimensions, currentLanguage);

        if (isEditableTranslationExist) {
          this.infoMessageLabel = 'LangMenu.In';
        } else if (isReadonlyTranslationExist) {
          this.infoMessageLabel = 'LangMenu.From';
        }
      } else {
        this.infoMessage = '';
        this.infoMessageLabel = '';
      }
    } else {
      this.infoMessage = '';
      this.infoMessageLabel = 'LangMenu.UseDefault';
    }
  }
}
