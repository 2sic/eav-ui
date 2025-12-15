import { NgClass } from '@angular/common';
import { Component, computed, inject, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { UserLanguageService } from 'projects/eav-ui/src/app/shared/services/user-language.service';
import { FormConfigService } from '../../../form/form-config.service';
import { FormsStateService } from '../../../form/forms-state.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';
import { TranslateMenuComponent } from './translate-menu/translate-menu';

@Component({
  selector: WrappersCatalog.LocalizationWrapper,
  templateUrl: './localization-wrapper.html',
  styleUrls: ['./localization-wrapper.scss'],
  imports: [
    NgClass,
    TranslateMenuComponent,
  ]
})
export class LocalizationWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(TranslateMenuComponent) private translateMenu: TranslateMenuComponent;

  #formConfig = inject(FormConfigService);
  #fieldState = inject(FieldState);

  protected language = this.#formConfig.language;

  private userLanguageSvc = inject(UserLanguageService);
  translatePrimaryLanguage = signal<boolean>(false);

  hasMultipleLanguages = computed(() => {
    return this.#formConfig.languages.list.length > 1;
  });

  canTranslate = computed(() => {
    return this.hasMultipleLanguages() && (this.language().current !== this.language().primary || this.translatePrimaryLanguage());
  });

  hideTranslateButton: boolean = true;

  constructor(
    private editRoutingService: EditRoutingService,
    private formsStateService: FormsStateService,
  ) {
    this.translatePrimaryLanguage.set(this.userLanguageSvc.primaryTranslatableEnabled());
  }

  translate() {
    if (this.formsStateService.readOnly().isReadOnly) return;
    const language = this.#formConfig.language();
    if (language.current === language.primary) return;
    if (!this.#fieldState.ui().disabled) return;
    const config = this.#fieldState.config;
    const isExpanded = this.editRoutingService.isExpanded(config.index, config.entityGuid);
    if (isExpanded) return;

    this.translateMenu.translate();
  }

  toggleTranslateButtonVisibility(hide: boolean) {
    this.hideTranslateButton = hide;
  }
}
