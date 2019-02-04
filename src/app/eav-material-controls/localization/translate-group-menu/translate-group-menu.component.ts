import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';

import { EavValue, EavAttributes, EavValues, EavDimensions } from '../../../shared/models/eav';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';
import { ItemService } from '../../../shared/services/item.service';
import { LanguageService } from '../../../shared/services/language.service';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { TranslationLinkTypeConstants } from '../../../shared/constants/type-constants';
import { ValidationHelper } from '../../validators/validation-helper';
import isEqual from 'lodash/isEqual';

@Component({
  selector: 'app-translate-group-menu',
  templateUrl: './translate-group-menu.component.html',
  styleUrls: ['./translate-group-menu.component.scss']
})
export class TranslateGroupMenuComponent implements OnInit, OnDestroy {

  @Input() config: FieldConfig;
  @Input() group: FormGroup;
  @Input()
  set toggleTranslateField(value: boolean) {
    if (this.currentLanguage !== this.defaultLanguage) {
      if (this.group.controls[this.config.name].disabled) {
        this.translateUnlink(this.config.name);
      } else {
        this.linkToDefault(this.config.name);
      }
    }
  }

  get inputDisabled() {
    return this.group.controls[this.config.name].disabled;
  }

  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  headerGroupSlotIsEmpty = false;
  translationState: LinkToOtherLanguageData = new LinkToOtherLanguageData('', '');
  infoMessage;
  infoMessageLabel;

  private subscriptions: Subscription[] = [];

