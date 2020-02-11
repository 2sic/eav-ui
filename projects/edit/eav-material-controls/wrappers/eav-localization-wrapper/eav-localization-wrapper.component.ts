import { Component, Input, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.scss']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  private subscriptions: Subscription[] = [];
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  toggleTranslateField = false;
  dialogIsOpen = false;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  get inputDisabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  ngOnInit() {
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.subscriptions.push(
      this.currentLanguage$.subscribe(currentLanguage => { this.currentLanguage = currentLanguage; }),
      this.defaultLanguage$.subscribe(defaultLanguage => { this.defaultLanguage = defaultLanguage; }),
      this.expandableFieldService.getObservable().subscribe(expandedFieldId => {
        const dialogShouldBeOpen = (this.config.field.index === expandedFieldId);
        if (dialogShouldBeOpen === this.dialogIsOpen) { return; }
        this.dialogIsOpen = dialogShouldBeOpen;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  toggleTranslate(isToggleEnabled: boolean) {
    if (isToggleEnabled) {
      this.toggleTranslateField = !this.toggleTranslateField;
    }
  }
}
