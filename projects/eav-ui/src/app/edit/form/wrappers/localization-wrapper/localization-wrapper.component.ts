import { Component, inject, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { WrappersConstants } from '../../../shared/constants';
import { FormConfigService, EditRoutingService, FormsStateService } from '../../../shared/services';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { TranslateMenuComponent } from './translate-menu/translate-menu.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { FormLanguage } from '../../../shared/models/form-languages.model';
import { FieldState } from '../../builder/fields-builder/field-state';

@Component({
  selector: WrappersConstants.LocalizationWrapper,
  templateUrl: './localization-wrapper.component.html',
  styleUrls: ['./localization-wrapper.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    TranslateMenuComponent,
  ],
})
export class LocalizationWrapperComponent  implements OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  protected fieldState = inject(FieldState);

  protected config = this.fieldState.config;
  protected control = this.fieldState.control;


  language = signal<FormLanguage>(null);
  hideTranslateButton: boolean = true;

  constructor(
    private formConfig: FormConfigService,
    private languageStore: LanguageInstanceService,
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) {
  }

  ngOnInit() {
    this.language.set(this.languageStore.getLanguage(this.formConfig.config.formId));
  }

  translate() {
    if (this.formsStateService.readOnly().isReadOnly) return;
    const language = this.languageStore.getLanguage(this.formConfig.config.formId);
    if (language.current === language.primary) return;
    if (!this.control.disabled) return;
    const isExpanded = this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid);
    if (isExpanded) return;

    this.translateMenu.translate();
  }

  toggleTranslateButtonVisibility(hide: boolean) {
    this.hideTranslateButton = hide;
  }
}
