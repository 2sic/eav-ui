import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { FormConfigService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageService } from '../../../../shared/store/ngrx-data';
import { TranslationStateCore } from '../../../../fields/wrappers/localization/translate-menu/translate-menu.models';
import { I18nKeys } from './translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData, TranslateMenuDialogViewModel } from './translate-menu-dialog.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { TranslationLink, TranslationLinks } from '../../../../localization/translation-link.constants';

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
export class TranslateMenuDialogComponent implements OnInit, OnDestroy {
  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;
  viewModel$: Observable<TranslateMenuDialogViewModel>;

  private translationState$: BehaviorSubject<TranslationStateCore>;
  private noLanguageRequired: TranslationLink[];

  constructor(
    private dialogRef: MatDialogRef<TranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private itemService: ItemService,
    private formConfig: FormConfigService,
    private fieldsTranslateService: FieldsTranslateService,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit(): void {
    this.translationState$ = new BehaviorSubject(this.dialogData.translationState);
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];

    const attributes$ = this.itemService.getItemAttributes$(this.dialogData.config.entityGuid);
    const languages$ = combineLatest([
      this.languageService.getLanguages$(),
      this.formConfig.language$,
      attributes$,
      this.translationState$,
    ]).pipe(
      map(([languages, language, attributes, translationState]) =>
        getTemplateLanguages(this.dialogData.config, language, languages, attributes, translationState.linkType)),
    );

    this.viewModel$ = combineLatest([this.formConfig.language$, languages$, this.translationState$]).pipe(
      map(([lang, languages, translationState]) => {
        const viewModel: TranslateMenuDialogViewModel = {
          primary: lang.primary,
          languages,
          translationState,
          showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
          i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
          submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    this.translationState$.complete();
  }

  setLinkType(linkType: TranslationLink): void {
    const newTranslationState: TranslationStateCore = {
      linkType,
      language: this.noLanguageRequired.includes(linkType) ? '' : this.translationState$.value.language,
    };
    this.translationState$.next(newTranslationState);
  }

  setLanguage(language: string): void {
    const newTranslationState: TranslationStateCore = { ...this.translationState$.value, language };
    this.translationState$.next(newTranslationState);
  }

  run(): void {
    const newState = this.translationState$.value;
    const oldState = this.dialogData.translationState;

    const noChange = oldState.linkType === newState.linkType && oldState.language === newState.language;
    if (noChange)
      return this.closeDialog();

    switch (newState.linkType) {
      case TranslationLinks.Translate:
        this.fieldsTranslateService.translate(this.dialogData.config.fieldName);
        break;
      case TranslationLinks.DontTranslate:
        this.fieldsTranslateService.dontTranslate(this.dialogData.config.fieldName);
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
