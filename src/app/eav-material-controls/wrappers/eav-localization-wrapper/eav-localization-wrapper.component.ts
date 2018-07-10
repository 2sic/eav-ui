import {
  Component, Input, ViewChild, ViewContainerRef, OnInit, OnDestroy
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import {
  EavValue, EavValues, Language, EavDimensions, EavAttributes
} from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';
import { ItemService } from '../../../shared/services/item.service';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../validators/validation-helper';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.css']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  @Input() config: FieldConfig;
  group: FormGroup;

  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  languages$: Observable<Language[]>;
  languages: Language[];
  infoMessage = '';
  infoMessageLabel = '';

  private subscriptions: Subscription[] = [];

  constructor(private languageService: LanguageService,
    private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  get inputDisabled() {
    return this.group.controls[this.config.name].disabled;
  }

  ngOnInit() {
    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entityId);

    this.subscribeToAttributeValues();
    this.subscribeMenuChange();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.loadlanguagesFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  toggleTranslate(isToggleEnabled: boolean) {
    if (isToggleEnabled) {
      if (this.group.controls[this.config.name].disabled) {
        this.translateUnlink(this.config.name);
      } else {
        this.linkToDefault(this.config.name);
      }
    }
  }

  translateUnlink(attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);

    const defaultValue: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributes[attributeKey],
      this.defaultLanguage,
      this.defaultLanguage
    );

    if (defaultValue) {
      this.itemService.addAttributeValue(this.config.entityId, attributeKey, this.attributes[attributeKey],
        defaultValue.value, this.currentLanguage, false);
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + this.defaultLanguage + ' because that value does not exist.');
    }

    this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.setAdamDisable();
    this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
  }

  linkToDefault(attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);

    this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.setAdamDisable();
    this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
  }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language
   * If value of current language don't exist then add new value
   * @param copyFromLanguageKey
   */
  onClickCopyFrom(copyFromLanguageKey: string, attributeKey: string) {
    const attributeValueTranslation: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributes[attributeKey],
      copyFromLanguageKey,
      this.defaultLanguage
    );

    if (attributeValueTranslation) {
      const valueAlreadyExist: boolean = LocalizationHelper.isEditableOrReadonlyTranslationExist(
        this.attributes[attributeKey],
        this.currentLanguage,
        this.defaultLanguage
      );

      if (valueAlreadyExist) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(this.config.entityId, attributeKey,
          attributeValueTranslation.value, this.currentLanguage, this.defaultLanguage, false);
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addAttributeValue(this.config.entityId, attributeKey, this.attributes[attributeKey],
          attributeValueTranslation.value, this.currentLanguage, false);
      }
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + copyFromLanguageKey + ' because that value does not exist.');
    }

    this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.setAdamDisable();
    this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
  }

  onClickUseFrom(languageKey: string, attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, true);

    // TODO: investigate can only triger current language change to disable controls ???
    // this.languageService.updateCurrentLanguage(this.currentLanguage);
    this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.setAdamDisable();
    this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
  }

  onClickShareWith(languageKey: string, attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, false);

    this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.setAdamDisable();
    this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
  }

  translateUnlinkAll() {
    Object.keys(this.attributes).forEach(attributeKey => {
      this.translateUnlink(attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  linkToDefaultAll() {
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkToDefault(attributeKey);
    });
    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  onClickCopyFromAll(languageKey) {
    Object.keys(this.attributes).forEach(attributeKey => {
      this.onClickCopyFrom(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  onClickUseFromAll(languageKey) {
    Object.keys(this.attributes).forEach(attributeKey => {
      this.onClickUseFrom(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  onClickShareWithAll(languageKey) {
    Object.keys(this.attributes).forEach(attributeKey => {
      this.onClickShareWith(languageKey, attributeKey);
    });

    this.languageService.triggerLocalizationWrapperMenuChange();
  }

  hasLanguage = (languageKey) => {
    return LocalizationHelper.isEditableOrReadonlyTranslationExist(this.attributes[this.config.name], languageKey, this.defaultLanguage);
  }

  openMenu() {
    this.trigger.openMenu();
  }

  closeMenu() {
    this.trigger.closeMenu();
  }

  /**
   * Subscribe triggered when changing all in menu (forAllFields)
   */
  private subscribeMenuChange() {
    this.subscriptions.push(
      this.languageService.localizationWrapperMenuChange$.subscribe(s => {
        this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
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

  private subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
        this.translateAllConfiguration(currentLanguage);
        this.setControlDisable(this.attributes[this.config.name], this.config.name, this.currentLanguage, this.defaultLanguage);
        this.setAdamDisable();
        this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscriptions.push(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;
      })
    );
  }

  /**
   * Load languages from store and subscribe to languages
   */
  private loadlanguagesFromStore() {
    this.languages$ = this.languageService.selectAllLanguages();

    this.subscriptions.push(
      this.languages$.subscribe(languages => {
        this.languages = languages;
      })
    );
  }

  private translateAllConfiguration(currentLanguage: string) {
    this.config.settings = LocalizationHelper.translateSettings(this.config.fullSettings, this.currentLanguage, this.defaultLanguage);
    this.config.label = this.config.settings.Name ? this.config.settings.Name : null;
    this.config.validation = ValidationHelper.setDefaultValidations(this.config.settings);
    this.config.required = this.config.settings.Required ? this.config.settings.Required : false;

  }

  /**
   * Determine is control disabled or enabled
   * @param attributes
   * @param attributeKey
   * @param currentLanguage
   * @param defaultLanguage
   */
  private setControlDisable(attributes: EavValues<any>, attributeKey: string, currentLanguage: string, defaultLanguage: string) {
    if (!this.config.disabled) {
      if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
        this.group.controls[attributeKey].enable({ emitEvent: false });
      } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
        this.group.controls[attributeKey].disable({ emitEvent: false });
      } else {
        this.group.controls[attributeKey].disable({ emitEvent: false });
      }
    }
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
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map((d: EavDimensions<string>) => d.value.replace('~', ''))
        .join(', ');
      this.infoMessageLabel = 'LangMenu.In';
    } else {
      this.infoMessage = '';
      this.infoMessageLabel = 'LangMenu.UseDefault';
    }
  }

  /**
   * Change adam disable state
   * @param attributeKey
   */
  private setAdamDisable() {
    // set Adam disabled state
    if (this.config.adam) {
      this.config.adam.disabled = this.group.controls[this.config.name].disabled;
    }
  }
}
