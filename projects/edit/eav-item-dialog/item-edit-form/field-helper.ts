import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { TranslateMenuHelpers } from '../../eav-material-controls/localization/translate-menu/translate-menu.helpers';
import { TranslationLinkConstants } from '../../shared/constants/translation-link.constants';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ContentType, EavAttributes, EavDimensions, Item } from '../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../shared/models/eav/link-to-other-language-data';
import { EavService } from '../../shared/services/eav.service';
import { FieldsSettingsService } from '../../shared/services/fields-settings.service';
import { FormulaInstanceService } from '../../shared/services/formula-instance.service';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

export class FieldHelper {
  defaultLanguageMissingValue$ = new BehaviorSubject(false);
  translationState$ = new BehaviorSubject<LinkToOtherLanguageData>({
    formId: null,
    linkType: '',
    language: '',
  });
  translationInfoMessage$ = new BehaviorSubject<string>('');
  translationInfoMessageLabel$ = new BehaviorSubject<string>('');

  private slotIsEmpty$ = new BehaviorSubject(false);
  private currentLanguage$ = new BehaviorSubject<string>(null);
  private defaultLanguage$ = new BehaviorSubject<string>(null);
  private item$ = new BehaviorSubject<Item>(null);
  private attributes$ = new BehaviorSubject<EavAttributes>(null);
  private contentType$ = new BehaviorSubject<ContentType>(null);
  private subscription = new Subscription();
  private translationsSubscription: Subscription;

