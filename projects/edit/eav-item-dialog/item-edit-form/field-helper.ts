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
import { FormulaInstanceService } from '../../shared/services/formula-instance.service';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

export class FieldHelper {
  slotIsEmpty$ = new BehaviorSubject(false);
  defaultLanguageMissingValue$ = new BehaviorSubject(false);
  translationState$ = new BehaviorSubject<LinkToOtherLanguageData>({
    formId: null,
    linkType: '',
    language: '',
  });
  translationInfoMessage$ = new BehaviorSubject<string>('');
  translationInfoMessageLabel$ = new BehaviorSubject<string>('');

  private currentLanguage$ = new BehaviorSubject<string>(null);
  private defaultLanguage$ = new BehaviorSubject<string>(null);
  private item$ = new BehaviorSubject<Item>(null);
  private attributes$ = new BehaviorSubject<EavAttributes>(null);
  private contentType$ = new BehaviorSubject<ContentType>(null);
  private subscription = new Subscription();

  constructor(
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

  translate(config: FieldConfigSet, formulaInstance: FormulaInstanceService): void {
    const attributeKey = config.field.name;
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.itemService.removeItemAttributeDimension(config.entity.entityGuid, attributeKey, this.currentLanguage$.value);
    const defaultValue = LocalizationHelper.getValueTranslation(
      this.attributes$.value[attributeKey], this.defaultLanguage$.value, this.defaultLanguage$.value,
    );
    if (defaultValue) {
      const fieldType = InputFieldHelper.getFieldType(config, attributeKey);
      this.itemService.addItemAttributeValue(
        config.entity.entityGuid, attributeKey, defaultValue.value, this.currentLanguage$.value, false, fieldType,
      );
    } else {
      angularConsoleLog(`${this.currentLanguage$.value}: Cant copy value from ${this.defaultLanguage$.value} because that value does not exist.`);
    }

    this.languageInstanceService.checkField({
      entityGuid: config.entity.entityGuid,
      fieldName: config.field.name,
    });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  dontTranslate(config: FieldConfigSet, formulaInstance: FormulaInstanceService): void {
    const attributeKey = config.field.name;
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.itemService.removeItemAttributeDimension(config.entity.entityGuid, attributeKey, this.currentLanguage$.value);

    this.languageInstanceService.checkField({
      entityGuid: config.entity.entityGuid,
      fieldName: config.field.name,
    });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  copyFrom(config: FieldConfigSet, formulaInstance: FormulaInstanceService, copyFromLanguageKey: string): void {
    const attributeKey = config.field.name;
    if (this.isTranslateDisabled(attributeKey)) { return; }

    const attributeValueTranslation = LocalizationHelper.getValueTranslation(
      this.attributes$.value[attributeKey], copyFromLanguageKey, this.defaultLanguage$.value,
    );

    if (attributeValueTranslation) {
      const valueAlreadyExists = this.attributes$.value
        ? LocalizationHelper.isEditableOrReadonlyTranslationExist(
          this.attributes$.value[attributeKey], this.currentLanguage$.value, this.defaultLanguage$.value,
        )
        : false;

      if (valueAlreadyExists) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          config.entity.entityGuid,
          attributeKey,
          attributeValueTranslation.value,
          this.currentLanguage$.value,
          this.defaultLanguage$.value,
          false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.itemService.addItemAttributeValue(
          config.entity.entityGuid,
          attributeKey,
          attributeValueTranslation.value,
          this.currentLanguage$.value,
          false,
          config.field.type,
        );
      }
    } else {
      angularConsoleLog(`${this.currentLanguage$.value}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }

    this.languageInstanceService.checkField({
      entityGuid: config.entity.entityGuid,
      fieldName: config.field.name,
    });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  linkReadOnly(config: FieldConfigSet, formulaInstance: FormulaInstanceService, linkWithLanguageKey: string): void {
    const attributeKey = config.field.name;
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.setTranslationState(TranslationLinkConstants.LinkReadOnly, linkWithLanguageKey);
    this.itemService.removeItemAttributeDimension(config.entity.entityGuid, attributeKey, this.currentLanguage$.value);
    this.itemService.addItemAttributeDimension(
      config.entity.entityGuid, attributeKey, this.currentLanguage$.value, linkWithLanguageKey, this.defaultLanguage$.value, true,
    );

    this.languageInstanceService.checkField({
      entityGuid: config.entity.entityGuid,
      fieldName: config.field.name,
    });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  linkReadWrite(config: FieldConfigSet, formulaInstance: FormulaInstanceService, linkWithLanguageKey: string) {
    const attributeKey = config.field.name;
    if (this.isTranslateDisabled(attributeKey)) { return; }

    this.setTranslationState(TranslationLinkConstants.LinkReadWrite, linkWithLanguageKey);
    this.itemService.removeItemAttributeDimension(config.entity.entityGuid, attributeKey, this.currentLanguage$.value);
    this.itemService.addItemAttributeDimension(
      config.entity.entityGuid, attributeKey, this.currentLanguage$.value, linkWithLanguageKey, this.defaultLanguage$.value, false,
    );

    this.languageInstanceService.checkField({
      entityGuid: config.entity.entityGuid,
      fieldName: config.field.name,
    });
    // run value formulas when field is translated
    formulaInstance.runSettingsFormulas();
    formulaInstance.runValueFormulas();
  }

  refreshControlConfig(config: FieldConfigSet, form: FormGroup): void {
    const attributeKey = config.field.name;
    this.setControlDisable(config, form);
    this.readTranslationState(attributeKey);
    this.setTranslationInfoMessage(attributeKey);
  }

  setControlDisable(config: FieldConfigSet, form: FormGroup): void {
    const attributeKey = config.field.name;
    const values = this.attributes$.value[attributeKey];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    // Important! if control already disabled through settings then skip
    if (config.field.disabled) { return; }

    const control = form.controls[attributeKey];
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
        if (this.isTranslateDisabled(attributeKey)) {
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

  private readTranslationState(attributeKey: string): void {
    const values = this.attributes$.value[attributeKey];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    // Determine is control disabled or enabled and info message
    if (!LocalizationHelper.translationExistsInDefault(values, defaultLanguage)) {
      this.setTranslationState(TranslationLinkConstants.MissingDefaultLangValue, '');
    } else if (this.isTranslateDisabled(attributeKey)) {
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

  setTranslationState(linkType: string, language: string): void {
    const newTranslationState: LinkToOtherLanguageData = { ...this.translationState$.value, linkType, language };
    this.translationState$.next(newTranslationState);
  }

  /** Fetch inputType definition to check if input field of this type shouldn't be translated */
  isTranslateDisabled(attributeKey: string): boolean {
    const attributes = this.attributes$.value;
    const defaultLanguage = this.defaultLanguage$.value;
    if (!LocalizationHelper.translationExistsInDefault(attributes[attributeKey], defaultLanguage)) { return true; }

    const contentType = this.contentType$.value;
    const attributeDef = contentType.contentType.attributes.find(attr => attr.name === attributeKey);

    // since it's not defined it's not disabled. Happens when creating a new metadata entity, like settings for a field
    if (attributeDef == null) { return false; }

    const calculatedInputType = InputFieldHelper.calculateInputType(attributeDef, this.inputTypeService);
    const disableI18n = LocalizationHelper.isI18nDisabled(this.inputTypeService, calculatedInputType, attributeDef.settings);
    return disableI18n;
  }

  /** Set info message */
  private setTranslationInfoMessage(attributeKey: string): void {
    const values = this.attributes$.value[attributeKey];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    // determine whether control is disabled or enabled and info message
    if (this.isTranslateDisabled(attributeKey)) {
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
