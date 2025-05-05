import { Injectable } from '@angular/core';
import { classLogEnabled } from '../../shared/logging';
import { LanguageService } from '../localization/language.service';
import { EntityReader } from '../shared/helpers/entity-reader';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { ItemService } from '../state/item.service';
import { FormConfigService } from './form-config.service';

const logSpecs = {
  all: false,
  constructor: false,
  preserve: true,
  get: true,
};

@Injectable()
export class InitialValuesService {
  log = classLogEnabled({InitialValuesService}, logSpecs);
  
  #initialFormValues: Record<string, ItemValuesOfLanguage> = {};
  
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageService: LanguageService,
  ) {
    this.log.aIf('constructor', null, "constructor");
  }

  /**
   * Preserve initial values for future use in formulas which may need to know the initial value
   */
  preserve(): void {
    const l = this.log.fnIf('preserve');
    const items = this.itemService.getMany(this.formConfig.config.itemGuids);
    const allLangs = this.languageService.getAll().map(language => language.NameId);
    const language = this.formConfig.language();
    if (!allLangs.includes(language.current))
      allLangs.push(language.current);
    if (!allLangs.includes(language.primary))
      allLangs.push(language.primary);

    for (const item of items)
      for (const currentLang of allLangs) {
        const formValues = new EntityReader(currentLang, language.primary).currentValues(item.Entity.Attributes);
        const cacheKey = this.#cacheKey(item.Entity.Guid, currentLang);
        this.#initialFormValues[cacheKey] = formValues;
      }
  }

  #cacheKey(entityGuid: string, language: string): string {
    return `entityGuid:${entityGuid}:language:${language}`;
  }

  get(entityGuid: string, language: string): ItemValuesOfLanguage {
    const l = this.log.fnIf('get', { entityGuid, language });
    const result = this.#initialFormValues[this.#cacheKey(entityGuid, language)];
    return l.r(result);
  }

}