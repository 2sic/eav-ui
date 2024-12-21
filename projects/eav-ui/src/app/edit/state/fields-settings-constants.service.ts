import { Injectable, Signal } from '@angular/core';
import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../shared/logging';
import { computedObj } from '../../shared/signals/signal.utilities';
import { DebugFields } from '../edit-debug';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { FormConfigService } from '../form/form-config.service';
import { EntityReader } from '../shared/helpers';
import { InputTypeService } from '../shared/input-types/input-type.service';
import { EavContentType, EavItem } from '../shared/models/eav';
import { FieldsSettingsHelpers } from './field-settings.helper';
import { FieldConstants, FieldConstantsOfLanguage } from './fields-configs.model';
import { FieldsSettingsService } from './fields-settings.service';
import { ItemFieldVisibility } from './item-field-visibility';

const logSpecs = {
  all: false,
  stablePartsOfLanguage: false,
  stablePartOfField: true,
  constantPartsOfField: false,
  constantFieldParts: false,
  staticPartsOfField: false,
  fields: [...DebugFields],
}

/**
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsConstantsService {

  log = classLog({FieldsSettingsConstantsService}, logSpecs);

  constructor(
    private formConfig: FormConfigService,
    private inputTypeSvc: InputTypeService,
  ) { }

  #fieldSettingsHelper = new FieldsSettingsHelpers(this.log.name);

  init(
    itemForIds: EavItem,
    contentType: EavContentType,
    entityReaderCurrent: Signal<EntityReader>,
    labelReaderCurrent: Signal<EntityReader>,
    fieldsSettingsSvc: FieldsSettingsService,
  ): this {
    this.#item = itemForIds;
    this.#contentType = contentType;
    this.#itemFieldVisibility = new ItemFieldVisibility(itemForIds.Header);
    this.#entityReaderCurrent = entityReaderCurrent;
    this.#labelReaderCurrent = labelReaderCurrent;
    this.#fieldSettingsSvc = fieldsSettingsSvc;
    return this;
  }

  #item: EavItem;
  #itemFieldVisibility: ItemFieldVisibility;
  #entityReaderCurrent: Signal<EntityReader>;
  #labelReaderCurrent: Signal<EntityReader>;
  #contentType: EavContentType;
  #fieldSettingsSvc: FieldsSettingsService;

  public stableDataOfLanguage() {
    const guid = this.#item.Entity.Guid;
    const id = this.#item.Entity.Id;
    const typeNameId = this.#contentType.Id;
    const constParts = this.#constantPartsOfField(guid, id, typeNameId);

    return computedObj('stableDataOfLanguage',
      () => this.#stablePartsOfLanguage(this.#entityReaderCurrent(), this.#labelReaderCurrent(), constParts)
    );
  }

  #stablePartsOfLanguage(reader: EntityReader, labelReader: EntityReader, fieldConstants: FieldConstants[]) {
    const contentType = this.#contentType;
    const l = this.log.fnIf('stablePartsOfLanguage', { contentType, entityReader: reader });

    const constPartOfLanguage = contentType.Attributes.map(attr => {
      const fieldName = attr.Name;
      const lInner = this.log.fnIfInList('stablePartOfField', 'fields', fieldName, { fieldName });

      // Input Type config in the current language
      const inputType = this.inputTypeSvc.get(attr.InputType);

      // Construct the constants with settings and everything
      // using the EntityReader with the current language
      const merged = reader.flatten<FieldSettings>(attr.Metadata);

      // If the user specified a preferred language for labels, use that
      if (labelReader.current !== reader.current) {
        const labelMerged = labelReader.flatten<FieldSettings>(attr.Metadata);
        merged.Name = labelMerged.Name ?? merged.Name;
        merged.Placeholder = labelMerged.Placeholder ?? merged.Placeholder;
        merged.Notes = labelMerged.Notes ?? merged.Notes;
      }

      // Also integrate the generic (custom JSON injected field-settings)
      const withGeneric = this.#fieldSettingsHelper.mergeGenericSettings(fieldName, merged);

      // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
      withGeneric.InputType = attr.InputType;
      withGeneric.VisibleDisabled = this.#itemFieldVisibility.isVisibleDisabled(attr.Name);
      const settingsInitial = this.#fieldSettingsHelper.getDefaultSettings(withGeneric);
      const constantFieldParts: FieldConstantsOfLanguage = {
        ...fieldConstants.find(c => c.fieldName === attr.Name),
        settingsInitial,
        inputTypeConfiguration: inputType,
        language: reader.current,
      };

      return lInner.r(constantFieldParts);
    });

    const constPartsWithGroupVisibility = this.#itemFieldVisibility.makeParentGroupsVisible(constPartOfLanguage);

    return l.r(constPartsWithGroupVisibility);
  }

  #constantPartsOfField(entityGuid: string, entityId: number, contentTypeNameId: string): FieldConstants[] {
    const contentType = this.#contentType;
    const l = this.log.fnIf('constantPartsOfField', { entityGuid, entityId, contentTypeNameId });
    // Get the form languages - but we only need default & initial, so we don't have to observe
    const language = this.formConfig.language();
    
    // When merging the "constant" metadata, the primary language must be the initial language, not the current
    // as that contains all the relevant settings which should not be translated
    const mdMerger = new EntityReader(language.initial, language.primary);

    const allPickers = this.#fieldSettingsSvc.pickerData;
    const eavConfig = this.formConfig.config;

    l.a('shared across fields', { entityGuid, entityId, contentTypeNameId, language, allPickers });

    const constFieldParts = contentType.Attributes.map((attr, index) => {
      const fieldName = attr.Name;
      const lInner = this.log.fnIfInList('constantFieldParts', 'fields', fieldName, { fieldName, index });
      // metadata in the initial language with all the core settings - just for initialDisabled!
      const metadata = mdMerger.flatten<FieldSettings>(attr.Metadata);
      const initialSettings = this.#fieldSettingsHelper.getDefaultSettings(metadata);
      const initialDisabled = initialSettings.Disabled ?? false;

      const inputTypeSpecs = this.inputTypeSvc.getSpecs(attr);

      lInner.a('details', { fieldName, contentType, language, attr, initialSettings, inputTypeSpecs });

      const logic = FieldLogicManager.singleton().get(attr.InputType);

      // Construct the constants / unchanging aspects of the field, no matter what language
      const constants: FieldConstants = {
        entityGuid,
        entityId,
        contentTypeNameId,
        fieldName,
        index,
        dropzonePreviewsClass: `dropzone-previews-${eavConfig.formId}-${index}`,
        initialDisabled,
        inputTypeSpecs,
        isLastInGroup: this.#fieldSettingsHelper.isLastInGroup(contentType, attr),
        type: attr.Type,
        logic,
        pickerData: () => allPickers[fieldName] ?? null,
      };

      return lInner.r(constants);
    });
    return l.r(constFieldParts);
  }

}
