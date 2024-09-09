import { Component, inject, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AutoTranslateDisabledWarningDialog } from '../../../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import { FieldState } from '../../../field-state';
import { TranslationLinks } from '../../../../localization/translation-link.constants';
import { FieldsSettingsService } from '../../../../state/fields-settings.service';
import { FieldsTranslateService } from '../../../../state/fields-translate.service';
import { FormConfigService } from '../../../../form/form-config.service';
import { FormsStateService } from '../../../../form/forms-state.service';
import { TranslationState } from '../../../../localization/translate-state.model';
import { computedObj } from '../../../../../shared/signals/signal.utilities';

@Component({
  selector: 'app-translate-menu',
  templateUrl: './translate-menu.component.html',
  styleUrls: ['./translate-menu.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    NgClass,
    ExtendedModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FeatureIconIndicatorComponent,
    TranslateModule,
    TippyDirective,
  ],
})
export class TranslateMenuComponent {
  @Input() hideTranslateButton: boolean;

  #fieldState = inject(FieldState);
  #formsStateService = inject(FormsStateService);

  TranslationLinks = TranslationLinks;

  protected translationState = this.#fieldState.translationState; // this.fieldSettings.translationState[this.#fieldState.name];
  protected language = this.formConfig.language;

  protected disabled = computedObj('disabled', () => this.#fieldState.controlStatus().disabled);

  translationStateClass = computedObj('translationStateClass', () => TranslateMenuHelpers.getTranslationStateClass(this.translationState().linkType));

  disableTranslateButtonSignal = computedObj('disableTranslateButtonSignal',
    () => this.#formsStateService.readOnly().isReadOnly || this.#fieldState.settings().DisableTranslation
  );

  constructor(
    private dialog: MatDialog,
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
      this.dialog.open(AutoTranslateDisabledWarningDialog, {
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
    this.dialog.open(component, {
      autoFocus: false,
      data: dialogData,
      viewContainerRef: this.viewContainerRef,
      width: '400px',
    });
  }
}
