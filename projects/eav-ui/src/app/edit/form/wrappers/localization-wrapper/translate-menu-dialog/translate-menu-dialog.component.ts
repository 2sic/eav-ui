import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { EavService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService, LanguageService } from '../../../../shared/store/ngrx-data';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';
import { I18nKeys } from './translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData, TranslateMenuDialogViewModel } from './translate-menu-dialog.models';

@Component({
  selector: 'app-translate-menu-dialog',
  templateUrl: './translate-menu-dialog.component.html',
  styleUrls: ['./translate-menu-dialog.component.scss'],
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
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
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

    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const attributes$ = this.itemService.getItemAttributes$(this.dialogData.config.entityGuid);
    const languages$ = combineLatest([
      this.languageService.getLanguages$(),
      currentLanguage$,
      defaultLanguage$,
      attributes$,
      this.translationState$,
    ]).pipe(
      map(([languages, currentLanguage, defaultLanguage, attributes, translationState]) =>
        getTemplateLanguages(this.dialogData.config, currentLanguage, defaultLanguage, languages, attributes, translationState.linkType)),
    );

    this.viewModel$ = combineLatest([defaultLanguage$, languages$, this.translationState$]).pipe(
      map(([defaultLanguage, languages, translationState]) => {
        const viewModel: TranslateMenuDialogViewModel = {
          defaultLanguage,
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

  save(): void {
    const newState = this.translationState$.value;
    const oldState = this.dialogData.translationState;

    const isEqual = oldState.linkType === newState.linkType && oldState.language === newState.language;
    if (isEqual) {
      this.closeDialog();
      return;
    }

    switch (newState.linkType) {
      case TranslationLinks.Translate:
        this.fieldsTranslateService.translate(this.dialogData.config.name);
        break;
      case TranslationLinks.DontTranslate:
        this.fieldsTranslateService.dontTranslate(this.dialogData.config.name);
        break;
      case TranslationLinks.LinkReadOnly:
        this.fieldsTranslateService.linkReadOnly(this.dialogData.config.name, newState.language);
        break;
      case TranslationLinks.LinkReadWrite:
        this.fieldsTranslateService.linkReadWrite(this.dialogData.config.name, newState.language);
        break;
      case TranslationLinks.LinkCopyFrom:
        this.fieldsTranslateService.copyFrom(this.dialogData.config.name, newState.language);
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
