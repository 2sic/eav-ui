import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { TranslateMenuDialogComponent } from '../translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuDialogData } from '../translate-menu-dialog/translate-menu-dialog.models';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuTemplateVars, TranslationState } from './translate-menu.models';

@Component({
  selector: 'app-translate-menu',
  templateUrl: './translate-menu.component.html',
  styleUrls: ['./translate-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateMenuComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() private group: FormGroup;

  translationLinkConstants = TranslationLinkConstants;
  templateVars$: Observable<TranslateMenuTemplateVars>;

  private translationState$: BehaviorSubject<TranslationState>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private formulaInstance: FormulaInstanceService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit(): void {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.translationState$ = this.config.field.fieldHelper.translationState$;

    const control = this.group.controls[this.config.field.name];
    const disabled$ = this.eavService.formDisabledChange$.pipe(
      filter(formSet => formSet.formId === this.config.form.formId && formSet.entityGuid === this.config.entity.entityGuid),
      map(() => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
    );
    const defaultLanguageMissingValue$ = this.config.field.fieldHelper.defaultLanguageMissingValue$;
    const infoMessage$ = this.config.field.fieldHelper.translationInfoMessage$;
    const infoMessageLabel$ = this.config.field.fieldHelper.translationInfoMessageLabel$;

    this.templateVars$ = combineLatest([
      combineLatest([currentLanguage$, defaultLanguage$, this.translationState$]),
      combineLatest([disabled$, defaultLanguageMissingValue$, infoMessage$, infoMessageLabel$]),
    ]).pipe(
      map(
        ([
          [currentLanguage, defaultLanguage, translationState],
          [disabled, defaultLanguageMissingValue, infoMessage, infoMessageLabel],
        ]) => {
          const templateVars: TranslateMenuTemplateVars = {
            currentLanguage,
            defaultLanguage,
            translationState,
            translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
            disabled,
            defaultLanguageMissingValue,
            infoMessage,
            infoMessageLabel,
          };
          return templateVars;
        }
      ),
    );

    this.config.field.fieldHelper.startTranslations(this.config, this.group, this.formulaInstance, this.fieldsSettingsService);
  }

  ngOnDestroy(): void {
    this.config.field.fieldHelper.stopTranslations();
  }

  translate(): void {
    this.config.field.fieldHelper.translate(this.formulaInstance);
  }

  dontTranslate(): void {
    this.config.field.fieldHelper.dontTranslate(this.formulaInstance);
  }

  openTranslateMenuDialog(): void {
    const dialogData: TranslateMenuDialogData = {
      config: this.config,
    };
    const dialogRef = this.dialog.open(TranslateMenuDialogComponent, {
      panelClass: 'translate-menu-dialog',
      autoFocus: false,
      width: '350px',
      viewContainerRef: this.viewContainerRef,
      data: dialogData,
    });
    dialogRef.keydownEvents().subscribe(e => {
      const CTRL_S = e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey);
      if (!CTRL_S) { return; }
      e.preventDefault();
    });
    dialogRef.afterClosed().subscribe((newTranslationState: TranslationState) => {
      this.setTranslationState(newTranslationState);
    });
  }

  private setTranslationState(newTranslationState: TranslationState): void {
    if (!newTranslationState) { return; }
    if (isEqual(this.translationState$.value, newTranslationState)) { return; }

    switch (newTranslationState.linkType) {
      case TranslationLinkConstants.Translate:
        this.config.field.fieldHelper.translate(this.formulaInstance);
        break;
      case TranslationLinkConstants.DontTranslate:
        this.config.field.fieldHelper.dontTranslate(this.formulaInstance);
        break;
      case TranslationLinkConstants.LinkReadOnly:
        this.config.field.fieldHelper.linkReadOnly(this.formulaInstance, newTranslationState.language);
        break;
      case TranslationLinkConstants.LinkReadWrite:
        this.config.field.fieldHelper.linkReadWrite(this.formulaInstance, newTranslationState.language);
        break;
      case TranslationLinkConstants.LinkCopyFrom:
        this.config.field.fieldHelper.copyFrom(this.formulaInstance, newTranslationState.language);
        break;
      default:
        break;
    }
  }
}
