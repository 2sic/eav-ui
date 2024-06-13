import { Component, Inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { FormConfigService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService, LanguageService } from '../../../../shared/store/ngrx-data';
import { SnackBarWarningDemoComponent } from '../snack-bar-warning-demo/snack-bar-warning-demo.component';
import { I18nKeys } from '../translate-menu-dialog/translate-menu-dialog.constants';
import { findI18nKey, getTemplateLanguages, getTemplateLanguagesWithContent } from '../translate-menu-dialog/translate-menu-dialog.helpers';
import { TranslateMenuDialogData, TranslateMenuDialogViewModel } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslationStateCore } from '../translate-menu/translate-menu.models';
import { EditApiKeyPaths } from './../../../../../shared/constants/eav.constants';
import { ApiKeySpecs } from './../../../../../shared/models/dialog-context.models';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { FeatureTextInfoComponent } from '../../../../../features/feature-text-info/feature-text-info.component';
import { MatCardModule } from '@angular/material/card';

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
    SharedComponentsModule,
    TranslateModule,
  ],
})
export class AutoTranslateMenuDialogComponent implements OnInit, OnDestroy {
  TranslationLinks = TranslationLinks;
  I18nKeys = I18nKeys;
  viewModel: WritableSignal<TranslateMenuDialogViewModel> = signal(null);

  private translationState$: BehaviorSubject<TranslationStateCore>;
  private isTranslateWithGoogleFeatureEnabled$ = new BehaviorSubject<boolean>(false);
  private noLanguageRequired: TranslationLink[];
  private subscription: Subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<AutoTranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private languageService: LanguageService,
    private languageStore: LanguageInstanceService,
    private itemService: ItemService,
    private formConfig: FormConfigService,
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
      .subscribe(this.isTranslateWithGoogleFeatureEnabled$)
    );


    // If not enabled, ensure that after closed ...??? @STV
    if (this.isTranslateWithGoogleFeatureEnabled$.value) {
      this.dialogRef.afterClosed().subscribe(() => {
        this.snackBar.dismiss();
      });
    }

    // If the demo API key is being used, show snackbar warning
    const apiKeyInfo = this.formConfig.settings.Values[EditApiKeyPaths.GoogleTranslate] as ApiKeySpecs;
    if (apiKeyInfo.IsDemo)
      this.snackBar.openFromComponent(SnackBarWarningDemoComponent);


    this.translationState$ = new BehaviorSubject(this.dialogData.translationState);
    this.noLanguageRequired = [TranslationLinks.Translate, TranslationLinks.DontTranslate];

    const language$ = this.languageStore.getLanguage$(this.formConfig.config.formId);
    const attributes$ = this.itemService.getItemAttributes$(this.dialogData.config.entityGuid);

    const languages$ = combineLatest([
      this.languageService.getLanguages$(),
      language$,
      attributes$,
      this.translationState$,
    ]).pipe(
      map(([languages, language, attributes, translationState]) => {
        return this.dialogData.isTranslateMany
          ? getTemplateLanguagesWithContent(language, languages, attributes, translationState.linkType, this.dialogData.translatableFields)
          : getTemplateLanguages(this.dialogData.config, language, languages, attributes, translationState.linkType);
      }),
    );

    combineLatest([language$, languages$, this.translationState$, isTranslateWithGoogleFeatureEnabled$]).pipe(
      map(([lang, languages, translationState, isTranslateWithGoogleFeatureEnabled]) => {
        return {
          primary: lang.primary,
          languages,
          translationState,
          showLanguageSelection: !this.noLanguageRequired.includes(translationState.linkType),
          i18nRoot: `LangMenu.Dialog.${findI18nKey(translationState.linkType)}`,
          submitDisabled: translationState.language === '' && !this.noLanguageRequired.includes(translationState.linkType),
          isTranslateWithGoogleFeatureEnabled
        };
      }),
    ).subscribe(v => this.viewModel.set(v));



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
      : this.fieldsTranslateService.autoTranslate([this.dialogData.config.name], newTranslationState.language);

    this.closeDialog();
  }

  private closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.translationState$.complete();
  }
}
