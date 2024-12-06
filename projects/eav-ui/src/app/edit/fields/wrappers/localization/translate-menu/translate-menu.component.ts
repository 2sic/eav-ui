import { NgClass } from '@angular/common';
import { Component, inject, input, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import { computedObj } from '../../../../../shared/signals/signal.utilities';
import { FormConfigService } from '../../../../form/form-config.service';
import { FormsStateService } from '../../../../form/forms-state.service';
import { AutoTranslateDisabledWarningDialog } from '../../../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslationState } from '../../../../localization/translate-state.model';
import { TranslationLinks } from '../../../../localization/translation-link.constants';
import { FieldsTranslateService } from '../../../../state/fields-translate.service';
import { FieldState } from '../../../field-state';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';

@Component({
    selector: 'app-translate-menu',
    templateUrl: './translate-menu.component.html',
    styleUrls: ['./translate-menu.component.scss'],
    imports: [
        NgClass,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        FeatureIconIndicatorComponent,
        TranslateModule,
        TippyDirective,
    ]
})
export class TranslateMenuComponent {
  hideTranslateButton = input<boolean>();

  #fieldState = inject(FieldState);
  #formsStateService = inject(FormsStateService);

  TranslationLinks = TranslationLinks;

  protected translationState = this.#fieldState.translationState; // this.fieldSettings.translationState[this.#fieldState.name];
  protected language = this.formConfig.language;

  protected disabled = computedObj('disabled', () => this.#fieldState.ui().disabled);

  translationStateClass = computedObj('translationStateClass', () => TranslateMenuHelpers.getTranslationStateClass(this.translationState().linkType));

  disableTranslateButtonSignal = computedObj('disableTranslateButtonSignal',
    () => this.#formsStateService.readOnly().isReadOnly || this.#fieldState.settings().DisableTranslation
  );

  constructor(
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private formConfig: FormConfigService,
    private fieldsTranslate: FieldsTranslateService,
  ) { }

  translate(): void {
    this.fieldsTranslate.unlock(this.#fieldState.name);
  }

  dontTranslate(): void {
    this.fieldsTranslate.lock(this.#fieldState.name);
  }

  openTranslateMenuDialog(translationState: TranslationState): void {
    this.#openDialog(translationState, TranslateMenuDialogComponent);
  }

  openAutoTranslateMenuDialog(translationState: TranslationState): void {
    if (this.#fieldState.settings().DisableAutoTranslation) {
      this.matDialog.open(AutoTranslateDisabledWarningDialog, {
        autoFocus: false,
        data: { isAutoTranslateAll: false },
        viewContainerRef: this.viewContainerRef,
        width: '350px',
      });
    } else {
      this.#openDialog(translationState, AutoTranslateMenuDialogComponent);
    }

  }

  #openDialog(translationState: TranslationState, component: any): void {
    const dialogData: TranslateMenuDialogData = {
      config: this.#fieldState.config,
      translationState: {
        language: translationState.language,
        linkType: translationState.linkType,
      },
    };
    this.matDialog.open(component, {
      autoFocus: false,
      data: dialogData,
      viewContainerRef: this.viewContainerRef,
      width: '400px',
    });
  }
}
