import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigGroup, FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { ContentType, EavAttributes, EavValue, Item } from '../../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';

@Component({
  selector: 'app-translate-group-menu',
  templateUrl: './translate-group-menu.component.html',
  styleUrls: ['./translate-group-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateGroupMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() private group: FormGroup;
  @Input() toggleTranslateField: boolean;

  fieldConfig: FieldConfigGroup;
  control: AbstractControl;
  disabled$: Observable<boolean>;
  translationLinkConstants = TranslationLinkConstants;
  attributes$: Observable<EavAttributes>;
  attributes: EavAttributes;
  currentLanguage$: Observable<string>;
  currentLanguage = '';
  defaultLanguage$: Observable<string>;
  defaultLanguage = '';
  defaultLanguageMissingValue$: BehaviorSubject<boolean>;
  translationState$: BehaviorSubject<LinkToOtherLanguageData>;
  infoMessage$: BehaviorSubject<string>;
  infoMessageLabel$: BehaviorSubject<string>;
  item: Item;
  contentType: ContentType;

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
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.control = this.group.controls[this.config.field.name];
    this.disabled$ = this.fieldConfig.isParentGroup ? of(false) : this.eavService.formDisabledChange$.pipe(
      filter(formDisabledSet => (formDisabledSet.formId === this.config.form.formId)
        && (formDisabledSet.entityGuid === this.config.entity.entityGuid)
      ),
      map(formSet => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.attributes$ = this.itemService.selectItemAttributes(this.config.entity.entityGuid);
    this.defaultLanguageMissingValue$ = this.config.field.fieldHelper.defaultLanguageMissingValue$;
    this.translationState$ = this.config.field.fieldHelper.translationState$;
    this.infoMessage$ = this.config.field.fieldHelper.translationInfoMessage$;
    this.infoMessageLabel$ = this.config.field.fieldHelper.translationInfoMessageLabel$;
    this.subscribeToAttributeValues();
    this.subscribeMenuChange();
    this.subscribeToItemFromStore();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.subscribeToFormulaSettings();
    this.subscribeToEntityHeaderFromStore();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleTranslateField != null && this.currentLanguage !== this.defaultLanguage && this.control.disabled) {
      this.translateUnlink(this.config.field.name);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openLinkToOtherLanguage() {
    const dialogData: LinkToOtherLanguageData = {
      formId: this.config.form.formId,
      linkType: this.translationState$.value.linkType,
      language: this.translationState$.value.language,
      defaultLanguage: this.defaultLanguage,
      attributes: this.attributes,
      attributeKey: this.config.field.name,
    };
    const dialogRef = this.dialog.open(LinkToOtherLanguageComponent, {
      panelClass: 'c-link-to-other-language',
      autoFocus: false,
      width: '350px',
      data: dialogData
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

  translateUnlink(attributeKey: string) {
    if (this.config.field.fieldHelper.isTranslateDisabled(attributeKey)) { return; }

    this.itemService.removeItemAttributeDimension(this.config.entity.entityGuid, attributeKey, this.currentLanguage);
    const defaultValue: EavValue<any> = LocalizationHelper.getValueTranslation(this.attributes[attributeKey],
      this.defaultLanguage, this.defaultLanguage);
    if (defaultValue) {
      const fieldType = InputFieldHelper.getFieldType(this.config, attributeKey);
      this.itemService.addItemAttributeValue(
        this.config.entity.entityGuid, attributeKey, defaultValue.value, this.currentLanguage, false, fieldType,
      );
    } else {
      angularConsoleLog(`${this.currentLanguage}: Cant copy value from ${this.defaultLanguage} because that value does not exist.`);
    }

    this.refreshControlConfig(attributeKey);
    // run value formulas when field is translated
    this.formulaInstance.runSettingsFormulas();
    this.formulaInstance.runValueFormulas();
  }

  linkToDefault(attributeKey: string) {
    if (this.config.field.fieldHelper.isTranslateDisabled(attributeKey)) { return; }

    this.itemService.removeItemAttributeDimension(this.config.entity.entityGuid, attributeKey, this.currentLanguage);

    this.refreshControlConfig(attributeKey);
    // run value formulas when field is translated
    this.formulaInstance.runSettingsFormulas();
    this.formulaInstance.runValueFormulas();
  }

  translateAll() {
    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.Translate, '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.translateUnlink(attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  dontTranslateAll() {
    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.DontTranslate, '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkToDefault(attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  copyFromAll(languageKey: string) {
    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.LinkCopyFrom, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.copyFrom(languageKey, attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  /**
   * Copy value where language is copyFromLanguageKey to value where language is current language.
   * If value of current language don't exist then add new value
   */
  copyFrom(copyFromLanguageKey: string, attributeKey: string) {
    if (this.config.field.fieldHelper.isTranslateDisabled(attributeKey)) { return; }

    const attributeValueTranslation: EavValue<any> = LocalizationHelper.getValueTranslation(this.attributes[attributeKey],
      copyFromLanguageKey, this.defaultLanguage);

    if (attributeValueTranslation) {
      const valueAlreadyExists = this.attributes
        ? LocalizationHelper.isEditableOrReadonlyTranslationExist(this.attributes[attributeKey], this.currentLanguage, this.defaultLanguage)
        : false;

      if (valueAlreadyExists) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          this.config.entity.entityGuid, attributeKey, attributeValueTranslation.value, this.currentLanguage, this.defaultLanguage, false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addItemAttributeValue(
          this.config.entity.entityGuid, attributeKey, attributeValueTranslation.value, this.currentLanguage, false, this.config.field.type,
        );
      }
    } else {
      angularConsoleLog(`${this.currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }

    this.refreshControlConfig(attributeKey);
    // run value formulas when field is translated
    this.formulaInstance.runSettingsFormulas();
    this.formulaInstance.runValueFormulas();
  }

  linkReadOnlyAll(languageKey: string) {
    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.LinkReadOnly, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadOnly(languageKey, attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  linkReadOnly(languageKey: string, attributeKey: string) {
    if (this.config.field.fieldHelper.isTranslateDisabled(attributeKey)) { return; }

    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.LinkReadOnly, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entity.entityGuid, attributeKey, this.currentLanguage);
    this.itemService.addItemAttributeDimension(
      this.config.entity.entityGuid, attributeKey, this.currentLanguage, languageKey, this.defaultLanguage, true,
    );
    this.refreshControlConfig(attributeKey);
    // run value formulas when field is translated
    this.formulaInstance.runSettingsFormulas();
    this.formulaInstance.runValueFormulas();
  }

  linkReadWriteAll(languageKey: string) {
    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.LinkReadWrite, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadWrite(languageKey, attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  linkReadWrite(languageKey: string, attributeKey: string) {
    if (this.config.field.fieldHelper.isTranslateDisabled(attributeKey)) { return; }

    this.config.field.fieldHelper.setTranslationState(TranslationLinkConstants.LinkReadWrite, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entity.entityGuid, attributeKey, this.currentLanguage);
    this.itemService.addItemAttributeDimension(
      this.config.entity.entityGuid, attributeKey, this.currentLanguage, languageKey, this.defaultLanguage, false,
    );
    this.refreshControlConfig(attributeKey);
    // run value formulas when field is translated
    this.formulaInstance.runSettingsFormulas();
    this.formulaInstance.runValueFormulas();
  }

  getTranslationStateClass(linkType: string) {
    switch (linkType) {
      case TranslationLinkConstants.MissingDefaultLangValue:
        return 'eav-localization-missing-default-lang-value';
      case TranslationLinkConstants.Translate:
      case TranslationLinkConstants.LinkCopyFrom:
        return 'eav-localization-translate';
      case TranslationLinkConstants.DontTranslate:
        return '';
      case TranslationLinkConstants.LinkReadOnly:
        return 'eav-localization-link-read-only';
      case TranslationLinkConstants.LinkReadWrite:
        return 'eav-localization-link-read-write';
      default:
        return '';
    }
  }

  private refreshControlConfig(attributeKey: string) {
    if (this.fieldConfig.isParentGroup) { return; }
    this.config.field.fieldHelper.setControlDisable(attributeKey, this.config, this.group);
    this.config.field.fieldHelper.readTranslationState(attributeKey);
    this.config.field.fieldHelper.setTranslationInfoMessage(attributeKey);
  }

  private triggerTranslation(actionResult: LinkToOtherLanguageData) {
    if (!isEqual(this.translationState$.value, actionResult)) {
      // need be sure that we have a language selected when a link option is clicked
      switch (actionResult.linkType) {
        case TranslationLinkConstants.Translate:
          this.fieldConfig.isParentGroup ? this.translateAll() : this.translateUnlink(this.config.field.name);
          break;
        case TranslationLinkConstants.DontTranslate:
          this.fieldConfig.isParentGroup ? this.dontTranslateAll() : this.linkToDefault(this.config.field.name);
          break;
        case TranslationLinkConstants.LinkReadOnly:
          this.fieldConfig.isParentGroup
            ? this.linkReadOnlyAll(actionResult.language)
            : this.linkReadOnly(actionResult.language, this.config.field.name);
          break;
        case TranslationLinkConstants.LinkReadWrite:
          this.fieldConfig.isParentGroup
            ? this.linkReadWriteAll(actionResult.language)
            : this.linkReadWrite(actionResult.language, this.config.field.name);
          break;
        case TranslationLinkConstants.LinkCopyFrom:
          this.fieldConfig.isParentGroup
            ? this.copyFromAll(actionResult.language)
            : this.copyFrom(actionResult.language, this.config.field.name);
          break;
        default:
          break;
      }
    }
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscription.add(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
        this.fieldsSettingsService.translateSettingsAndValidation(this.config, this.currentLanguage, this.defaultLanguage);
        this.refreshControlConfig(this.config.field.name);
        this.formulaInstance.fieldTranslated(this.config.field.name);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscription.add(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;
        this.fieldsSettingsService.translateSettingsAndValidation(this.config, this.currentLanguage, this.defaultLanguage);
        this.refreshControlConfig(this.config.field.name);
      })
    );
  }

  private subscribeToFormulaSettings() {
    this.subscription.add(
      this.formulaInstance.getSettings(this.config.field.name).pipe(
        filter(formulaSettings => formulaSettings != null),
      ).subscribe(formulaSettings => {
        this.fieldsSettingsService.translateSettingsAndValidation(this.config, this.currentLanguage, this.defaultLanguage, formulaSettings);
        this.refreshControlConfig(this.config.field.name);
      })
    );
  }

  /** Subscribe to item attribute values */
  private subscribeToAttributeValues() {
    this.subscription.add(
      this.attributes$.subscribe(attributes => {
        this.attributes = attributes;
      })
    );
  }

  private subscribeToEntityHeaderFromStore() {
    this.subscription.add(
      this.config.field.fieldHelper.slotIsEmpty$.subscribe(slotIsEmpty => {
        this.config.field.fieldHelper.setControlDisable(this.config.field.name, this.config, this.group);
      })
    );
  }

  /** Fetch current item */
  private subscribeToItemFromStore() {
    this.subscription.add(
      this.itemService.selectItem(this.config.entity.entityGuid).subscribe(item => {
        this.item = item;
      })
    );
  }

  /** Subscribe triggered when changing all in menu (forAllFields) */
  private subscribeMenuChange() {
    this.subscription.add(
      this.languageInstanceService.localizationWrapperMenuChange$.subscribe(s => {
        if (!this.fieldConfig.isParentGroup) {
          this.refreshControlConfig(this.config.field.name);
        }
      })
    );
  }
}
