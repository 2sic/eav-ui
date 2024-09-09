import { EavLogger } from '../../shared/logging/eav-logger';
import { FormLanguage } from '../form/form-languages.model';
import { EavField, EavValue } from '../shared/models/eav';
import { DimensionReader } from './dimension-reader';

const logSpecs = {
  enabled: false,
  name: 'FieldReader',
  specs: {
    all: false,
    constructor: false,
  }
};

export class FieldReader<T = any> {
  log = new EavLogger(logSpecs);

  constructor(field: EavField<T>, language: string);
  constructor(field: EavField<T>, language: FormLanguage);
  constructor(field: EavField<T>, language: FormLanguage | string) {
    this.log.fnIf('constructor', { field, language });
    this.#field = field;
    this.#language = typeof language === 'string' ? { current: language, primary: language } : language;
  }

  #field: EavField<T>;
  #language: FormLanguage;

  get current(): EavValue<T> | null {
    return this.ofLanguage(this.#language); // first match if any is the one we're looking for
  }

  /**
   *
   * Priority:
   * 1. value for current language
   * 2. value for all languages
   * 3. value for default language
   *
   * @readonly
   * @type {EavValue<T>}
   * @memberof FieldReader
   */
  get currentOrDefault(): EavValue<T> {
    return this.current
      // note that having both languages primary will also result in checking the '*' dimension
      ?? this.ofLanguage(FormLanguage.bothPrimary(this.#language));
  }

  /**
   * Priority:
   * 1. value for current language
   * 2. value for all languages
   * 3. value for default language
   * 4. first/any value in the system
   */
  get currentOrDefaultOrAny(): EavValue<T> | null {
    return this.currentOrDefault ?? this.#field.Values[0] ?? null;
  }


  ofLanguage(language: FormLanguage): EavValue<T> | null {
    if (!this.#field) return null;
    return this.#field.Values.filter(val => new DimensionReader(val.Dimensions, language).hasCurrent)[0] ?? null;
  }

  /** Check if there is a value on the specified primary language or on the '*' dimension */
  get hasPrimary(): boolean {
    if (!this.#field) return false;
    const primary = this.#language.primary;
    return this.#field.Values.filter(val => val.Dimensions.find(d => d.Value === primary || d.Value === '*')).length > 0;
  }

  get hasCurrentReadonly(): boolean {
    if (!this.#field) return false;
    return this.#field.Values.filter(val => new DimensionReader(val.Dimensions, this.#language).hasCurrentReadOnly).length > 0;
  }

  /** A value in specified Language is editable, if assigned to current language or to '*' (but only when on default-language) */
  get hasEditableValues(): boolean {
    return this.#valuesEditableOf().length > 0;
  }

  /** Number of editable translatable fields that */
  countEditable(): number {
    return this.#valuesEditableOf().length;
  }

  /** Number of editable translatable fields that have some content (not empty/null) */
  countEditableWithContents(): number {
    return this.#valuesEditableOf().filter(v => v.Value != "" && v.Value != null)?.length;
  }

  /**
   * Values of a field are for the current language,
   * if they are assigned to the current language or to '*' (but only when the current-language is also the primary-language)
   */
  #valuesEditableOf(language?: FormLanguage): EavValue<T>[] {
    if (!this.#field) return [];
    language ??= this.#language;
    return this.#field.Values.filter(val => new DimensionReader(val.Dimensions, language).hasCurrentWrite);
  }

  // TODO CONTINUE HERE
  /** Value of current language which is editable. `null` if not found. */
  get currentEditable(): EavValue<T> {
    const dimension = this.#language.current;
    return this.#field.Values.find(v => v.Dimensions.find(x => x.Value === dimension)) ?? null;
  }

  isEditableOrReadonlyTranslationExist(): boolean {
    if (!this.#field) return false;
    return this.#valuesEditableOf().length > 0;
  }

}
