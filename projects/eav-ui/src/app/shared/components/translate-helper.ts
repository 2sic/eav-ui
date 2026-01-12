import { Component, inject, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Of } from '../../../../../core';
import { I18nKeys } from '../../edit/fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.constants';
import { findI18nKey } from '../../edit/fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.helpers';
import { TranslateMenuDialogData } from '../../edit/fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { FormConfigService } from '../../edit/form/form-config.service';
import { LanguageService } from '../../edit/localization/language.service';
import { TranslationStateCore } from '../../edit/localization/translate-state.model';
import { TranslationLinks } from '../../edit/localization/translation-link.constants';
import { ItemService } from '../../edit/state/item.service';
import { computedObj } from '../signals/signal.utilities';

interface TranslationInfo {
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}

@Component({
  selector: 'app-translate-helper-base',
  template: '',
})
export abstract class TranslateHelperComponent {

  #languageService = inject(LanguageService);
  #itemService = inject(ItemService);
  public formConfig = inject(FormConfigService);

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData) {}

  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;

  public noLanguageRequired: Of<typeof TranslationLinks>[];

  protected language = this.formConfig.language;
  public translationStateSignal = signal<TranslationStateCore>(this.dialogData.translationState);

  protected translationInfo = computedObj<TranslationInfo>('translationInfo', () => {
    const translationState = this.translationStateSignal();
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];
    return {
      showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
      i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
      submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
    };
  });

  protected languages = this.#languageService.getAllSignal();
  protected itemAttributes = this.#itemService.itemAttributesSignal(this.dialogData.config.entityGuid);

}
