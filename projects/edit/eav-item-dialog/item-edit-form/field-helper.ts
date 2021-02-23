import { BehaviorSubject, Subscription } from 'rxjs';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { TranslationLinkConstants } from '../../shared/constants/translation-link.constants';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { EavContentType, EavEntityAttributes } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

export class FieldHelper {
  private currentLanguage$ = new BehaviorSubject<string>(null);
  private defaultLanguage$ = new BehaviorSubject<string>(null);
  private attributes$ = new BehaviorSubject<EavEntityAttributes>(null);
  private contentType$ = new BehaviorSubject<EavContentType>(null);
  private subscription = new Subscription();
  private translationsSubscription: Subscription;

  constructor(
    private fieldName: string,
    private entityGuid: string,
    private formId: number,
    private contentTypeId: string,
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
  ) {
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
      this.itemService.selectItemAttributes(this.entityGuid).subscribe(attributes => {
        this.attributes$.next(attributes);
      })
    );
    this.subscription.add(
      this.contentTypeService.getContentTypeById(this.contentTypeId).subscribe(contentType => {
        this.contentType$.next(contentType);
      })
    );
  }

  startTranslations(): void {
    this.translationsSubscription = new Subscription();

    // onTranslateMany
    this.translationsSubscription.add(
      this.languageInstanceService.getTranslateMany(this.formId, this.entityGuid).subscribe(props => {
        switch (props.translationLink) {
          case TranslationLinkConstants.Translate:
            this.translate();
            break;
          case TranslationLinkConstants.DontTranslate:
            this.dontTranslate();
            break;
        }
      })
    );
  }

  stopTranslations() {
    this.translationsSubscription.unsubscribe();
  }

  destroy(): void {
    this.currentLanguage$.complete();
    this.defaultLanguage$.complete();
    this.attributes$.complete();
    this.contentType$.complete();
    this.subscription.unsubscribe();
  }

  translate(): void {
    if (this.isTranslateDisabled()) { return; }

    const values = this.attributes$.value[this.fieldName];
    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;

    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
    const defaultValue = LocalizationHelper.getValueTranslation(values, defaultLanguage, defaultLanguage);
    if (defaultValue) {
      const attribute = this.contentType$.value.Attributes.find(a => a.Name === this.fieldName);
      this.itemService.addItemAttributeValue(this.entityGuid, this.fieldName, defaultValue.Value, currentLanguage, false, attribute.Type);
    } else {
      angularConsoleLog(`${currentLanguage}: Cant copy value from ${defaultLanguage} because that value does not exist.`);
    }
  }

  dontTranslate(): void {
    if (this.isTranslateDisabled()) { return; }

    const currentLanguage = this.currentLanguage$.value;
    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
  }

  copyFrom(copyFromLanguageKey: string): void {
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
          this.entityGuid, this.fieldName, attributeValueTranslation.Value, currentLanguage, defaultLanguage, false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        const attribute = this.contentType$.value.Attributes.find(a => a.Name === this.fieldName);
        this.itemService.addItemAttributeValue(
          this.entityGuid, this.fieldName, attributeValueTranslation.Value, currentLanguage, false, attribute.Type,
        );
      }
    } else {
      angularConsoleLog(`${currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }
  }

  linkReadOnly(linkWithLanguageKey: string): void {
    if (this.isTranslateDisabled()) { return; }

    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;
    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, this.fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, true,
    );
  }

  linkReadWrite(linkWithLanguageKey: string) {
    if (this.isTranslateDisabled()) { return; }

    const currentLanguage = this.currentLanguage$.value;
    const defaultLanguage = this.defaultLanguage$.value;
    this.itemService.removeItemAttributeDimension(this.entityGuid, this.fieldName, currentLanguage);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, this.fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, false,
    );
  }

  /** Fetch inputType definition to check if input field of this type shouldn't be translated */
  private isTranslateDisabled(): boolean {
    const values = this.attributes$.value[this.fieldName];
    const defaultLanguage = this.defaultLanguage$.value;
    if (!LocalizationHelper.translationExistsInDefault(values, defaultLanguage)) { return true; }

    const attribute = this.contentType$.value.Attributes.find(a => a.Name === this.fieldName);
    // since it's not defined it's not disabled. Happens when creating a new metadata entity, like settings for a field
    if (attribute == null) { return false; }

    const calculatedInputType = InputFieldHelper.calculateInputType(attribute, this.inputTypeService);
    const disableI18n = LocalizationHelper.isI18nDisabled(this.inputTypeService, calculatedInputType, attribute.Settings);
    return disableI18n;
  }
}
