import {
  Component, Input, ViewChild, ViewContainerRef,
  OnInit, EventEmitter, OnDestroy
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import {
  EavValue, EavValues, Language, Item, EavDimensions,
  EavAttributes, EavAttributesTranslated
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

  enableTranslate = true;

  // attributes$: Observable<EavValues<any>>;
  // attributes: EavValues<any>;

  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  languages$: Observable<Language[]>;
  languages: Language[];
  infoMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(private languageService: LanguageService,
    private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  ngOnInit() {
    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entityId);

    this.subscribeToAttributeValues();

    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.loadlanguagesFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
  * Subscribe to item attribute values
  */
  private subscribeToAttributeValues() {
    this.subscriptions.push(
      this.attributes$.subscribe(attributes => {
        // console.log('subscribe attributes1 ', attributes);
        this.attributes = attributes;
        console.log('[toggleTranslate] attributes', attributes);

      })
    );
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        // Temp workaround (setTimeout)
        // setTimeout(() => {
        // Problem maybe in ExpressionChangedAfterItHasBeenCheckedError
        // - can't change value during change detection TODO: see how to solve this
        console.log('subscribe currentLanguage1', currentLanguage);
        this.currentLanguage = currentLanguage;
        // if (this.config) {
        this.translateAllConfiguration(currentLanguage);
        // }
        // this.setDisableByCurrentLanguage(currentLanguage);

        this.setInfoMessage(this.attributes[this.config.name], this.currentLanguage, this.defaultLanguage);
        // TODO: translate all settings
        // });
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscriptions.push(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        // console.log('subscribe defaultLanguage1', defaultLanguage);
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
        console.log('subscribe languages1', languages);
        this.languages = languages;
      })
    );
  }

  private translateAllConfiguration(currentLanguage: string) {
    this.config.settings = LocalizationHelper.translateSettings(this.config.fullSettings, this.currentLanguage, this.defaultLanguage);
    console.log('this.config.settings.Name', this.config.settings);
    this.config.label = this.config.settings.Name ? this.config.settings.Name : null;
    // LocalizationHelper.translate(currentLanguage, this.defaultLanguage, this.config.settings.Name, null);
    // TODO: transver to helper
    this.config.validation = ValidationHelper.setDefaultValidations(this.config.settings);
    this.config.required = this.config.settings.Required ? this.config.settings.Required : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, this.config.settings.Required, false);
  }

  toggleTranslate(isToggleEnabled: boolean) {
    if (isToggleEnabled) {
      if (this.group.controls[this.config.name].disabled) {
        console.log('[toggleTranslate] translateUnlink');
        this.translateUnlink(this.config.name);
      } else {
        console.log('[toggleTranslate] linkToDefault');
        this.linkToDefault(this.config.name);
      }
    }
  }

  translateUnlink(attributeKey: string) {
    console.log('this.config.name:', attributeKey);
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

    this.setControlDisableAndInfoMessage(this.attributes[attributeKey],
      attributeKey, this.currentLanguage, this.defaultLanguage);
  }

  linkToDefault(attributeKey: string) {
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);

    this.setControlDisableAndInfoMessage(this.attributes[attributeKey],
      attributeKey, this.currentLanguage, this.defaultLanguage);
  }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language
   * If value of current language don't exist then add new value
   * @param copyFromLanguageKey
   */
  onClickCopyFrom(copyFromLanguageKey: string, attributeKey: string) {
    console.log('onClickCopyFrom language', copyFromLanguageKey);
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
        console.log('[Copy all] updateItemAttributeValue ', attributeValueTranslation.value);
        console.log('[Copy all] for language  ', this.currentLanguage);
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(this.config.entityId, attributeKey,
          attributeValueTranslation.value, this.currentLanguage, this.defaultLanguage, false);
      } else {
        console.log('[Copy all] addAttributeValue ', attributeValueTranslation.value);
        console.log('[Copy all] for language  ', this.currentLanguage);
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addAttributeValue(this.config.entityId, attributeKey, this.attributes[attributeKey],
          attributeValueTranslation.value, this.currentLanguage, false);
      }
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + copyFromLanguageKey + ' because that value does not exist.');
    }

    this.setControlDisableAndInfoMessage(this.attributes[this.config.name],
      this.config.name, this.currentLanguage, this.defaultLanguage);
  }

  onClickUseFrom(languageKey: string, attributeKey: string) {
    console.log('onClickUseFrom language', languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, true);

    // TODO: investigate can only triger current language change to disable controls ???
    // this.languageService.updateCurrentLanguage(this.currentLanguage);
    this.setControlDisableAndInfoMessage(this.attributes[this.config.name], attributeKey, this.currentLanguage, this.defaultLanguage);
  }

  onClickShareWith(languageKey: string, attributeKey: string) {
    console.log('onClickShareWith language', languageKey);

    this.itemService.removeItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, false);

    this.setControlDisableAndInfoMessage(this.attributes[this.config.name], attributeKey, this.currentLanguage, this.defaultLanguage);
  }

  translateUnlinkAll() {
    Object.keys(this.attributes).forEach(attributeKey => {
      console.log('onClickCopyFromAll attributeKey', this.attributes);
      this.translateUnlink(attributeKey);
    });
  }

  linkToDefaultAll() {
    Object.keys(this.attributes).forEach(attributeKey => {
      console.log('onClickCopyFromAll attributeKey', this.attributes);
      this.linkToDefault(attributeKey);
    });
  }

  onClickCopyFromAll(languageKey) {
    Object.keys(this.attributes).forEach(attributeKey => {
      console.log('[COPY ALL] onClickCopyFromAll attributeKey', this.attributes);
      console.log('[COPY ALL] onClickUseFromAll language key', languageKey);
      console.log('[COPY ALL] onClickUseFromAll attributeKey', attributeKey);
      this.onClickCopyFrom(languageKey, attributeKey);
    });

    // TODO maybe only reselect current language to refresh form
    // console.log('update current language');
    // this.languageService.updateCurrentLanguage(this.currentLanguage);

  }

  onClickUseFromAll(languageKey) {
    Object.keys(this.attributes).forEach(attributeKey => {
      console.log('onClickUseFromAll attributeKey', this.attributes);
      this.onClickUseFrom(languageKey, attributeKey);
    });

    // this.languageService.updateCurrentLanguage(this.currentLanguage);
  }

  onClickShareWithAll(languageKey) {
    Object.keys(this.attributes).forEach(attributeKey => {
      console.log('onClickShareWithAll attributeKey', this.attributes);
      this.onClickShareWith(languageKey, attributeKey);
    });
  }

  hasLanguage = (languageKey) => {
    return LocalizationHelper.isEditableOrReadonlyTranslationExist(this.attributes[this.config.name], languageKey, this.defaultLanguage);
  }

  openMenu() {
    console.log('this.trigger.openMenu()');
    this.trigger.openMenu();
  }

  closeMenu() {
    console.log('this.trigger.closeMenu()');
    this.trigger.closeMenu();
  }

  private setControlDisableAndInfoMessage(attributes: EavValues<any>,
    attributeKey: string, currentLanguage: string, defaultLanguage: string) {

    // TODO: Find solution - How to solve? !!!!!
    // Important - need to set value for disabled controls (before disable)
    // const valueTranslated = LocalizationHelper.translate(currentLanguage,
    //   defaultLanguage, this.attributes[this.config.name], '');
    // this.group.controls[this.config.name].patchValue(valueTranslated);

    // Determine is control disabled or enabled and info message
    if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
      this.group.controls[attributeKey].enable({ emitEvent: false });
      this.infoMessage = '';
      this.enableTranslate = true;
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      this.group.controls[attributeKey].disable({ emitEvent: false });
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map(d => d.value)
        .join(', ');
      this.enableTranslate = false;
    } else {
      this.group.controls[attributeKey].disable({ emitEvent: false });
      this.infoMessage = 'auto(default)';
      this.enableTranslate = false;
    }
  }

  private setInfoMessage(attributes: EavValues<any>, currentLanguage: string, defaultLanguage: string) {
    // Determine is control disabled or enabled and info message
    if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
      this.infoMessage = '';
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map(d => d.value)
        .join(', ');
    } else {
      this.infoMessage = 'auto(default)';
    }
  }

}
