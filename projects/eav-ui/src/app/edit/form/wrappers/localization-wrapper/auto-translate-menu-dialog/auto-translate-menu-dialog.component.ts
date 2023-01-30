import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateMenuDialogData, TranslateMenuDialogTemplateVars } from '../translate-menu-dialog/translate-menu-dialog.models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { EavService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService, LanguageService } from '../../../../shared/store/ngrx-data';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';
import { I18nKeys } from '../translate-menu-dialog/translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages, getTemplateLanguagesWithContent } from '../translate-menu-dialog/translate-menu-dialog.helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarWarningDemoComponent } from '../snack-bar-warning-demo/snack-bar-warning-demo.component';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';

@Component({
  selector: 'app-auto-translate-menu-dialog',
  templateUrl: './auto-translate-menu-dialog.component.html',
  styleUrls: ['./auto-translate-menu-dialog.component.scss'],
})
export class AutoTranslateMenuDialogComponent implements OnInit, OnDestroy {
  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;
  templateVars$: Observable<TranslateMenuDialogTemplateVars>;

  private translationState$: BehaviorSubject<TranslationStateCore>;
  private noLanguageRequired: TranslationLink[];
  private isTranslateWithGoogleFeatureEnabled$ = new BehaviorSubject<boolean>(false);
  private subscription: Subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AutoTranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsTranslateService: FieldsTranslateService,
    private snackBar: MatSnackBar,
    private featuresService: FeaturesService,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit(): void {
    const isTranslateWithGoogleFeatureEnabled$ = this.featuresService.isEnabled$(FeatureNames.EditUiTranslateWithGoogle);
    this.subscription.add(isTranslateWithGoogleFeatureEnabled$
      .pipe(distinctUntilChanged())
      .subscribe(this.isTranslateWithGoogleFeatureEnabled$
      ));
    if (this.isTranslateWithGoogleFeatureEnabled$.value) {
      this.snackBar.openFromComponent(SnackBarWarningDemoComponent);
      this.dialogRef.afterClosed().subscribe(() => {
        this.snackBar.dismiss();
      });
    }

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
      map(([languages, currentLanguage, defaultLanguage, attributes, translationState]) => {
        return this.dialogData.isTranslateMany ? getTemplateLanguagesWithContent(currentLanguage, defaultLanguage, languages, attributes, translationState.linkType, this.dialogData.translatableFields)
          : getTemplateLanguages(this.dialogData.config, currentLanguage, defaultLanguage, languages, attributes, translationState.linkType);
      }),
    );

    this.templateVars$ = combineLatest([defaultLanguage$, languages$, this.translationState$, isTranslateWithGoogleFeatureEnabled$]).pipe(
      map(([defaultLanguage, languages, translationState, isTranslateWithGoogleFeatureEnabled]) => {
        const templateVars: TranslateMenuDialogTemplateVars = {
          defaultLanguage,
          languages,
          translationState,
          showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
          i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
          submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
          isTranslateWithGoogleFeatureEnabled
        };
        return templateVars;
      }),
    );
  }

  setLanguage(language: string): void {
    const newTranslationState: TranslationStateCore = { ...this.translationState$.value, language };
    this.translationState$.next(newTranslationState);

    const oldState = this.dialogData.translationState;
    const isEqual = oldState.language === newTranslationState.language;
    if (isEqual) {
      this.closeDialog();
      return;
    }

    this.dialogData.isTranslateMany ? this.fieldsTranslateService.autoTranslateMany(newTranslationState.language)
      : this.fieldsTranslateService.autoTranslate([this.dialogData.config.name], newTranslationState.language, true);
  

    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.translationState$.complete();
  }
}