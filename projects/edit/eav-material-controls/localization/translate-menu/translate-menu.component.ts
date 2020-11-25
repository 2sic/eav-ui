import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { EavAttributes } from '../../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';
import { TranslateMenuHelpers } from './translate-menu.helpers';
import { TranslateMenuTemplateVars } from './translate-menu.models';

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

  private translationState$: BehaviorSubject<LinkToOtherLanguageData>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private formulaInstance: FormulaInstanceService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    const attributes$ = this.itemService.selectItemAttributes(this.config.entity.entityGuid);
    this.translationState$ = this.config.field.fieldHelper.translationState$;

    const control = this.group.controls[this.config.field.name];
    const disabled$ = this.eavService.formDisabledChange$.pipe(
      filter(formSet => formSet.formId === this.config.form.formId && formSet.entityGuid === this.config.entity.entityGuid),
      map(formSet => control.disabled),
      startWith(control.disabled),
      distinctUntilChanged(),
    );
    const defaultLanguageMissingValue$ = this.config.field.fieldHelper.defaultLanguageMissingValue$;
    const infoMessage$ = this.config.field.fieldHelper.translationInfoMessage$;
    const infoMessageLabel$ = this.config.field.fieldHelper.translationInfoMessageLabel$;

    this.templateVars$ = combineLatest([
      combineLatest([currentLanguage$, defaultLanguage$, attributes$, this.translationState$]),
      combineLatest([disabled$, defaultLanguageMissingValue$, infoMessage$, infoMessageLabel$]),
    ]).pipe(
      map(
        ([
          [currentLanguage, defaultLanguage, attributes, translationState],
          [disabled, defaultLanguageMissingValue, infoMessage, infoMessageLabel],
        ]) => {
          const templateVars: TranslateMenuTemplateVars = {
            currentLanguage,
            defaultLanguage,
            attributes,
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

  ngOnDestroy() {
    this.config.field.fieldHelper.stopTranslations();
  }

  translate() {
    this.config.field.fieldHelper.translate(this.formulaInstance);
  }

  dontTranslate() {
    this.config.field.fieldHelper.dontTranslate(this.formulaInstance);
  }

  openLinkToOtherLanguage(defaultLanguage: string, attributes: EavAttributes) {
    const dialogData: LinkToOtherLanguageData = {
      formId: this.config.form.formId,
      linkType: this.translationState$.value.linkType,
      language: this.translationState$.value.language,
      defaultLanguage,
      attributes,
      attributeKey: this.config.field.name,
    };
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
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
    dialogRef.afterClosed().subscribe((actionResult: LinkToOtherLanguageData) => {
      if (!actionResult) { return; }
      this.triggerTranslation(actionResult);
    });
  }

  private triggerTranslation(actionResult: LinkToOtherLanguageData) {
    if (isEqual(this.translationState$.value, actionResult)) { return; }

    // need be sure that we have a language selected when a link option is clicked
    switch (actionResult.linkType) {
      case TranslationLinkConstants.Translate:
        this.config.field.fieldHelper.translate(this.formulaInstance);
        break;
      case TranslationLinkConstants.DontTranslate:
        this.config.field.fieldHelper.dontTranslate(this.formulaInstance);
        break;
      case TranslationLinkConstants.LinkReadOnly:
        this.config.field.fieldHelper.linkReadOnly(this.formulaInstance, actionResult.language);
        break;
      case TranslationLinkConstants.LinkReadWrite:
        this.config.field.fieldHelper.linkReadWrite(this.formulaInstance, actionResult.language);
        break;
      case TranslationLinkConstants.LinkCopyFrom:
        this.config.field.fieldHelper.copyFrom(this.formulaInstance, actionResult.language);
        break;
      default:
        break;
    }
  }
}
