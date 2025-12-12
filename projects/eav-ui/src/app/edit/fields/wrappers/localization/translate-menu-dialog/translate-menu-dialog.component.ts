import { NgClass } from '@angular/common';
import { Component, computed, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { Of } from '../../../../../../../../core';
import { TranslateHelperComponent } from '../../../../../shared/components/translate-helper';
import { isCtrlS } from '../../../../dialog/main/keyboard-shortcuts';
import { TranslationStateCore } from '../../../../localization/translate-state.model';
import { TranslationLinks } from '../../../../localization/translation-link.constants';
import { FieldsTranslateService } from '../../../../state/fields-translate.service';
import { getTemplateLanguages } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData } from './translate-menu-dialog.models';

@Component({
  selector: 'app-translate-menu-dialog',
  templateUrl: './translate-menu-dialog.component.html',
  styleUrls: ['./translate-menu-dialog.component.scss'],
  imports: [
    MatCardModule,
    MatListModule,
    NgClass,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
  ]
})
export class TranslateMenuDialogComponent extends TranslateHelperComponent {

  protected languagesSig = computed(() => {
    const languages = this.languages();
    const language = this.language();
    const attributes = this.itemAttributes();
    const translationState = this.translationStateSignal();

    const fieldName = this.dialogData.isTranslateMany
      ? this.dialogData.translatableFields?.[0] ?? ''
      : this.dialogData.config.fieldName ?? '';

    return getTemplateLanguages({ fieldName }, language, languages, attributes, translationState.linkType);
  });
  
  public isPrimaryLang = computed(() => this.language().current === this.language().primary);

  constructor(
    private dialog: MatDialogRef<TranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    public fieldsTranslateService: FieldsTranslateService,
  ) {
    super(dialogData); //
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlS(event))
        event.preventDefault();
    });
  }

  setLinkType(linkType: Of<typeof TranslationLinks>): void {
    const newTranslationState: TranslationStateCore = {
      linkType,
      language: this.noLanguageRequired.includes(linkType) ? '' : this.translationStateSignal().language,
    };
    this.translationStateSignal.set(newTranslationState);
  }

  setLanguage(language: string): void {
    const newTranslationState: TranslationStateCore = { ...this.translationStateSignal(), language };
    this.translationStateSignal.set(newTranslationState);
  }

  run(): void {
    const newState = this.translationStateSignal();
    const oldState = this.dialogData.translationState;

    const noChange = oldState.linkType === newState.linkType && oldState.language === newState.language;
    if (noChange)
      return this.closeDialog();

    const applyToField = (fieldName: string) => {
      switch (newState.linkType) {
        case TranslationLinks.Translate:
          this.fieldsTranslateService.unlock(fieldName);
          break;
        case TranslationLinks.DontTranslate:
          this.fieldsTranslateService.lock(fieldName);
          break;
        case TranslationLinks.LinkReadOnly:
          this.fieldsTranslateService.linkReadOnly(fieldName, newState.language);
          break;
        case TranslationLinks.LinkReadWrite:
          this.fieldsTranslateService.linkReadWrite(fieldName, newState.language);
          break;
        case TranslationLinks.LinkCopyFrom:
          this.fieldsTranslateService.copyFrom(fieldName, newState.language);
          break;
        default:
          break;
      }
    };

    if (this.dialogData.isTranslateMany && this.dialogData.translatableFields?.length) {
      for (const fieldName of this.dialogData.translatableFields) {
        applyToField(fieldName);
      }
    } else {
      // single-field behavior (existing)
      applyToField(this.dialogData.config.fieldName!);
    }

    this.closeDialog();
  }

  private closeDialog() {
    this.dialog.close();
  }
}