import { Component, computed, inject, Inject, Signal, signal } from '@angular/core';
import { TranslationLink, TranslationLinks } from '../../edit/localization/translation-link.constants';
import { I18nKeys } from '../../edit/fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.constants';
import { FormConfigService } from '../../edit/form/form-config.service';
import { TranslateMenuDialogData } from '../../edit/fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SignalEquals } from '../signals/signal-equals';
import { findI18nKey } from '../../edit/fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.helpers';
import { TranslationStateCore } from '../../edit/localization/translate-state.model';
import { LanguageService } from '../../edit/localization/language.service';
import { ItemService } from '../../edit/state/item.service';

interface TranslationInfo {
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}

@Component({
  selector: 'app-translate-helper-component',
  template: ''
})
export abstract class TranslateHelperComponent {

  private languageService: LanguageService = inject(LanguageService);
  private itemService: ItemService = inject(ItemService);
  public formConfig: FormConfigService = inject(FormConfigService);

  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;

  public noLanguageRequired: TranslationLink[];

  protected language = this.formConfig.language;
  public translationStateSignal = signal<TranslationStateCore>(this.dialogData.translationState);

  protected translationInfo: Signal<TranslationInfo> = computed<TranslationInfo>(() => {
    const translationState = this.translationStateSignal();
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];
    return {
      showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
      i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
      submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
    };
  }, SignalEquals.object);

  protected languages = this.languageService.getAllSignal();
  protected itemAttributes = this.itemService.itemAttributesSignal(this.dialogData.config.entityGuid);

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData) {}

}
