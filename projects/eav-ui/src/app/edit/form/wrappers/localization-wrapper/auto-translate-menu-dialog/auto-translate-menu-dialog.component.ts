import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { FormConfigService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageService } from '../../../../shared/store/ngrx-data';
import { SnackBarWarningDemoComponent } from '../snack-bar-warning-demo/snack-bar-warning-demo.component';
import { I18nKeys } from '../translate-menu-dialog/translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages, getTemplateLanguagesWithContent } from '../translate-menu-dialog/translate-menu-dialog.helpers';
import { TranslateMenuDialogData, TranslateMenuDialogViewModel } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';
import { EditApiKeyPaths } from './../../../../../shared/constants/eav.constants';
import { ApiKeySpecs } from './../../../../../shared/models/dialog-context.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { FeatureTextInfoComponent } from '../../../../../features/feature-text-info/feature-text-info.component';
import { MatCardModule } from '@angular/material/card';
import { SafeHtmlPipe } from 'projects/eav-ui/src/app/shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-auto-translate-menu-dialog',
  templateUrl: './auto-translate-menu-dialog.component.html',
  styleUrls: ['./auto-translate-menu-dialog.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    FeatureTextInfoComponent,
    MatListModule,
    NgClass,
    ExtendedModule,
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    SafeHtmlPipe,
  ],
})
export class AutoTranslateMenuDialogComponent implements OnInit, OnDestroy {
  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;
  viewModel$: Observable<TranslateMenuDialogViewModel>;

  private translationState$: BehaviorSubject<TranslationStateCore>;
  private noLanguageRequired: TranslationLink[];

  public features: FeaturesService = inject(FeaturesService);
  public isTranslateWithGoogleFeatureEnabled = this.features.isEnabled(FeatureNames.EditUiTranslateWithGoogle);

  constructor(
    private dialogRef: MatDialogRef<AutoTranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private itemService: ItemService,
    private formConfig: FormConfigService,
    private fieldsTranslateService: FieldsTranslateService,
    private snackBar: MatSnackBar,
  ) {
    this.dialogRef.keydownEvents().subscribe(event => {
      const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
      if (!CTRL_S) { return; }
      event.preventDefault();
    });
  }

  ngOnInit(): void {

    // If not enabled, ensure that after closed ...??? @STV
    if (this.isTranslateWithGoogleFeatureEnabled)
      this.dialogRef.afterClosed().subscribe(() => this.snackBar.dismiss());

    // If the demo API key is being used, show snackbar warning
    const apiKeyInfo = this.formConfig.settings.Values[EditApiKeyPaths.GoogleTranslate] as ApiKeySpecs;
    if (apiKeyInfo.IsDemo)
      this.snackBar.openFromComponent(SnackBarWarningDemoComponent);


    this.translationState$ = new BehaviorSubject(this.dialogData.translationState);
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];

    const attributes$ = this.itemService.getItemAttributes$(this.dialogData.config.entityGuid);
    const languages$ = combineLatest([
      this.languageService.getLanguages$(),
      this.formConfig.language$,
      attributes$,
      this.translationState$,
    ]).pipe(
      map(([languages, language, attributes, translationState]) => {
        return this.dialogData.isTranslateMany
          ? getTemplateLanguagesWithContent(language, languages, attributes, translationState.linkType, this.dialogData.translatableFields)
          : getTemplateLanguages(this.dialogData.config, language, languages, attributes, translationState.linkType);
      }),
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

  setLanguage(language: string): void {
    const newTranslationState: TranslationStateCore = { ...this.translationState$.value, language };
    this.translationState$.next(newTranslationState);

    const oldState = this.dialogData.translationState;
    const isEqual = oldState.language === newTranslationState.language;
    if (isEqual) {
      this.closeDialog();
      return;
    }

    this.dialogData.isTranslateMany
      ? this.fieldsTranslateService.autoTranslateMany(newTranslationState.language)
      : this.fieldsTranslateService.autoTranslate([this.dialogData.config.fieldName], newTranslationState.language);

    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.translationState$.complete();
  }
}
