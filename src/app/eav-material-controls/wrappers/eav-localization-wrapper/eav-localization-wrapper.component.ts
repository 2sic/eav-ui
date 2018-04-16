import {
  Component, Input, ViewChild, ViewContainerRef,
  OnInit, EventEmitter, OnDestroy, AfterViewInit
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { EavValues } from '../../../shared/models/eav/eav-values';
import { EavValue, Language, Item, EavAttributes, EavAttributesTranslated } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';
import { ItemService } from '../../../shared/services/item.service';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { EavDimensions } from '../../../shared/models/eav/eav-dimensions';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.css']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  @Input() config: FieldConfig;
  group: FormGroup;

  enableTranslate = true;

  attributeValues$: Observable<EavValues<any>>;
  attributeValues: EavValues<any>;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  languages$: Observable<Language[]>;
  languages: Language[];
  isFocused = false;
  infoMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(private languageService: LanguageService, private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  ngOnInit() {
    this.attributeValues$ = this.itemService.selectAttributeByEntityId(this.config.entityId, this.config.name);

    this.subscribeToAttributeValues();

    // subscribe to language dataw
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.loadlanguagesFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  ngAfterViewInit() {

  }

  /**
  * Subscribe to item attribute values
  */
  private subscribeToAttributeValues() {
    this.subscriptions.push(
      this.attributeValues$.subscribe(attributeValues => {
        console.log('subscribe attributeValues1 ', attributeValues);
        this.attributeValues = attributeValues;
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
        // console.log('ajmoooooooooooooooooooooooooooooooooooooooooooooooooooooo');
        this.translateAllConfiguration(currentLanguage);
        // }
        // this.setDisableByCurrentLanguage(currentLanguage);

        this.setInfoMessageForCurrentLanguage(currentLanguage);
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
    // TODO set translation of settings

    console.log('this.config.settings.Name', this.config.settings.Name);
    this.config.label = this.config.settings.Name ? this.config.settings.Name : null;
    // LocalizationHelper.translate(currentLanguage, this.defaultLanguage, this.config.settings.Name, null);
    // TODO: transver to helper
    this.config.validation = this.setDefaultValidations(this.config.settings);
    this.config.required = this.config.settings.Required ? this.config.settings.Required : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, this.config.settings.Required, false);
  }

  /**
   * TODO: see can i write this in module configuration ???
   * @param inputType
   */
  private setDefaultValidations(settings: EavAttributesTranslated): ValidatorFn[] {

    const validation: ValidatorFn[] = [];

    const required = settings.Required ? settings.Required : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.Required, false);
    // settings.Required ? settings.Required.values[0].value : false;
    if (required) {
      validation.push(Validators.required);
    }
    const pattern = settings.ValidationRegex ? settings.ValidationRegex : '';
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.ValidationRegex, '');
    // settings.ValidationRegex ? settings.ValidationRegex.values[0].value : '';
    if (pattern) {
      validation.push(Validators.pattern(pattern));
    }

    // TODO: See do we set this here or in control
    const max = settings.Max ? settings.Max : 0;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.Max, 0);
    // settings.Max ? settings.Max.values[0].value : 0;
    if (max > 0) {
      validation.push(Validators.max(max));
    }

    // TODO: See do we set this here or in control
    const min = settings.Min ? settings.Min : 0;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.Min, 0);
    // settings.Min ? settings.Min.values[0].value : 0;
    if (min > 0) {
      validation.push(Validators.min(min));
    }

    // if (inputType === InputTypesConstants.stringUrlPath) {
    //   validation = [...['onlySimpleUrlChars']];
    // }

    return validation;
  }

  private setInfoMessageForCurrentLanguage(currentLanguage) {
    if (LocalizationHelper.isEditableTranslationExist(this.attributeValues, currentLanguage)) {
      this.infoMessage = '';
    } else if (LocalizationHelper.isReadonlyTranslationExist(this.attributeValues, currentLanguage)) {
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(this.attributeValues, currentLanguage)
        .dimensions.map(d => d.value)
        .join(', ');
    } else {
      this.infoMessage = 'auto(default)';
    }
  }

  toggleTranslate() {
    if (this.enableTranslate) {
      this.linkToDefault();
    } else {
      this.translateUnlink();
    }
  }

  translateUnlink() {
    this.itemService.removeItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage);

    const defaultValue: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributeValues,
      this.defaultLanguage
    );

    if (defaultValue) {
      this.itemService.addAttributeValue(this.config.entityId, this.config.name, this.attributeValues,
        defaultValue.value, this.currentLanguage, false);
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + this.defaultLanguage + ' because that value does not exist.');
    }
  }

  linkToDefault() {
    this.itemService.removeItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage);
  }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language
   * If value of current language don't exist then add new value
   * @param copyFromLanguageKey
   */
  onClickCopyFrom(copyFromLanguageKey) {
    console.log('onClickCopyFrom language', copyFromLanguageKey);
    const attributeValueTranslation: EavValue<any> = LocalizationHelper.getAttributeValueTranslation(
      this.attributeValues,
      copyFromLanguageKey
    );

    if (attributeValueTranslation) {
      const valueAlreadyExist: boolean = LocalizationHelper.isEditableOrReadonlyTranslationExist(
        this.attributeValues,
        this.currentLanguage
      );

      if (valueAlreadyExist) {
        // Copy attribute value where language is languageKey to value where language is current langage
        this.itemService.updateItemAttributeValue(this.config.entityId, this.config.name,
          attributeValueTranslation.value, this.currentLanguage, false);
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addAttributeValue(this.config.entityId, this.config.name, this.attributeValues,
          attributeValueTranslation.value, this.currentLanguage, false);
      }
    } else {
      console.log(this.currentLanguage + ': Cant copy value from ' + copyFromLanguageKey + ' because that value does not exist.');
    }
  }

  onClickUseFrom(languageKey) {
    console.log('onClickUseFrom language', languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage, languageKey, true);

    this.setInfoMessageForCurrentLanguage(this.currentLanguage);
  }

  onClickShareWith(languageKey) {
    console.log('onClickShareWith language', languageKey);

    this.itemService.removeItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage, languageKey, false);

    this.setInfoMessageForCurrentLanguage(this.currentLanguage);
  }

  translateUnlinkAll(languageKey) {
  }
  linkToDefaultAll(languageKey) {
  }
  onClickCopyFromAll(languageKey) {
  }
  onClickUseFromAll(languageKey) {
  }
  onClickShareWithAll(languageKey) {
  }

  hasLanguage = (languageKey) => {
    return LocalizationHelper.isEditableOrReadonlyTranslationExist(this.attributeValues, languageKey);
    // return this.attributeValues.values.filter(c => c.dimensions.find(f => f.value === languageKey)).length > 0;
  }

  openMenu() {
    this.trigger.openMenu();
  }

}
