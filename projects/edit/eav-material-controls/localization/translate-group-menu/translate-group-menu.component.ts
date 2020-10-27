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
import { ContentType, EavAttributes, EavDimensions, EavValue, EavValues, Item } from '../../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../../shared/models/eav/link-to-other-language-data';
import { EavService } from '../../../shared/services/eav.service';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { ValidationHelper } from '../../validators/validation-helper';
import { LinkToOtherLanguageComponent } from '../link-to-other-language/link-to-other-language.component';
import { TranslateGroupMenuHelpers } from './translate-group-menu.helpers';

@Component({
  selector: 'app-translate-group-menu',
  templateUrl: './translate-group-menu.component.html',
  styleUrls: ['./translate-group-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateGroupMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
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
  defaultLanguageMissingValue$ = new BehaviorSubject(false);
  headerGroupSlotIsEmpty = false;
  translationState$: BehaviorSubject<LinkToOtherLanguageData> = new BehaviorSubject({
    formId: null,
    linkType: '',
    language: '',
  });
  infoMessage$ = new BehaviorSubject<string>('');
  infoMessageLabel$ = new BehaviorSubject<string>('');
  item: Item;
  contentType: ContentType;

  private subscription = new Subscription();

  constructor(
    private dialog: MatDialog,
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private formulaInstance: FormulaInstanceService,
  ) { }

  ngOnInit() {
    this.fieldConfig = this.config.field as FieldConfigGroup;
    this.control = this.group.controls[this.config.field.name];
    this.disabled$ = this.fieldConfig.isParentGroup ? of(false) : this.eavService.formDisabledChange$.asObservable().pipe(
      filter(formDisabledSet => (formDisabledSet.formId === this.config.form.formId)
        && (formDisabledSet.entityGuid === this.config.entity.entityGuid)
      ),
      map(formSet => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    this.attributes$ = this.itemService.selectAttributesByEntityId(this.config.entity.entityId, this.config.entity.entityGuid);
    this.subscribeToAttributeValues();
    this.subscribeMenuChange();
    this.subscribeToItemFromStore();
    this.subscribeToContentTypeFromStore();
    // subscribe to language data
    this.subscribeToCurrentLanguageFromStore();
    this.subscribeToDefaultLanguageFromStore();
    this.subscribeToEntityHeaderFromStore();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleTranslateField != null && this.currentLanguage !== this.defaultLanguage && this.control.disabled) {
      this.translateUnlink(this.config.field.name);
    }
  }

  ngOnDestroy() {
    this.defaultLanguageMissingValue$.complete();
    this.translationState$.complete();
    this.infoMessage$.complete();
    this.infoMessageLabel$.complete();
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
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);
    const defaultValue: EavValue<any> = LocalizationHelper.getValueTranslation(this.attributes[attributeKey],
      this.defaultLanguage, this.defaultLanguage);
    if (defaultValue) {
      const fieldType = InputFieldHelper.getFieldType(this.config, attributeKey);
      this.itemService.addAttributeValue(
        this.config.entity.entityGuid, attributeKey, defaultValue.value, this.currentLanguage, false, fieldType,
      );
    } else {
      angularConsoleLog(`${this.currentLanguage}: Cant copy value from ${this.defaultLanguage} because that value does not exist.`);
    }

    this.refreshControlConfig(attributeKey);
    // run formulas when field is translated
    this.itemService.runValueCalculations(this.formulaInstance);
  }

  linkToDefault(attributeKey: string) {
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);

    this.refreshControlConfig(attributeKey);
    // run formulas when field is translated
    this.itemService.runValueCalculations(this.formulaInstance);
  }

  translateAll() {
    this.setTranslationState(TranslationLinkConstants.Translate, '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.translateUnlink(attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  dontTranslateAll() {
    this.setTranslationState(TranslationLinkConstants.DontTranslate, '');
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkToDefault(attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  copyFromAll(languageKey: string) {
    this.setTranslationState(TranslationLinkConstants.LinkCopyFrom, languageKey);
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
    if (this.isTranslateDisabled(attributeKey)) { return; }

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
        this.itemService.addAttributeValue(
          this.config.entity.entityGuid, attributeKey, attributeValueTranslation.value, this.currentLanguage, false, this.config.field.type,
        );
      }
    } else {
      angularConsoleLog(`${this.currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }

    this.refreshControlConfig(attributeKey);
    // run formulas when field is translated
    this.itemService.runValueCalculations(this.formulaInstance);
  }

  linkReadOnlyAll(languageKey: string) {
    this.setTranslationState(TranslationLinkConstants.LinkReadOnly, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadOnly(languageKey, attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  linkReadOnly(languageKey: string, attributeKey: string) {
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.setTranslationState(TranslationLinkConstants.LinkReadOnly, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, true, this.config.entity.entityGuid);
    this.refreshControlConfig(attributeKey);
    // run formulas when field is translated
    this.itemService.runValueCalculations(this.formulaInstance);
  }

  linkReadWriteAll(languageKey: string) {
    this.setTranslationState(TranslationLinkConstants.LinkReadWrite, languageKey);
    Object.keys(this.attributes).forEach(attributeKey => {
      this.linkReadWrite(languageKey, attributeKey);
    });
    this.languageInstanceService.triggerLocalizationWrapperMenuChange();
  }

  linkReadWrite(languageKey: string, attributeKey: string) {
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.setTranslationState(TranslationLinkConstants.LinkReadWrite, languageKey);
    this.itemService.removeItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      this.config.entity.entityGuid);
    this.itemService.addItemAttributeDimension(this.config.entity.entityId, attributeKey, this.currentLanguage,
      languageKey, this.defaultLanguage, false, this.config.entity.entityGuid);
    this.refreshControlConfig(attributeKey);
    // run formulas when field is translated
    this.itemService.runValueCalculations(this.formulaInstance);
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
    this.setControlDisable(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.readTranslationState(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
    this.setInfoMessage(this.attributes[attributeKey], attributeKey, this.currentLanguage, this.defaultLanguage);
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

  private setTranslationState(linkType: string, language: string) {
    const newTranslationState = { ...this.translationState$.value, linkType, language };
    this.translationState$.next(newTranslationState);
  }

  /** Determine is control disabled or enabled */
  private setControlDisable(attributes: EavValues<any>, attributeKey: string, currentLanguage: string,
    defaultLanguage: string) {
    // Important! if control already disabled through settings then skip
    if (!this.config.field.disabled) {
      // if header group slot is empty disable control
      if (this.headerGroupSlotIsEmpty) {
        this.group.controls[attributeKey].disable({ emitEvent: false });
        this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
      } else if (currentLanguage === defaultLanguage) {
        this.group.controls[attributeKey].enable({ emitEvent: false });
        this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
      } else { // else set enable/disable depending on editable translation exist
        if (!LocalizationHelper.translationExistsInDefault(attributes, defaultLanguage)) {
          this.group.controls[attributeKey].disable({ emitEvent: false });
          this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
          this.defaultLanguageMissingValue$.next(true);
        } else {
          this.defaultLanguageMissingValue$.next(false);
          if (this.isTranslateDisabled(attributeKey)) {
            this.group.controls[attributeKey].disable({ emitEvent: false });
            this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
          } else if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
            this.group.controls[attributeKey].enable({ emitEvent: false });
            this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
          } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
            this.group.controls[attributeKey].disable({ emitEvent: false });
            this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
          } else {
            this.group.controls[attributeKey].disable({ emitEvent: false });
            this.eavService.formDisabledChange$.next({ formId: this.config.form.formId, entityGuid: this.config.entity.entityGuid });
          }
        }
      }
    }
  }

  /** Translate a field configuration (labels, validation, ...) */
  private translateAllConfiguration() {
    const fieldSettings = LocalizationHelper.translateSettings(this.config.field.fullSettings,
      this.currentLanguage, this.defaultLanguage);
    this.config.field.settings = fieldSettings;
    this.config.field.label = this.config.field.settings.Name || null;
    this.config.field.validation = ValidationHelper.getValidations(this.config.field.settings);
    this.config.field.required = ValidationHelper.isRequired(this.config.field.settings);
    this.config.field.settings$?.next(fieldSettings); // must run after validations are recalculated
  }

  private subscribeToCurrentLanguageFromStore() {
    this.subscription.add(
      this.currentLanguage$.subscribe(currentLanguage => {
        this.currentLanguage = currentLanguage;
        this.translateAllConfiguration();
        this.refreshControlConfig(this.config.field.name);
      })
    );
  }

  private subscribeToDefaultLanguageFromStore() {
    this.subscription.add(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        this.defaultLanguage = defaultLanguage;
        this.translateAllConfiguration();
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
    if (this.config.entity.header.Group && this.config.entity.header.Group.SlotCanBeEmpty) {
      this.subscription.add(
        this.itemService.selectHeaderByEntityId(this.config.entity.entityId, this.config.entity.entityGuid).subscribe(header => {
          if (header.Group && !this.fieldConfig.isParentGroup) {
            this.headerGroupSlotIsEmpty = header.Group.SlotIsEmpty;
            this.setControlDisable(this.attributes[this.config.field.name], this.config.field.name,
              this.currentLanguage, this.defaultLanguage);
          }
        })
      );
    }
  }

  /** Fetch current item */
  private subscribeToItemFromStore() {
    this.subscription.add(
      this.itemService.selectItemById(this.config.entity.entityId).subscribe(item => {
        this.item = item;
      })
    );
  }

  /** Fetch contentType of current item */
  private subscribeToContentTypeFromStore() {
    const contentTypeId = this.item.entity.type === null
      ? this.item.header.ContentTypeName
      : this.item.entity.type.id;
    this.subscription.add(
      this.contentTypeService.getContentTypeById(contentTypeId).subscribe(contentType => {
        this.contentType = contentType;
      })
    );
  }

  /**
   * Fetch inputType definition to check if input field of this type shouldn't be translated
   * @param attributeType new attribute type defined in contentTypes
   */
  public isTranslateDisabled(attributeKey: string) {
    if (!LocalizationHelper.translationExistsInDefault(this.attributes[attributeKey], this.defaultLanguage)) { return true; }
    const attributeDef = this.contentType.contentType.attributes.find(attr => attr.name === attributeKey);
    if (attributeDef == null) {
      // since it's not defined it's not disabled. Happens when creating a new metadata entity, like settings for a field
      return false;
    }

    const calculatedInputType = InputFieldHelper.calculateInputType(attributeDef, this.inputTypeService);
    const disableI18n = LocalizationHelper.isI18nDisabled(this.inputTypeService, calculatedInputType, attributeDef.settings);
    return disableI18n;
  }

  private readTranslationState(attributes: EavValues<any>, attributeKey: string, currentLanguage: string, defaultLanguage: string) {
    // Determine is control disabled or enabled and info message
    if (!LocalizationHelper.translationExistsInDefault(attributes, defaultLanguage)) {
      this.setTranslationState(TranslationLinkConstants.MissingDefaultLangValue, '');
    } else if (this.isTranslateDisabled(attributeKey)) {
      this.setTranslationState(TranslationLinkConstants.DontTranslate, '');
    } else if (LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage)) {
      const editableElements: EavDimensions<string>[] = LocalizationHelper.getValueTranslation(attributes,
        currentLanguage, defaultLanguage)
        .dimensions.filter(f => f.value !== currentLanguage);
      if (editableElements.length > 0) {
        this.setTranslationState(TranslationLinkConstants.LinkReadWrite, editableElements[0].value);
      } else {
        this.setTranslationState(TranslationLinkConstants.Translate, '');
      }
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage)) {
      const readOnlyElements: EavDimensions<string>[] = LocalizationHelper.getValueTranslation(attributes,
        currentLanguage, defaultLanguage)
        .dimensions.filter(f => f.value !== currentLanguage);
      this.setTranslationState(TranslationLinkConstants.LinkReadOnly, readOnlyElements[0].value);
    } else {
      this.setTranslationState(TranslationLinkConstants.DontTranslate, '');
    }
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

  /** Set info message */
  private setInfoMessage(attributes: EavValues<any>, attributeKey: string, currentLanguage: string, defaultLanguage: string) {
    // Determine whether control is disabled or enabled and info message
    if (this.isTranslateDisabled(attributeKey)) {
      this.infoMessage$.next('');
      this.infoMessageLabel$.next('LangMenu.InAllLanguages');
      return;
    } else if (!LocalizationHelper.translationExistsInDefault(attributes, defaultLanguage)) {
      this.infoMessage$.next(defaultLanguage);
      this.infoMessageLabel$.next('LangMenu.MissingDefaultLangValue');
      return;
    }

    const isEditableTranslationExist: boolean = LocalizationHelper.isEditableTranslationExist(attributes, currentLanguage, defaultLanguage);
    const isReadonlyTranslationExist: boolean = LocalizationHelper.isReadonlyTranslationExist(attributes, currentLanguage);

    if (isEditableTranslationExist || isReadonlyTranslationExist) {
      let dimensions: string[] = LocalizationHelper.getValueTranslation(attributes, currentLanguage, defaultLanguage)
        .dimensions.map(d => d.value);

      dimensions = dimensions.filter(d => !d.includes(currentLanguage));

      const isShared = dimensions.length > 0;
      if (isShared) {
        this.infoMessage$.next(TranslateGroupMenuHelpers.calculateSharedInfoMessage(dimensions, currentLanguage));

        if (isEditableTranslationExist) {
          this.infoMessageLabel$.next('LangMenu.In');
        } else if (isReadonlyTranslationExist) {
          this.infoMessageLabel$.next('LangMenu.From');
        }
      } else {
        this.infoMessage$.next('');
        this.infoMessageLabel$.next('');
      }
    } else {
      this.infoMessage$.next('');
      this.infoMessageLabel$.next('LangMenu.UseDefault');
    }
  }
}