  constructor(private dialog: MatDialog,
    private languageService: LanguageService,
    private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  ngOnInit() {
    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entityId, this.config.entityGuid);
    this.subscribeToAttributeValues();
    this.subscribeMenuChange();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.subscribeToEntityHeaderFromStore();

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  openLinkToOtherLanguage() {
    // Open dialog
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
      autoFocus: false,
      width: '280px',
      data: new LinkToOtherLanguageData(this.translationState.linkType,
        this.translationState.language,
        this.defaultLanguage,
        this.attributes,
        this.config.name)
    });
    // Close dialog
    dialogRef.afterClosed().subscribe((actionResult: LinkToOtherLanguageData) => {
      if (actionResult) {
        this.triggerTranslation(actionResult);
      }
    });
  }

  translateUnlink(attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);
    const defaultValue: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributes[attributeKey],
      this.defaultLanguage,
      this.defaultLanguage
    );
    if (defaultValue) {
      const fieldType = InputFieldHelper.getFieldType(this.config, attributeKey);
      this.itemService.addAttributeValue(this.config.entityId, attributeKey, defaultValue.value,
        this.currentLanguage, false, this.config.entityGuid, fieldType);
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + this.defaultLanguage + ' because that value does not exist.');
    }

    this.refreshControlConfig(attributeKey);
  }

  linkToDefault(attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);

    this.refreshControlConfig(attributeKey);
  }

  translateAll() {
    this.setTranslationState(TranslationLinkTypeConstants.translate, '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.translateUnlink(attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  dontTranslateAll() {
    this.setTranslationState(TranslationLinkTypeConstants.dontTranslate, '');

    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkToDefault(attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  copyFromAll(languageKey) {
    this.setTranslationState(TranslationLinkTypeConstants.linkCopyFrom, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.copyFrom(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language
   * If value of current language don't exist then add new value
   * @param copyFromLanguageKey
   */
  copyFrom(copyFromLanguageKey: string, attributeKey: string) {
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
        this.itemService.updateItemAttributeValue(this.config.entityId, attributeKey,
          attributeValueTranslation.value, this.currentLanguage, this.defaultLanguage, false, this.config.entityGuid);
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addAttributeValue(this.config.entityId, attributeKey,
          attributeValueTranslation.value, this.currentLanguage, false, this.config.entityGuid, this.config.type);
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

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  linkReadOnly(languageKey: string, attributeKey: string) {
    this.setTranslationState(TranslationLinkTypeConstants.linkReadOnly, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, true, this.config.entityGuid);

    // TODO: investigate can only triger current language change to disable controls ???
    // this.languageService.updateCurrentLanguage(this.currentLanguage);

    this.refreshControlConfig(attributeKey);
  }

  linkReadWriteAll(languageKey) {
    this.setTranslationState(TranslationLinkTypeConstants.linkReadWrite, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadWrite(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  linkReadWrite(languageKey: string, attributeKey: string) {
    this.setTranslationState(TranslationLinkTypeConstants.linkReadWrite, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, false, this.config.entityGuid);

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
    if (!this.config.isParentGroup) {
      this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
      this.setAdamDisable();
      this.readTranslationState(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
      this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
    }
  }

  private triggerTranslation(actionResult: LinkToOtherLanguageData) {
    if (!isEqual(this.translationState, actionResult)) {
      this.setTranslationState(actionResult.linkType, actionResult.language);
      // need be sure that we have a language selected when a link option is clicked
      switch (this.translationState.linkType) {
        case TranslationLinkTypeConstants.translate:
          this.config.isParentGroup ? this.translateAll() : this.translateUnlink(this.config.name);
          break;
        case TranslationLinkTypeConstants.dontTranslate:
          this.config.isParentGroup ? this.dontTranslateAll() : this.linkToDefault(this.config.name);
          break;
        case TranslationLinkTypeConstants.linkReadOnly:
          this.config.isParentGroup
            ? this.linkReadOnlyAll(this.translationState.language)
            : this.linkReadOnly(this.translationState.language, this.config.name);
          break;
        case TranslationLinkTypeConstants.linkReadWrite:
          this.config.isParentGroup
            ? this.linkReadWriteAll(this.translationState.language)
            : this.linkReadWrite(this.translationState.language, this.config.name);
          break;
        case TranslationLinkTypeConstants.linkCopyFrom:
          this.config.isParentGroup
            ? this.copyFromAll(this.translationState.language)
            : this.copyFrom(this.translationState.language, this.config.name);
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
    if (!this.config.disabled) {
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
    this.config.settings = LocalizationHelper.translateSettings(this.config.fullSettings, this.currentLanguage, this.defaultLanguage);
    this.config.label = this.config.settings.Name ? this.config.settings.Name : null;
    this.config.validation = ValidationHelper.getValidations(this.config.settings);
    this.config.required = ValidationHelper.isRequired(this.config.settings);
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;

        this.translateAllConfiguration(this.currentLanguage);
        this.refreshControlConfig(this.config.name);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscriptions.push(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;

        this.translateAllConfiguration(this.currentLanguage);
        this.refreshControlConfig(this.config.name);
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
    if (this.config.header.group && this.config.header.group.slotCanBeEmpty) {
      this.subscriptions.push(
        this.itemService.selectHeaderByEntityId(this.config.entityId, this.config.entityGuid).subscribe(header => {
          if (header.group && !this.config.isParentGroup) {
            this.headerGroupSlotIsEmpty = header.group.slotIsEmpty;
            this.setControlDisable(this.attributes[this.config.name], this.config.name, this.currentLanguage, this.defaultLanguage);
          }
        })
      );
    }
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
      this.languageService.localizationWrapperMenuChange$.subscribe(s => {
        if (!this.config.isParentGroup) {
          this.refreshControlConfig(this.config.name);
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
      this.config.adam.disabled = this.group.controls[this.config.name].disabled;
    }
  }

  /**
   * set info message
   * @param attributes
   * @param currentLanguage
   * @param defaultLanguage
   */
  private setInfoMessage(attributes: EavValues<any>, currentLanguage: string, defaultLanguage: string) {
    console.log('Petar 1', this.infoMessage);
    // Determine is control disabled or enabled and info message
    if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
      // this.infoMessage = '';
      // this.infoMessageLabel = '';
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map((d: EavDimensions<string>) => d.value.replace('~', ''))
        .join(', ');

      this.infoMessageLabel = 'LangMenu.In';
      // this.translationState = new LinkToOtherLanguageData('translate', '');
      console.log('Petar 2', this.infoMessage);
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map((d: EavDimensions<string>) => d.value.replace('~', ''))
        .join(', ');

      this.infoMessageLabel = 'LangMenu.In';
      // const readOnlyElements: EavDimensions<string>[] = LocalizationHelper.getAttributeValueTranslation(attributes,
      //   currentLanguage, defaultLanguage)
      //   .dimensions.filter(f => f.value !== currentLanguage);
      // this.translationState = new LinkToOtherLanguageData('linkReadOnly', readOnlyElements[0].value);
      console.log('Petar 3', this.infoMessage);
    } else {
      this.infoMessage = '';
      this.infoMessageLabel = 'LangMenu.UseDefault';
      //  this.translationState = new LinkToOtherLanguageData('dontTranslate', '');
      console.log('Petar 4', this.infoMessage);
    }
  }
}
