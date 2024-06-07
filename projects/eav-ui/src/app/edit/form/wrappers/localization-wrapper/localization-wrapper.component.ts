import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { FormConfigService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { TranslateMenuComponent } from './translate-menu/translate-menu.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';

@Component({
    selector: WrappersConstants.LocalizationWrapper,
    templateUrl: './localization-wrapper.component.html',
    styleUrls: ['./localization-wrapper.component.scss'],
    standalone: true,
    imports: [
        NgClass,
        ExtendedModule,
        TranslateMenuComponent,
        AsyncPipe,
    ],
})
export class LocalizationWrapperComponent extends BaseFieldComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  hideTranslateButton: boolean = true;

  constructor(
    private formConfig: FormConfigService,
    fieldsSettingsService: FieldsSettingsService,
    private languageInstanceService: LanguageInstanceService,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) {
    super(fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.formConfig.config.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.formConfig.config.formId);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  translate() {
    if (this.formsStateService.readOnly$.value.isReadOnly) { return; }
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.formConfig.config.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.formConfig.config.formId);
    if (currentLanguage === defaultLanguage) { return; }
    if (!this.control.disabled) { return; }
    const isExpanded = this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid);
    if (isExpanded) { return; }

    this.translateMenu.translate();
  }

  toggleTranslateButtonVisibility(hide: boolean) {
    this.hideTranslateButton = hide;
  }
}
