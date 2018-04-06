import {
  Component, Input, ViewChild, ViewContainerRef,
  OnInit, EventEmitter, OnDestroy
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { LanguageService } from '../../../shared/services/language.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { EavValues } from '../../../shared/models/eav/eav-values';
import { EavValue } from '../../../shared/models/eav';

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

  currentLanguage$: Observable<string>;
  private subscriptions: Subscription[] = [];

  constructor(private languageService: LanguageService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  ngOnInit() {
    // this.config.disabled = true;

    // Temp workaround
    // setTimeout(() => {
    //   this.group.controls[this.config.name].disable();
    // });

    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        // Temp workaround (setTimeout)
        setTimeout(() => {
          this.config.label = this.translate(currentLanguage, this.config.settings.Name.values);
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
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

  disableControl(disabled: boolean) {
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
}
