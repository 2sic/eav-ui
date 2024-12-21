import { NgClass } from '@angular/common';
import { Component, Inject, OnInit, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureNames } from '../../../features/feature-names';
import { FeatureTextInfoComponent } from '../../../features/feature-text-info/feature-text-info.component';
import { FeaturesService } from '../../../features/features.service';
import { TranslateHelperComponent } from '../../../shared/components/translate-helper.component';
import { EditApiKeyPaths } from '../../../shared/constants/eav.constants';
import { ApiKeySpecs } from '../../../shared/models/dialog-context.models';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { isCtrlS } from '../../dialog/main/keyboard-shortcuts';
import { getTemplateLanguages, getTemplateLanguagesWithContent } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.helpers';
import { TranslateMenuDialogData } from '../../fields/wrappers/localization/translate-menu-dialog/translate-menu-dialog.models';
import { FieldsTranslateService } from '../../state/fields-translate.service';
import { SnackBarWarningDemoComponent } from '../snack-bar-warning-demo/snack-bar-warning-demo.component';
import { TranslationStateCore } from '../translate-state.model';

@Component({
  selector: 'app-auto-translate-menu-dialog',
  templateUrl: './auto-translate-menu-dialog.component.html',
  styleUrls: ['./auto-translate-menu-dialog.component.scss'],
  imports: [
    MatCardModule,
    FeatureTextInfoComponent,
    MatListModule,
    NgClass,
    MatIconModule,
    TranslateModule,
    SafeHtmlPipe,
  ]
})
export class AutoTranslateMenuDialogComponent extends TranslateHelperComponent implements OnInit {

  public features = inject(FeaturesService);
  public isTranslateWithGoogleFeatureEnabled = this.features.isEnabled[FeatureNames.EditUiTranslateWithGoogle];

  protected languagesSig = computed(() => {
    const languages = this.languages();
    const language = this.language();
    const attributes = this.itemAttributes();
    const translationState = this.translationStateSignal();

    return this.dialogData.isTranslateMany
      ? getTemplateLanguagesWithContent(language, languages, attributes, translationState.linkType, this.dialogData.translatableFields)
      : getTemplateLanguages(this.dialogData.config, language, languages, attributes, translationState.linkType);
  });

  constructor(
    private dialog: MatDialogRef<AutoTranslateMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: TranslateMenuDialogData,
    private fieldsTranslateService: FieldsTranslateService,
    private snackBar: MatSnackBar,
  ) {
    super(dialogData);
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlS(event))
        event.preventDefault();
    });
  }

  ngOnInit(): void {

    // If not enabled, ensure that after closed ...??? @STV
    if (this.isTranslateWithGoogleFeatureEnabled())
      this.dialog.afterClosed().subscribe(() => this.snackBar.dismiss());

    // If the demo API key is being used, show snackbar warning
    const apiKeyInfo = this.formConfig.settings.Values[EditApiKeyPaths.GoogleTranslate] as ApiKeySpecs;
    if (apiKeyInfo.IsDemo)
      this.snackBar.openFromComponent(SnackBarWarningDemoComponent);
  }

  setLanguage(language: string): void {
    const newTranslationState: TranslationStateCore = { ...this.translationStateSignal(), language };
    this.translationStateSignal.set(newTranslationState);

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
    this.dialog.close();
  }

}
