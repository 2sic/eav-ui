import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { LanguageService } from '../../../shared/services/language.service';
import { ItemService } from '../../../shared/services/item.service';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.scss']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;

  @Input() config: FieldConfigSet;
  group: FormGroup;

  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  toggleTranslateField = false;

  private subscriptions: Subscription[] = [];

  constructor(private languageService: LanguageService,
    private itemService: ItemService) {
    this.currentLanguage$ = this.languageService.getCurrentLanguage();
    this.defaultLanguage$ = this.languageService.getDefaultLanguage();
  }

  get inputDisabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  ngOnInit() {
    //  this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.itemConfig.entityId, this.config.itemConfig.entityGuid);

    // this.subscribeToAttributeValues();
    // this.subscribeMenuChange();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  toggleTranslate(isToggleEnabled: boolean) {
    if (isToggleEnabled) {
      this.toggleTranslateField = !this.toggleTranslateField;
    }
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
        // this.translateAllConfiguration(this.currentLanguage);
        // this.refreshControlConfig(this.config.currentFieldConfig.name);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscriptions.push(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;

        // this.translateAllConfiguration(this.currentLanguage);
        // this.setControlDisable(this.attributes[this.config.currentFieldConfig.name], this.config.currentFieldConfig.name,
        // this.currentLanguage, this.defaultLanguage);
        // this.setAdamDisable();
        // this.setInfoMessage(this.attributes[this.config.currentFieldConfig.name], this.currentLanguage, this.defaultLanguage);
      })
    );
  }
}
