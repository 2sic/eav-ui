import { Component, computed, Input, OnInit, Signal, signal, ViewContainerRef, WritableSignal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { distinctUntilChanged, map, startWith } from 'rxjs';
import { TranslationLinks } from '../../../../shared/constants';
import { TranslationState } from '../../../../shared/models';
import { FormConfigService, FieldsSettingsService, FieldsTranslateService, FormsStateService } from '../../../../shared/services';
import { LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { AutoTranslateDisabledWarningDialog } from '../auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from '../auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuViewModel } from './translate-menu.models';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureIconIndicatorComponent } from '../../../../../features/feature-icon-indicator/feature-icon-indicator.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-translate-menu',
  templateUrl: './translate-menu.component.html',
  styleUrls: ['./translate-menu.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    NgClass,
    ExtendedModule,
    SharedComponentsModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FeatureIconIndicatorComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class TranslateMenuComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;
  @Input() hideTranslateButton: boolean;

  TranslationLinks = TranslationLinks;

  viewModel: Signal<TranslateMenuViewModel>;
  readOnly = toSignal(this.formsState.readOnly$);
  language = toSignal(this.languageStore.getLanguage$(this.formConfig.config.formId));

  translationState = signal<TranslationState>(null);
  disableTranslation = signal<boolean>(false);
  disableAutoTranslation = signal<boolean>(false);
  disabled = signal<boolean>(false);

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
    private fieldSettings: FieldsSettingsService,
    private fieldsTranslate: FieldsTranslateService,
    private formsState: FormsStateService,
  ) { }

  ngOnInit(): void {
    this.fieldSettings.getTranslationState$(this.config.fieldName).subscribe(translationState => {
      this.translationState.set(translationState);
    });

    this.fieldSettings.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableTranslation),
      distinctUntilChanged()
    ).subscribe(disableTranslation => {
      this.disableTranslation.set(disableTranslation);
    });

    this.fieldSettings.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.DisableAutoTranslation),
      distinctUntilChanged()
    ).subscribe(disableAutoTranslation => {
      this.disableAutoTranslation.set(disableAutoTranslation);
    })

    const control = this.group.controls[this.config.fieldName];
    control.valueChanges.pipe(
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged()
    ).subscribe(disabled => {
      this.disabled.set(disabled);
    });

    this.viewModel = computed(() => {
      const readOnly = this.readOnly();
      const language = this.language();
      const translationState = this.translationState();
      const disableTranslation = this.disableTranslation();
      const disableAutoTranslation = this.disableAutoTranslation();
      const disabled = this.disabled();
      const disableTranslateButton = readOnly.isReadOnly || disableTranslation;
      return {
        ...language,
        translationState,
        translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
        disableAutoTranslation,
        disabled,
        disableTranslateButton,
      };
    });
  }

  translate(): void {
    this.fieldsTranslate.translate(this.config.name);
  }

  dontTranslate(): void {
    this.fieldsTranslate.dontTranslate(this.config.name);
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
