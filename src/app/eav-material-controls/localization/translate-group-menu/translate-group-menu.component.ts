import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { LanguageService } from '../../../shared/services/language.service';
import { ItemService } from '../../../shared/services/item.service';
import { EavValue, EavAttributes, EavValues, EavDimensions } from '../../../shared/models/eav';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../validators/validation-helper';
import isEqual from 'lodash/isEqual';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';


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

  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  headerGroupSlotIsEmpty = false;

  infoMessage = '';
  infoMessageLabel = '';

  translationState: LinkToOtherLanguageData = new LinkToOtherLanguageData('', '');

  private subscriptions: Subscription[] = [];

  constructor(private dialog: MatDialog,
    private languageService: LanguageService,
    private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  ngOnInit() {
    // default state
    // this.setTranslationState('', '');

    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entityId, this.config.entityGuid);
    this.subscribeToAttributeValues();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.subscribeToEntityHeaderFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  private setTranslationState(linkType: string, language: string) {
    this.translationState.linkType = linkType;
    this.translationState.language = language;
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

  // private getFieldType(attributeKey: string): string {
  //   if (this.config.type) {
  //     return this.config.type;
  //   } else {
  //     return this.getFieldTypeFromFieldGroup(this.config.fieldGroup, attributeKey);
  //   }
  // }

  // /**
  //  * loop through fieldGroup configuration recursively to get type
  //  * Form group configuration have configuration from all child fields.
  //  * @param fieldGroup
  //  * @param attributeKey
  //  */
  // private getFieldTypeFromFieldGroup(fieldGroup: FieldConfig[], attributeKey: string) {
  //   let type;
  //   fieldGroup.forEach(fieldConfig => {
  //     if (fieldConfig.fieldGroup) {
  //       const typeFromFieldGroup = this.getFieldTypeFromFieldGroup(fieldConfig.fieldGroup, attributeKey);
  //       if (typeFromFieldGroup) {
  //         type = typeFromFieldGroup;
  //       }
  //     } else {
  //       if (fieldConfig.name === attributeKey) {
  //         type = fieldConfig.type;
  //       }
  //     }
  //   });
  //   return type;
  // }

  private refreshControlConfig(attributeKey: string) {
    if (!this.config.isParentGroup) {
      this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
      // this.setAdamDisable();
      this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
    }
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

  private translateAllConfiguration(currentLanguage: string) {
    this.config.settings = LocalizationHelper.translateSettings(this.config.fullSettings, this.currentLanguage, this.defaultLanguage);
    this.config.label = this.config.settings.Name ? this.config.settings.Name : null;
    // important - a hidden field don't have validations and is not required
    const visibleInEditUI = (this.config.settings.VisibleInEditUI === false) ? false : true;
    this.config.validation = visibleInEditUI
      ? ValidationHelper.setDefaultValidations(this.config.settings)
      : [];
    this.config.required = this.config.settings.Required && visibleInEditUI
      ? this.config.settings.Required
      : false;
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
        if (!this.config.isParentGroup) {
          this.setControlDisable(this.attributes[this.config.name], this.config.name, this.currentLanguage, this.defaultLanguage);
          // this.setAdamDisable();
          this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
        }
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

  linkToDefault(attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);

    this.refreshControlConfig(attributeKey);
  }

  private triggerTranslation(actionResult: LinkToOtherLanguageData) {
    if (!isEqual(this.translationState, actionResult)) {
      this.setTranslationState(actionResult.linkType, actionResult.language);
      // need be sure that we have a language selected when a link option is clicked
      switch (this.translationState.linkType) {
        case 'translate':
          this.config.isParentGroup ? this.translateAll() : this.translateUnlink(this.config.name);
          break;
        case 'dontTranslate':
          this.config.isParentGroup ? this.dontTranslateAll() : this.linkToDefault(this.config.name);
          break;
        case 'linkReadOnly':
          this.config.isParentGroup
            ? this.linkReadOnlyAll(this.translationState.language)
            : this.linkReadOnly(this.translationState.language, this.config.name);
          break;
        case 'linkReadWrite':
          this.config.isParentGroup
            ? this.linkReadWriteAll(this.translationState.language)
            : this.linkReadWrite(this.translationState.language, this.config.name);
          break;
        default:
          break;
      }
    }
  }

  translateAll() {
    this.setTranslationState('translate', '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.translateUnlink(attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  dontTranslateAll() {
    this.setTranslationState('dontTranslate', '');

    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkToDefault(attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  // onClickCopyFromAll(languageKey) {
  //   this.setTranslationState('onClickCopyFromAll', languageKey);
  //   Object.keys(this.attributes).forEach(attributeKey => {
  //      this.onClickCopyFrom(languageKey, attributeKey);
  //   });

  //   this.languageService.triggerLocalizationWrapperMenuChange();
  // }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language
   * If value of current language don't exist then add new value
   * @param copyFromLanguageKey
   */
  // onClickCopyFrom(copyFromLanguageKey: string, attributeKey: string) {
  //   const attributeValueTranslation: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
  //     this.attributes[attributeKey],
  //     copyFromLanguageKey,
  //     this.defaultLanguage
  //   );

  //   if (attributeValueTranslation) {
  //     const valueAlreadyExist: boolean = this.attributes ?
  //       LocalizationHelper.isEditableOrReadonlyTranslationExist(
  //         this.attributes[attributeKey],
  //         this.currentLanguage,
  //         this.defaultLanguage
  //       )
  //       : false;

  //     if (valueAlreadyExist) {
  //       // Copy attribute value where language is languageKey to value where language is current language
  //       this.itemService.updateItemAttributeValue(this.config.entityId, attributeKey,
  //         attributeValueTranslation.value, this.currentLanguage, this.defaultLanguage, false, this.config.entityGuid);
  //     } else {
  //       // Copy attribute value where language is languageKey to new attribute with current language
  //       this.itemService.addAttributeValue(this.config.entityId, attributeKey,
  //         attributeValueTranslation.value, this.currentLanguage, false, this.config.entityGuid, this.config.type);
  //     }
  //   } else {
  //     console.log(this.currentLanguage + ': Cant copy value from ' + copyFromLanguageKey + ' because that value does not exist.');
  //   }

  //   this.refreshControlConfig(attributeKey);
  // }

  linkReadOnlyAll(languageKey) {
    this.setTranslationState('linkReadOnly', languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadOnly(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  linkReadOnly(languageKey: string, attributeKey: string) {
    this.setTranslationState('linkReadOnly', languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, true, this.config.entityGuid);

    // TODO: investigate can only triger current language change to disable controls ???
    // this.languageService.updateCurrentLanguage(this.currentLanguage);

    this.refreshControlConfig(attributeKey);
  }

  linkReadWriteAll(languageKey) {
    this.setTranslationState('linkReadWrite', languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadWrite(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  linkReadWrite(languageKey: string, attributeKey: string) {
    this.setTranslationState('linkReadWrite', languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage, this.config.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, false, this.config.entityGuid);

    this.refreshControlConfig(attributeKey);
  }

  openLinkToOtherLanguage() {
    // Open dialog
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
      autoFocus: false,
      width: '280px',
      // height: '80vh',
      // position: <DialogPosition>{ top: '10px', bottom: '10px' , left: '24px', right: '24px'},
      data: new LinkToOtherLanguageData(this.translationState.linkType, this.translationState.language)
    });
    // dialogRef.componentInstance.publishMode = this.multiFormDialogRef.componentInstance.publishMode;
    // Close dialog
    dialogRef.afterClosed().subscribe((actionResult: LinkToOtherLanguageData) => {
      if (actionResult) {
        console.log('dialog closed', this.translationState);
        console.log('dialog closed', actionResult);
        this.triggerTranslation(actionResult);
      }
    });
  }


  /**
   * set info message
   * @param attributes
   * @param currentLanguage
   * @param defaultLanguage
   */
  private setInfoMessage(attributes: EavValues<any>, currentLanguage: string, defaultLanguage: string) {
    // Determine is control disabled or enabled and info message
    if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
      this.infoMessage = '';
      this.infoMessageLabel = '';
      this.translationState = new LinkToOtherLanguageData('translate', '');
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map((d: EavDimensions<string>) => d.value.replace('~', ''))
        .join(', ');

      const readOnlyElements: EavDimensions<string>[] = LocalizationHelper.getAttributeValueTranslation(attributes,
        currentLanguage, defaultLanguage)
        .dimensions.filter(f => f.value !== currentLanguage);
      this.infoMessageLabel = 'LangMenu.In';
      this.translationState = new LinkToOtherLanguageData('linkReadOnly', readOnlyElements[0].value);
    } else {
      this.infoMessage = '';
      this.infoMessageLabel = 'LangMenu.UseDefault';
      this.translationState = new LinkToOtherLanguageData('dontTranslate', '');
    }
  }
}
