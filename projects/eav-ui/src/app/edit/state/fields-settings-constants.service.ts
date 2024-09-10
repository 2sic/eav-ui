import { computed, Injectable, Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { EntityReader } from '../shared/helpers';
import { EavItem, EavContentType } from '../shared/models/eav';
import { FormConfigService } from '../form/form-config.service';
import { ItemFieldVisibility } from './item-field-visibility';
import { FieldConstants, FieldConstantsOfLanguage } from './fields-configs.model';
import { InputTypeService } from '../shared/input-types/input-type.service';
import isEqual from 'lodash-es/isEqual';
import { FieldsSettingsHelpers } from './field-settings.helper';
import { classLog } from '../../shared/logging';

/**
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsConstantsService {
  private item: EavItem;
  private itemFieldVisibility: ItemFieldVisibility;
  private entityReaderCurrent: Signal<EntityReader>;
  private contentType: EavContentType;

  log = classLog({FieldsSettingsConstantsService});

  constructor(
    private formConfig: FormConfigService,
    private inputTypeSvc: InputTypeService,
  ) { }

  #fss = new FieldsSettingsHelpers(this.log.name);

  init(
    itemForIds: EavItem,
    contentType: EavContentType,
    entityReaderCurrent: Signal<EntityReader>,
  ): this {
    this.item = itemForIds;
    this.contentType = contentType;
    this.itemFieldVisibility = new ItemFieldVisibility(itemForIds.Header);
    this.entityReaderCurrent = entityReaderCurrent;
    return this;
  }

  getUnchangingDataOfLanguage() {
    const entityGuid = this.item.Entity.Guid;
    const entityId = this.item.Entity.Id;
    const contentTypeNameId = this.contentType.Id;
    const unchangingPartsAllLanguages = this.#getConstantFieldParts(entityGuid, entityId, contentTypeNameId);
    return this.#getConstantFieldPartsOfLanguage(unchangingPartsAllLanguages);
  }

  #getConstantFieldPartsOfLanguage(fieldConstants: FieldConstants[]): Signal<FieldConstantsOfLanguage[]> {
    return computed(() => this.#getConstantPartsOfLanguage(this.entityReaderCurrent(), fieldConstants), { equal: isEqual });
  }

  #getConstantPartsOfLanguage(entityReader: EntityReader, fieldConstants: FieldConstants[]) {
    const contentType = this.contentType;
    const l = this.log.fn('constantFieldPartsLanguage(map)', { contentType, entityReader });

    const constPartOfLanguage = contentType.Attributes.map((ctAttrib) => {
      // Input Type config in the current language
      const inputType = this.inputTypeSvc.get(ctAttrib.InputType);

      // Construct the constants with settings and everything
      // using the EntityReader with the current language
      const mergeRaw = entityReader.flattenAll<FieldSettings>(ctAttrib.Metadata);

      // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
      mergeRaw.InputType = ctAttrib.InputType;
      mergeRaw.VisibleDisabled = this.itemFieldVisibility.isVisibleDisabled(ctAttrib.Name);
      const settingsInitial = this.#fss.getDefaultSettings(mergeRaw);
      const constantFieldParts: FieldConstantsOfLanguage = {
        ...fieldConstants.find(c => c.fieldName === ctAttrib.Name),
        settingsInitial,
        inputTypeConfiguration: inputType,
        language: entityReader.current,
      };

      return constantFieldParts;
    });

    const constPartsWithGroupVisibility = this.itemFieldVisibility.makeParentGroupsVisible(constPartOfLanguage);

    return l.r(constPartsWithGroupVisibility);
  }

  #getConstantFieldParts(entityGuid: string, entityId: number, contentTypeNameId: string): FieldConstants[] {
    const contentType = this.contentType;
    const l = this.log.fn('constantFieldParts', { entityGuid, entityId, contentTypeNameId });
    // Get the form languages - but we only need default & initial, so we don't have to observe
    const language = this.formConfig.language();
    
    // When merging the "constant" metadata, the primary language must be the initial language, not the current
    // as that contains all the relevant settings which should not be translated
    const mdMerger = new EntityReader(language.initial, language.primary);

    const constFieldParts = contentType.Attributes.map((attribute, index) => {
      // metadata in the initial language with all the core settings
      const metadata = mdMerger.flattenAll<FieldSettings>(attribute.Metadata);
      const initialSettings = this.#fss.getDefaultSettings(metadata);

      const inputTypeSpecs = this.inputTypeSvc.getSpecs(attribute);

      this.log.a('details', { contentType, language, attribute, initialSettings, inputTypeSpecs });

      const logic = FieldLogicManager.singleton().get(attribute.InputType);

      const eavConfig = this.formConfig.config;

      // Construct the constants / unchanging aspects of the field, no matter what language
      const constants: FieldConstants = {
        entityGuid,
        entityId,
        contentTypeNameId,
        fieldName: attribute.Name,
        index,
        dropzonePreviewsClass: `dropzone-previews-${eavConfig.formId}-${index}`,
        initialDisabled: initialSettings.Disabled ?? false,
        inputTypeSpecs,
        isLastInGroup: this.#fss.isLastInGroup(contentType, attribute),
        type: attribute.Type,
        logic,
      };

      return constants;
    });
    return l.r(constFieldParts);
  }

}
