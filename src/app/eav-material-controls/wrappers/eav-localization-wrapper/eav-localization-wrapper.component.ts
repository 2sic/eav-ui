import {
  Component, Input, ViewChild, ViewContainerRef,
  OnInit, EventEmitter, OnDestroy
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { EavValues } from '../../../shared/models/eav/eav-values';
import { EavValue, Language, Item, EavAttributes } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';
import { ItemService } from '../../../shared/services/item.service';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { EavDimensions } from '../../../shared/models/eav/eav-dimensions';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.css']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

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
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();
  }

  ngOnInit() {
    console.log('set EavLocalizationComponent oninit');

    this.attributeValues$ = this.itemService.selectAttributeByEntityId(this.config.entityId, this.config.name);

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
      this.attributeValues$.subscribe(attributeValues => {
        // console.log('subscribe attributeValues1 ', attributeValues);
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
        // console.log('subscribe currentLanguage1', currentLanguage);

        this.translateAllConfiguration(currentLanguage);
        this.setDisableByCurrentLanguage(currentLanguage);

        this.currentLanguage = currentLanguage;
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
    this.config.label = LocalizationHelper.translate(currentLanguage, this.defaultLanguage, this.config.settings.Name.values);
  }

  private setDisableByCurrentLanguage(currentLanguage) {
    if (LocalizationHelper.isEditableTranslationExist(this.attributeValues, currentLanguage)) {
      this.disableControl(false);
      this.infoMessage = '';
    } else if (LocalizationHelper.isReadonlyTranslationExist(this.attributeValues, currentLanguage)) {
      console.log('ima ', currentLanguage);
      console.log('ima1 ', this.attributeValues);
      this.disableControl(true);
      this.infoMessage = LocalizationHelper.getAttributeValueTranslation(this.attributeValues, currentLanguage)
        .dimensions.map(d => d.value)
        .join(', ');
    } else {
      this.disableControl(true);
      this.infoMessage = 'auto(default)';
    }
  }

  private disableControl(disabled: boolean) {
    console.log('disable control: ', this.config.name);
    console.log('disable control for language: ', this.currentLanguage);
    if (disabled) {
      this.enableTranslate = false;
      this.group.controls[this.config.name].disable({ emitEvent: false });
    } else {
      this.enableTranslate = true;
      this.group.controls[this.config.name].enable({ emitEvent: false });
    }
  }

  languageIconClick() {
    if (this.enableTranslate) {
      this.linkToDefault();
    } else {
      this.translateUnlink();
    }
  }

  translateUnlink() {
    console.log('enable');
    this.disableControl(false);

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
    console.log('disable');
    this.disableControl(true);

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

    this.setDisableByCurrentLanguage(this.currentLanguage);
  }

  onClickShareWith(languageKey) {
    console.log('onClickShareWith language', languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage);
    this.itemService.addItemAttributeDimension(this.config.entityId, this.config.name, this.currentLanguage, languageKey, false);

    this.setDisableByCurrentLanguage(this.currentLanguage);
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
}