  constructor(
    private fieldName: string,
    private entityGuid: string,
    private formId: number,
    private isParentGroup: boolean,
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private eavService: EavService,
  ) {
    this.subscription.add(
      this.itemService.selectItemHeader(this.entityGuid).pipe(
        filter(header => !this.isParentGroup && header?.Group?.SlotCanBeEmpty),
      ).subscribe(header => {
        const slotIsEmpty = header.Group.SlotIsEmpty;
        this.slotIsEmpty$.next(slotIsEmpty);
      })
    );
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.formId).subscribe(currentLanguage => {
        this.currentLanguage$.next(currentLanguage);
      })
    );
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.formId).subscribe(defaultLanguage => {
        this.defaultLanguage$.next(defaultLanguage);
      })
    );
    this.subscription.add(
      this.itemService.selectItem(this.entityGuid).subscribe(item => {
        this.item$.next(item);
      })
    );
    this.subscription.add(
      this.itemService.selectItemAttributes(this.entityGuid).subscribe(attributes => {
        this.attributes$.next(attributes);
      })
    );
    const contentTypeId = InputFieldHelper.getContentTypeId(this.item$.value);
    this.subscription.add(
      this.contentTypeService.getContentTypeById(contentTypeId).subscribe(contentType => {
        this.contentType$.next(contentType);
      })
    );
  }

  startTranslations(
    config: FieldConfigSet,
    form: FormGroup,
    formulaInstance: FormulaInstanceService,
    fieldsSettingsService: FieldsSettingsService,
  ): void {
    this.translationsSubscription = new Subscription();

    // onCheckField
    this.translationsSubscription.add(
      this.languageInstanceService.getCheckField(this.entityGuid, this.fieldName).subscribe(props => {
        this.refreshControlConfig(config, form);
      })
    );
    // onTranslateMany
    this.translationsSubscription.add(
      this.languageInstanceService.getTranslateMany(this.formId, this.entityGuid).subscribe(props => {
        switch (props.translationLink) {
          case TranslationLinkConstants.Translate:
            this.translate(formulaInstance);
            break;
          case TranslationLinkConstants.DontTranslate:
            this.dontTranslate(formulaInstance);
            break;
        }
      })
    );
    // onCurrentLanguageChanged
    this.translationsSubscription.add(
      this.currentLanguage$.subscribe(currentLanguage => {
        const defaultLanguage = this.defaultLanguage$.value;
        fieldsSettingsService.translateSettingsAndValidation(config, currentLanguage, defaultLanguage);
        this.refreshControlConfig(config, form);
        formulaInstance.fieldTranslated(this.fieldName);
      })
    );
    // onDefaultLanguageChanged
    this.translationsSubscription.add(
      this.defaultLanguage$.subscribe(defaultLanguage => {
        const currentLanguage = this.currentLanguage$.value;
        fieldsSettingsService.translateSettingsAndValidation(config, currentLanguage, defaultLanguage);
        this.refreshControlConfig(config, form);
      })
    );
    // onFormulaSettingsChanged
    this.translationsSubscription.add(
      formulaInstance.getSettings(this.fieldName).pipe(
        filter(formulaSettings => formulaSettings != null),
      ).subscribe(formulaSettings => {
        const currentLanguage = this.currentLanguage$.value;
        const defaultLanguage = this.defaultLanguage$.value;
        fieldsSettingsService.translateSettingsAndValidation(config, currentLanguage, defaultLanguage, formulaSettings);
        this.refreshControlConfig(config, form);
      })
    );
    // onSlotIsEmptyChanged
    this.translationsSubscription.add(
      this.slotIsEmpty$.subscribe(slotIsEmpty => {
        this.setControlDisable(config, form);
      })
    );
  }

  stopTranslations() {
    this.translationsSubscription.unsubscribe();
  }

  destroy(): void {
    this.slotIsEmpty$.complete();
    this.defaultLanguageMissingValue$.complete();
    this.translationState$.complete();
    this.translationInfoMessage$.complete();
    this.translationInfoMessageLabel$.complete();
    this.currentLanguage$.complete();
    this.defaultLanguage$.complete();
    this.item$.complete();
    this.attributes$.complete();
    this.contentType$.complete();
    this.subscription.unsubscribe();
  }

  translate(formulaInstance: FormulaInstanceService): void {
    if (this.isTranslateDisabled()) { return; }

    const values = this.attributes$.value[this.fieldName];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
    const defaultValue = LocalizationHelper.getValueTranslation(values, defaultLanguage, defaultLanguage);
    if (defaultValue) {
      const attributeDef = this.contentType$.value.contentType.attributes.find(attr => attr.name === this.fieldName);
      this.itemService.addItemAttributeValue(
        this.entityGuid, this.fieldName, defaultValue.value, currentLanguage, false, attributeDef.type,
      );
    } else {
      angularConsoleLog(`${currentLanguage}: Cant copy value from ${defaultLanguage} because that value does not exist.`);
    }

    this.languageInstanceService.checkField({ entityGuid: this.entityGuid, fieldName: this.fieldName });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  dontTranslate(formulaInstance: FormulaInstanceService): void {
    if (this.isTranslateDisabled()) { return; }

    const currentLanguage = this.currentLanguage$.value;
    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);

    this.languageInstanceService.checkField({ entityGuid: this.entityGuid, fieldName: this.fieldName });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  copyFrom(formulaInstance: FormulaInstanceService, copyFromLanguageKey: string): void {
    if (this.isTranslateDisabled()) { return; }

    const values = this.attributes$.value[this.fieldName];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    const attributeValueTranslation = LocalizationHelper.getValueTranslation(values, copyFromLanguageKey, defaultLanguage);
    if (attributeValueTranslation) {
      const valueAlreadyExists = values
        ? LocalizationHelper.isEditableOrReadonlyTranslationExist(values, currentLanguage, defaultLanguage)
        : false;

      if (valueAlreadyExists) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          this.entityGuid, this.fieldName, attributeValueTranslation.value, currentLanguage, defaultLanguage, false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        const attributeDef = this.contentType$.value.contentType.attributes.find(attr => attr.name === this.fieldName);
        this.itemService.addItemAttributeValue(
          this.entityGuid, this.fieldName, attributeValueTranslation.value, currentLanguage, false, attributeDef.type,
        );
      }
    } else {
      angularConsoleLog(`${currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }

    this.languageInstanceService.checkField({ entityGuid: this.entityGuid, fieldName: this.fieldName });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  linkReadOnly(formulaInstance: FormulaInstanceService, linkWithLanguageKey: string): void {
    if (this.isTranslateDisabled()) { return; }

    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;
    this.setTranslationState(TranslationLinkConstants.LinkReadOnly, linkWithLanguageKey);
    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, this.fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, true,
    );

    this.languageInstanceService.checkField({ entityGuid: this.entityGuid, fieldName: this.fieldName });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  linkReadWrite(formulaInstance: FormulaInstanceService, linkWithLanguageKey: string) {
    if (this.isTranslateDisabled()) { return; }

    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;
    this.setTranslationState(TranslationLinkConstants.LinkReadWrite, linkWithLanguageKey);
    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, this.fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, false,
    );

    this.languageInstanceService.checkField({ entityGuid: this.entityGuid, fieldName: this.fieldName });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  private refreshControlConfig(config: FieldConfigSet, form: FormGroup): void {
    this.setControlDisable(config, form);
    this.readTranslationState();
    this.setTranslationInfoMessage();
  }

  private setControlDisable(config: FieldConfigSet, form: FormGroup): void {
    const values = this.attributes$.value[this.fieldName];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    // Important! if control already disabled through settings then skip
    if (config.field.disabled) { return; }

    const control = form.controls[this.fieldName];
    let newDisabled = control.disabled;
    const defaultLanguageMissingValue = !LocalizationHelper.translationExistsInDefault(values, defaultLanguage);

    if (this.slotIsEmpty$.value) {
      newDisabled = true;
    } else if (currentLanguage === defaultLanguage) {
      newDisabled = false;
    } else {
      if (defaultLanguageMissingValue) {
        newDisabled = true;
      } else {
        if (this.isTranslateDisabled()) {
          newDisabled = true;
        } else if (LocalizationHelper.isEditableTranslationExist(values, currentLanguage, defaultLanguage)) {
          newDisabled = false;
        } else if (LocalizationHelper.isReadonlyTranslationExist(values, currentLanguage)) {
          newDisabled = true;
        } else {
          newDisabled = true;
        }
      }
    }

    if (control.disabled !== newDisabled) {
      if (newDisabled) {
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
      this.eavService.formDisabledChange$.next({ formId: this.formId, entityGuid: this.entityGuid });
    }
    if (this.defaultLanguageMissingValue$.value !== defaultLanguageMissingValue) {
      this.defaultLanguageMissingValue$.next(defaultLanguageMissingValue);
    }
  }

  private readTranslationState(): void {
    const values = this.attributes$.value[this.fieldName];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    // Determine is control disabled or enabled and info message
    if (!LocalizationHelper.translationExistsInDefault(values, defaultLanguage)) {
      this.setTranslationState(TranslationLinkConstants.MissingDefaultLangValue, '');
    } else if (this.isTranslateDisabled()) {
      this.setTranslationState(TranslationLinkConstants.DontTranslate, '');
    } else if (LocalizationHelper.isEditableTranslationExist(values, currentLanguage, defaultLanguage)) {
      const editableElements: EavDimensions<string>[] = LocalizationHelper
        .getValueTranslation(values, currentLanguage, defaultLanguage)
        .dimensions.filter(dimension => dimension.value !== currentLanguage);

      if (editableElements.length > 0) {
        this.setTranslationState(TranslationLinkConstants.LinkReadWrite, editableElements[0].value);
      } else {
        this.setTranslationState(TranslationLinkConstants.Translate, '');
      }
    } else if (LocalizationHelper.isReadonlyTranslationExist(values, currentLanguage)) {
      const readOnlyElements: EavDimensions<string>[] = LocalizationHelper
        .getValueTranslation(values, currentLanguage, defaultLanguage)
        .dimensions.filter(dimension => dimension.value !== currentLanguage);

      this.setTranslationState(TranslationLinkConstants.LinkReadOnly, readOnlyElements[0].value);
    } else {
      this.setTranslationState(TranslationLinkConstants.DontTranslate, '');
    }
  }

  private setTranslationState(linkType: string, language: string): void {
    const newTranslationState: LinkToOtherLanguageData = { ...this.translationState$.value, linkType, language };
    this.translationState$.next(newTranslationState);
  }

  /** Fetch inputType definition to check if input field of this type shouldn't be translated */
  private isTranslateDisabled(): boolean {
    const values = this.attributes$.value[this.fieldName];
    const defaultLanguage = this.defaultLanguage$.value;
    if (!LocalizationHelper.translationExistsInDefault(values, defaultLanguage)) { return true; }

    const attributeDef = this.contentType$.value.contentType.attributes.find(attr => attr.name === this.fieldName);
    // since it's not defined it's not disabled. Happens when creating a new metadata entity, like settings for a field
    if (attributeDef == null) { return false; }

    const calculatedInputType = InputFieldHelper.calculateInputType(attributeDef, this.inputTypeService);
    const disableI18n = LocalizationHelper.isI18nDisabled(this.inputTypeService, calculatedInputType, attributeDef.settings);
    return disableI18n;
  }

  /** Set info message */
  private setTranslationInfoMessage(): void {
    const values = this.attributes$.value[this.fieldName];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    // determine whether control is disabled or enabled and info message
    if (this.isTranslateDisabled()) {
      this.translationInfoMessage$.next('');
      this.translationInfoMessageLabel$.next('LangMenu.InAllLanguages');
      return;
    } else if (!LocalizationHelper.translationExistsInDefault(values, defaultLanguage)) {
      this.translationInfoMessage$.next(defaultLanguage);
      this.translationInfoMessageLabel$.next('LangMenu.MissingDefaultLangValue');
      return;
    }

    const editableTranslationExists = LocalizationHelper.isEditableTranslationExist(values, currentLanguage, defaultLanguage);
    const readonlyTranslationExists = LocalizationHelper.isReadonlyTranslationExist(values, currentLanguage);

    if (editableTranslationExists || readonlyTranslationExists) {
      let dimensions: string[] = LocalizationHelper.getValueTranslation(values, currentLanguage, defaultLanguage)
        .dimensions.map(dimension => dimension.value);

      dimensions = dimensions.filter(dimension => !dimension.includes(currentLanguage));

      const isShared = dimensions.length > 0;
      if (isShared) {
        this.translationInfoMessage$.next(TranslateMenuHelpers.calculateSharedInfoMessage(dimensions, currentLanguage));

        if (editableTranslationExists) {
          this.translationInfoMessageLabel$.next('LangMenu.In');
        } else if (readonlyTranslationExists) {
          this.translationInfoMessageLabel$.next('LangMenu.From');
        }
      } else {
        this.translationInfoMessage$.next('');
        this.translationInfoMessageLabel$.next('');
      }
    } else {
      this.translationInfoMessage$.next('');
      this.translationInfoMessageLabel$.next('LangMenu.UseDefault');
    }
  }
}
