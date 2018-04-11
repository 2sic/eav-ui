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

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.css']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  disabled = true;

  attributeValues$: Observable<EavValues<any>>;
  attributeValues: EavValues<any>;
  currentLanguage$: Observable<string>;
  currentLanguage: string;
  languages$: Observable<Language[]>;
  languages: Language[];
  isFocused = false;

  private subscriptions: Subscription[] = [];

  constructor(private languageService: LanguageService, private itemService: ItemService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  ngOnInit() {
    console.log('set EavLocalizationComponent oninit');

    console.log('this.config.entityId)', this.config);
    this.attributeValues$ = this.itemService.selectAttributeByEntityId(this.config.entityId, this.config.name);

    this.subscribeToAttributeValues();

    this.subscribeToCurrentLanguageFromStore();

    this.loadlanguagesFromStore();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * Subscribe to item attribute values
   */
  subscribeToAttributeValues() {
    this.subscriptions.push(
      this.attributeValues$.subscribe(attributeValues => {
        console.log('subscribe attributeValues ', attributeValues);
        this.attributeValues = attributeValues;
      })
    );
  }

  subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        // Temp workaround (setTimeout)
        // setTimeout(() => {
        // Problem maybe in ExpressionChangedAfterItHasBeenCheckedError
        // - can't change value during change detection TODO: see how to solve this
        console.log('subscribe currentLanguage', currentLanguage);
        this.config.label = this.translate(currentLanguage, this.config.settings.Name.values);

        this.currentLanguage = currentLanguage;
        // TODO: translate all settings
        // });
      })
    );
  }

  /**
   * Load languages from store and subscribe to languages
   */
  loadlanguagesFromStore() {
    this.languages$ = this.languageService.selectAllLanguages();

    this.subscriptions.push(
      this.languages$.subscribe(languages => {
        this.languages = languages;
      })
    );
  }

  /**
   * get translated value for currentLanguage
   * @param currentLanguage
   * @param values
   */
  translate(currentLanguage: string, values: EavValue<any>[]): string {
    const translations: EavValue<any>[] = values.filter(c => c.dimensions.find(f => f.value === currentLanguage));

    if (translations.length > 0) {
      console.log('translate value', translations[0].value);
      this.disableControl(false);
      return translations[0].value;
    } else {
      console.log('translate value1', values[0].value);
      this.disableControl(true);
      return values[0].value; // TODO: get default language value ???
    }
  }

  private disableControl(disabled: boolean) {
    if (disabled) {
      this.disabled = true;
      this.group.controls[this.config.name].disable({ emitEvent: false });
    } else {
      this.disabled = false;
      this.group.controls[this.config.name].enable({ emitEvent: false });
    }
  }

  // Temp
  enable() {
    if (this.disabled) {
      this.disableControl(false);
    } else {
      this.disableControl(true);
    }
  }

  translateUnlink() {
    this.disableControl(false);
  }

  onClickCopyFrom(languageKey) {
    console.log('onClickCopyFrom language', languageKey);
  }

  onClickUseFrom(languageKey) {
    console.log('onClickUseFrom language', languageKey);
    const newEavAttributes: EavAttributes = new EavAttributes();
    // if new value exist update attribute for current language
    console.log(`onClickUseFrom entityId ${this.config.entityId}
    this.config.name ${this.config.name}
    this.attributeValues: ${this.attributeValues}
    languageKey: ${languageKey}
    this.currentLanguage ${this.currentLanguage}`);
    this.itemService.updateAttributeDimension(this.config.entityId, this.config.name, this.attributeValues,
      languageKey, this.currentLanguage, true);
  }

  // /**
  //  * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
  //  * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
  //  * @param entityId
  //  * @param attributeKey
  //  * @param oldAttributeValues
  //  * @param useFromLanguageKey
  //  * @param languageKey
  //  */
  // updateAttributeDimension(
  //   entityId: number,
  //   attributeKey: string,
  //   oldAttributeValues: EavValues<any>,
  //   useFromLanguageKey: string,
  //   languageKey: string,
  //   isReadOnly: boolean) {
  //   console.log('onClickUseFrom useFromLanguageKey', useFromLanguageKey);
  //   let newValue = languageKey;

  //   if (isReadOnly) {
  //     newValue = `-${languageKey}`;
  //   }

  //   const newEavAttributes: EavAttributes = new EavAttributes();
  //   newEavAttributes[attributeKey] = {
  //     ...oldAttributeValues, values: oldAttributeValues.values.map(eavValue => {
  //       return eavValue.dimensions.find(d => d.value === useFromLanguageKey)
  //         // Update dimension for current language
  //         ? {
  //           ...eavValue,
  //           // if languageKey already exist
  //           dimensions: (eavValue.dimensions.find(d => d.value === languageKey || d.value === `-${languageKey}`))
  //             // update languageKey with newValue
  //             ? eavValue.dimensions.map(dimension => {
  //               return (dimension.value === languageKey || dimension.value === `-${languageKey}`)
  //                 ? { value: newValue }
  //                 : dimension;
  //             })
  //             // add new dimension newValue
  //             : eavValue.dimensions.concat({ value: newValue })
  //         }
  //         : eavValue;
  //     })
  //   };

  //   if (Object.keys(newEavAttributes).length > 0) {
  //     this.itemService.updateItemAttribute(entityId, newEavAttributes[attributeKey], attributeKey);
  //   }

  //   // copy value from language and add current language with - to dimension
  // }

  onClickShareWith(languageKey) {
    console.log('onClickShareWith language', languageKey);
  }

  hasLanguage = (languageKey) => {
    return this.attributeValues.values.filter(c => c.dimensions.find(f => f.value === languageKey)).length > 0;
  }
}
