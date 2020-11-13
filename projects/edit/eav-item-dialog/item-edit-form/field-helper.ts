import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TranslateGroupMenuHelpers } from '../../eav-material-controls/localization/translate-group-menu/translate-group-menu.helpers';
import { TranslationLinkConstants } from '../../shared/constants/translation-link.constants';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ContentType, EavAttributes, EavDimensions, Item } from '../../shared/models/eav';
import { LinkToOtherLanguageData } from '../../shared/models/eav/link-to-other-language-data';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

export class FieldHelper {
  slotIsEmpty$ = new BehaviorSubject(false);
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
  ) {
    this.subscription.add(
      this.itemService.selectItemHeader(this.entityGuid).pipe(
        filter(header => !this.isParentGroup && header.Group?.SlotCanBeEmpty),
      ).subscribe(header => {
        const slotIsEmpty = header.Group.SlotIsEmpty;
        this.slotIsEmpty$.next(slotIsEmpty);
      })
    );
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.formId).subscribe(this.currentLanguage$)
    );
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.formId).subscribe(this.defaultLanguage$)
    );
    this.subscription.add(
      this.itemService.selectItem(this.entityGuid).subscribe(this.item$)
    );
    this.subscription.add(
      this.itemService.selectItemAttributes(this.entityGuid).subscribe(this.attributes$)
    );
    const contentTypeId = InputFieldHelper.getContentTypeId(this.item$.value);
    this.subscription.add(
      this.contentTypeService.getContentTypeById(contentTypeId).subscribe(this.contentType$)
    );
  }

  destroy(): void {
    this.slotIsEmpty$.complete();
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

  readTranslationState(attributeKey: string): void {
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
  setTranslationInfoMessage(attributeKey: string) {
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
        this.translationInfoMessage$.next(TranslateGroupMenuHelpers.calculateSharedInfoMessage(dimensions, currentLanguage));

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
