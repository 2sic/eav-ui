import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
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

  private currentLanguage$ = new BehaviorSubject<string>(null);
  private defaultLanguage$ = new BehaviorSubject<string>(null);
  private attributes$ = new BehaviorSubject<EavAttributes>(null);
  private translationState$: BehaviorSubject<LinkToOtherLanguageData>;
  private subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private formulaInstance: FormulaInstanceService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.config.form.formId).subscribe(currentLanguage => {
        this.currentLanguage$.next(currentLanguage);
      })
    );
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.config.form.formId).subscribe(defaultLanguage => {
        this.defaultLanguage$.next(defaultLanguage);
      })
    );
    this.subscription.add(
      this.itemService.selectItemAttributes(this.config.entity.entityGuid).subscribe(attributes => {
        this.attributes$.next(attributes);
      })
    );
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
      combineLatest([this.currentLanguage$, this.defaultLanguage$, this.translationState$]),
      combineLatest([disabled$, defaultLanguageMissingValue$, infoMessage$, infoMessageLabel$]),
    ]).pipe(
      map(
        ([
          [currentLanguage, defaultLanguage, translationState],
          [disabled, defaultLanguageMissingValue, infoMessage, infoMessageLabel],
        ]) => ({
          currentLanguage,
          defaultLanguage,
          translationState,
          translationStateClass: TranslateMenuHelpers.getTranslationStateClass(translationState.linkType),
          disabled,
          defaultLanguageMissingValue,
          infoMessage,
          infoMessageLabel,
        })
      ),
    );

    this.onCheckField();
    this.onTranslateMany();
    this.onCurrentLanguageChanged();
    this.onDefaultLanguageChanged();
    this.onFormulaSettingsChanged();
    this.onSlotIsEmptyChanged();
  }

  ngOnDestroy() {
    this.currentLanguage$.complete();
    this.defaultLanguage$.complete();
    this.attributes$.complete();
    this.subscription.unsubscribe();
  }

  translate() {
    this.config.field.fieldHelper.translate(this.config, this.formulaInstance);
  }

  dontTranslate() {
    this.config.field.fieldHelper.dontTranslate(this.config, this.formulaInstance);
  }

  openLinkToOtherLanguage() {
    const dialogData: LinkToOtherLanguageData = {
      formId: this.config.form.formId,
      linkType: this.translationState$.value.linkType,
      language: this.translationState$.value.language,
      defaultLanguage: this.defaultLanguage$.value,
      attributes: this.attributes$.value,
      attributeKey: this.config.field.name,
    };
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
      autoFocus: false,
      width: '350px',
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
    if (!isEqual(this.translationState$.value, actionResult)) {
      // need be sure that we have a language selected when a link option is clicked
      switch (actionResult.linkType) {
        case TranslationLinkConstants.Translate:
          this.config.field.fieldHelper.translate(this.config, this.formulaInstance);
          break;
        case TranslationLinkConstants.DontTranslate:
          this.config.field.fieldHelper.dontTranslate(this.config, this.formulaInstance);
          break;
        case TranslationLinkConstants.LinkReadOnly:
          this.config.field.fieldHelper.linkReadOnly(this.config, this.formulaInstance, actionResult.language);
          break;
        case TranslationLinkConstants.LinkReadWrite:
          this.config.field.fieldHelper.linkReadWrite(this.config, this.formulaInstance, actionResult.language);
          break;
        case TranslationLinkConstants.LinkCopyFrom:
          this.config.field.fieldHelper.copyFrom(this.config, this.formulaInstance, actionResult.language);
          break;
        default:
          break;
      }
    }
  }

  private onCurrentLanguageChanged() {
    this.subscription.add(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.fieldsSettingsService.translateSettingsAndValidation(this.config, this.currentLanguage$.value, this.defaultLanguage$.value);
        this.config.field.fieldHelper.refreshControlConfig(this.config, this.group);
        this.formulaInstance.fieldTranslated(this.config.field.name);
      })
    );
  }

  private onDefaultLanguageChanged() {
    this.subscription.add(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.fieldsSettingsService.translateSettingsAndValidation(this.config, this.currentLanguage$.value, this.defaultLanguage$.value);
        this.config.field.fieldHelper.refreshControlConfig(this.config, this.group);
      })
    );
  }

  private onFormulaSettingsChanged() {
    this.subscription.add(
      this.formulaInstance.getSettings(this.config.field.name).pipe(
        filter(formulaSettings => formulaSettings != null),
      ).subscribe(formulaSettings => {
        this.fieldsSettingsService.translateSettingsAndValidation(
          this.config, this.currentLanguage$.value, this.defaultLanguage$.value, formulaSettings,
        );
        this.config.field.fieldHelper.refreshControlConfig(this.config, this.group);
      })
    );
  }

  private onSlotIsEmptyChanged() {
    this.subscription.add(
      this.config.field.fieldHelper.slotIsEmpty$.subscribe(slotIsEmpty => {
        this.config.field.fieldHelper.setControlDisable(this.config, this.group);
      })
    );
  }

  private onTranslateMany() {
    this.subscription.add(
      this.languageInstanceService.getTranslateMany(this.config.form.formId, this.config.entity.entityGuid).subscribe(props => {
        switch (props.translationLink) {
          case TranslationLinkConstants.Translate:
            this.config.field.fieldHelper.translate(this.config, this.formulaInstance);
            break;
          case TranslationLinkConstants.DontTranslate:
            this.config.field.fieldHelper.dontTranslate(this.config, this.formulaInstance);
            break;
        }
      })
    );
  }

  private onCheckField() {
    this.subscription.add(
      this.languageInstanceService.getCheckField(this.config.entity.entityGuid, this.config.field.name).subscribe(props => {
        this.config.field.fieldHelper.refreshControlConfig(this.config, this.group);
      })
    );
  }
}
