import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseComponent } from '../../fields/base/base.component';
import { TranslateMenuComponent } from './translate-menu/translate-menu.component';

@Component({
  selector: WrappersConstants.LocalizationWrapper,
  templateUrl: './localization-wrapper.component.html',
  styleUrls: ['./localization-wrapper.component.scss'],
})
export class LocalizationWrapperComponent extends BaseComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private languageInstanceService: LanguageInstanceService,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  translate() {
    if (this.formsStateService.readOnly$.value.value) { return; }
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    if (currentLanguage === defaultLanguage) { return; }
    if (!this.control.disabled) { return; }
    const isExpanded = this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid);
    if (isExpanded) { return; }

    this.translateMenu.translate();
  }
}
