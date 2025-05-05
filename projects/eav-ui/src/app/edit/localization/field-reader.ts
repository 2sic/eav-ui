import { classLog } from '../../shared/logging';
import { FormLanguage } from '../form/form-languages.model';
import { EavField, EavFieldValue } from '../shared/models/eav';
import { DimensionReader } from './dimension-reader';

const logSpecs = {
  all: false,
  constructor: false,
};

export class FieldReader<T = any> {
  
  log = classLog({FieldReader}, logSpecs);

  constructor(field: EavField<T>, language: string);
  constructor(field: EavField<T>, language: FormLanguage);
  constructor(field: EavField<T>, language: FormLanguage | string) {
    this.log.fnIf('constructor', { field, language });
    this.#field = field;
    this.#language = typeof language === 'string' ? { current: language, primary: language } : language;
    this.#values = field?.Values ?? [];
    this.#noData = !field || !field.Values || field.Values.length === 0;
  }

  #noData = true;

  #field: EavField<T>;
  /** Values - never empty for read-safety */
  #values: EavFieldValue<T>[];
  #language: FormLanguage;

  get current(): EavFieldValue<T> | null {
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
   * @type {EavFieldValue<T>}
   * @memberof FieldReader
   */
  get currentOrDefault(): EavFieldValue<T> {
    if (this.#noData) return null;
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
  get currentOrDefaultOrAny(): EavFieldValue<T> | null {
    if (this.#noData) return null;
    return this.currentOrDefault ?? this.#values[0] ?? null;
  }


  ofLanguage(language: FormLanguage): EavFieldValue<T> | null {
    if (this.#noData) return null;
    return this.#values.filter(val => new DimensionReader(val.Dimensions, language).hasCurrent)[0] ?? null;
  }

  /** Check if there is a value on the specified primary language or on the '*' dimension */
  get hasPrimary(): boolean {
    if (this.#noData) return false;
    const primary = this.#language.primary;
    return this.#values.filter(val => val.Dimensions.find(d => d.Value === primary || d.Value === '*')).length > 0;
  }

  get hasCurrentReadonly(): boolean {
    if (this.#noData) return false;
    return this.#values.filter(val => new DimensionReader(val.Dimensions, this.#language).hasCurrentReadOnly).length > 0;
  }

  /** A value in specified Language is editable, if assigned to current language or to '*' (but only when on default-language) */
  get hasEditableValues(): boolean {
    if (this.#noData) return false;
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
  #valuesEditableOf(language?: FormLanguage): EavFieldValue<T>[] {
    if (this.#noData) return [];
    language ??= this.#language;
    return this.#values.filter(val => new DimensionReader(val.Dimensions, language).hasCurrentWrite);
  }

  /** Value of current language which is editable. `null` if not found. */
  get currentEditable(): EavFieldValue<T> {
    if (this.#noData) return null;
    const dimension = this.#language.current;
    return this.#values.find(v => v.Dimensions.find(x => x.Value === dimension)) ?? null;
  }

  isEditableOrReadonlyTranslationExist(): boolean {
    if (this.#noData) return false;
    return this.#valuesEditableOf().length > 0;
  }

}
