import { Component, computed, Inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { FormConfigService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService, LanguageService } from '../../../../shared/store/ngrx-data';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';
import { I18nKeys } from './translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages } from './translate-menu-dialog.helpers';
import { TranslateMenuDialogData, TranslateMenuDialogViewModel } from './translate-menu-dialog.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { toSignal } from '@angular/core/rxjs-interop';
import { Language } from '../../../../shared/models';
import { FormLanguage } from '../../../../shared/models/form-languages.model';
import { EavEntityAttributes } from '../../../../shared/models/eav';

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
    TranslateModule,
  ],
})
export class TranslateMenuDialogComponent implements OnInit, OnDestroy {
  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;
  viewModel: WritableSignal<TranslateMenuDialogViewModel> = signal(null);
  translationState = signal<TranslationStateCore>(null);

  langs = signal<Language[]>(null);
  languageForm = signal<FormLanguage>(null);
  attributes = signal<EavEntityAttributes>(null);

  private translationState$: BehaviorSubject<TranslationStateCore>;
  private noLanguageRequired: TranslationLink[];

  constructor(
    private dialogRef: MatDialogRef<TranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageStore: LanguageInstanceService,
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

    this.translationState.set(this.dialogData.translationState);
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];

    this.languageService.getLanguages$().subscribe(languages => {
      this.langs.set(languages);
    });
    this.languageStore.getLanguage$(this.formConfig.config.formId).subscribe(languagesStore => {
      this.languageForm.set(languagesStore);
    });

    this.itemService.getItemAttributes$(this.dialogData.config.entityGuid).subscribe(attributes => {
      this.attributes.set(attributes);
    });

    const languages = computed(() => {
      return getTemplateLanguages(
        this.dialogData.config,
        this.languageForm(),
        this.langs(),
        this.attributes(),
        this.translationState().linkType
      );
    });
    const viewModel = computed(() => {
      const translationState = this.translationState();
      return {
        primary: this.languageForm().primary,
        languages: languages(),
        translationState,
        showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
        i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
        submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
      };
    });

    this.viewModel.set(viewModel());
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
