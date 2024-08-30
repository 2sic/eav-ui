import { Component, computed, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslationStateCore } from '../../../../state/translate-state.model';
import { getTemplateLanguages } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData } from './translate-menu-dialog.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { TranslationLink, TranslationLinks } from '../../../../localization/translation-link.constants';
import { FieldsTranslateService } from '../../../../state/fields-translate.service';
import { TranslateHelperComponent } from '../../../../../shared/components/translate-helper.component';

interface TranslationInfo {
  showLanguageSelection: boolean;
  i18nRoot: string;
  submitDisabled: boolean;
}

@Component({
  selector: 'app-translate-menu-dialog',
  templateUrl: './translate-menu-dialog.component.html',
  styleUrls: ['./translate-menu-dialog.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    NgClass,
    ExtendedModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
    TranslateModule,
  ],
})
export class TranslateMenuDialogComponent extends TranslateHelperComponent {

  protected languagesSig = computed(() => {
    const languages = this.languages();
    const language = this.language();
    const attributes = this.itemAttributes();
    const translationState = this.translationStateSignal();

    return getTemplateLanguages(this.dialogData.config, language, languages, attributes, translationState.linkType);
  });

  constructor(
    private dialogRef: MatDialogRef<TranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    public fieldsTranslateService: FieldsTranslateService,
  ) {
    super(dialogData); //
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  setLinkType(linkType: TranslationLink): void {
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

    switch (newState.linkType) {
      case TranslationLinks.Translate:
        this.fieldsTranslateService.unlock(this.dialogData.config.fieldName);
        break;
      case TranslationLinks.DontTranslate:
        this.fieldsTranslateService.lock(this.dialogData.config.fieldName);
        break;
      case TranslationLinks.LinkReadOnly:
        this.fieldsTranslateService.linkReadOnly(this.dialogData.config.fieldName, newState.language);
        break;
      case TranslationLinks.LinkReadWrite:
        this.fieldsTranslateService.linkReadWrite(this.dialogData.config.fieldName, newState.language);
        break;
      case TranslationLinks.LinkCopyFrom:
        this.fieldsTranslateService.copyFrom(this.dialogData.config.fieldName, newState.language);
        break;
      default:
        break;
    }
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
