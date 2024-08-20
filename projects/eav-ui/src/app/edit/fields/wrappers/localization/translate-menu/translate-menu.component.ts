import { Component, inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { AutoTranslateDisabledWarningDialog } from '../../../../localization/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../../../../localization/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuViewModel } from './translate-menu.models';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { TippyDirective } from '../../../../../shared/directives/tippy.directive';
import { mapUntilChanged } from '../../../../../shared/rxJs/mapUntilChanged';
import { FieldState } from '../../../field-state';
import { TranslationLinks } from '../../../../localization/translation-link.constants';
import { FieldsSettingsService } from '../../../../state/fields-settings.service';
import { FieldsTranslateService } from '../../../../state/fields-translate.service';
import { FormConfigService } from '../../../../state/form-config.service';
import { FormsStateService } from '../../../../state/forms-state.service';
import { TranslationState } from '../../../../state/fields-configs.model';

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
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class TranslateMenuComponent implements OnInit {
  @Input() hideTranslateButton: boolean;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;
  protected group = this.fieldState.group;


  TranslationLinks = TranslationLinks;
  viewModel$: Observable<TranslateMenuViewModel>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private formConfig: FormConfigService,
    private fieldSettings: FieldsSettingsService,
    private fieldsTranslate: FieldsTranslateService,
    private formsState: FormsStateService,
  ) { }

  ngOnInit(): void {
    const readOnly$ = this.formsState.readOnly$;
    const language$ = this.formConfig.language$;
    const translationState$ = this.fieldSettings.getTranslationState$(this.config.fieldName);
    const disableTranslation$ = this.fieldSettings.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableTranslation),
      mapUntilChanged(m => m),
    );
    const disableAutoTranslation$ = this.fieldSettings.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableAutoTranslation),
      mapUntilChanged(m => m),
    );

    const control = this.group.controls[this.config.fieldName];
    const disabled$ = control.valueChanges.pipe(
      map(() => control.disabled),
      startWith(control.disabled),
      mapUntilChanged(m => m),
    );

    this.viewModel$ = combineLatest([
      readOnly$, language$, translationState$, disableTranslation$, disableAutoTranslation$, disabled$,
    ]).pipe(
      map(([readOnly, language, translationState, disableTranslation, disableAutoTranslation, disabled]) => {
        const disableTranslateButton = readOnly.isReadOnly || disableTranslation;
        const viewModel: TranslateMenuViewModel = {
          ...language,
          translationState,
          translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
          disableAutoTranslation,
          disabled,

          disableTranslateButton,
        };
        return viewModel;
      }),
    );
  }

  translate(): void {
    this.fieldsTranslate.translate(this.config.fieldName);
  }

  dontTranslate(): void {
    this.fieldsTranslate.dontTranslate(this.config.fieldName);
  }

  openTranslateMenuDialog(translationState: TranslationState): void {
    this.openDialog(translationState, TranslateMenuDialogComponent);
  }

  openAutoTranslateMenuDialog(translationState: TranslationState): void {
    if (this.fieldSettings.getFieldSettings(this.config.fieldName).DisableAutoTranslation) {
      this.dialog.open(AutoTranslateDisabledWarningDialog, {
        autoFocus: false,
        data: { isAutoTranslateAll: false },
        viewContainerRef: this.viewContainerRef,
        width: '350px',
      });
    } else {
      this.openDialog(translationState, AutoTranslateMenuDialogComponent);
    }

  }

  private openDialog(translationState: TranslationState, component: any): void {
    const dialogData: TranslateMenuDialogData = {
      config: this.config,
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
