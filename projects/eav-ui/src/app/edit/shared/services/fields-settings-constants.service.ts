import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { FormConfigService } from '.';
import { FieldSettings } from '../../../../../../edit-types';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { EntityReader, FieldsSettingsHelpers } from '../helpers';
import { FieldConstants, FieldConstantsOfLanguage } from '../models';
import { InputTypeService } from '../store/ngrx-data';
import { ItemFieldVisibility } from './item-field-visibility';
import { EavContentType, EavItem } from '../models/eav';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FormLanguageComplete } from '../models/form-languages.model';

const logThis = false;
const nameOfThis = 'FieldsSettingsConstantsService';

/**
 * Each instance is responsible for a single entity.
 */
@Injectable()
export class FieldsSettingsConstantsService {
  private item: EavItem;
  private itemFieldVisibility: ItemFieldVisibility;
  private entityReader$: Observable<EntityReader>;
  private language$: Observable<FormLanguageComplete>;
  private contentType: EavContentType;

  log = new EavLogger(nameOfThis, logThis);

  constructor(
    private formConfig: FormConfigService,
    private inputTypeService: InputTypeService,
  ) {
  }

  init(
    item: EavItem,
    entityReader$: Observable<EntityReader>,
    language$: Observable<FormLanguageComplete>,
    contentType: EavContentType,
  ): this {
    this.item = item;
    this.itemFieldVisibility = new ItemFieldVisibility(item.Header);
    this.entityReader$ = entityReader$;
    this.language$ = language$;
    this.contentType = contentType;
    return this;
  }

  getUnchangingDataOfLanguage$() {
    const entityGuid = this.item.Entity.Guid;
    const entityId = this.item.Entity.Id;
    const contentTypeNameId = this.contentType.Id;
    const unchangingPartsAllLanguages = this.getConstantFieldParts(entityGuid, entityId, contentTypeNameId);
    return this.getConstantFieldPartsOfLanguage$(unchangingPartsAllLanguages);
  }

  private getConstantFieldPartsOfLanguage$(
    fieldConstants: FieldConstants[],
  ): Observable<FieldConstantsOfLanguage[]> {
    const contentType = this.contentType;
    const constFieldPartsOfLanguage$ = combineLatest([
      this.entityReader$,
      this.language$,
    ]).pipe(
      map(([entityReader, language]) => {
        const l = this.log.fn('constantFieldPartsLanguage(map)', { contentType, entityReader, language });

        const constPartOfLanguage = contentType.Attributes.map((ctAttrib) => {
          // Input Type config in the current language
          const inputType = this.inputTypeService.getInputType(ctAttrib.InputType);

          // Construct the constants with settings and everything
          // using the EntityReader with the current language
          const mergeRaw = entityReader.flattenAll<FieldSettings>(ctAttrib.Metadata);

          // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
          mergeRaw.InputType = ctAttrib.InputType;
          mergeRaw.VisibleDisabled = this.itemFieldVisibility.isVisibleDisabled(ctAttrib.Name);
          const settingsInitial = FieldsSettingsHelpers.setDefaultFieldSettings(mergeRaw);
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
      })
    );
    return constFieldPartsOfLanguage$;
  }

  private getConstantFieldParts(entityGuid: string, entityId: number, contentTypeNameId: string): FieldConstants[] {
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
      const initialSettings = FieldsSettingsHelpers.setDefaultFieldSettings(metadata);

      const calculatedInputType = this.inputTypeService.calculateInputType(attribute);
      const inputType = this.inputTypeService.getInputType(attribute.InputType);

      this.log.a('details', { contentType, language });

      const logic = FieldLogicManager.singleton().get(attribute.InputType);

      const eavConfig = this.formConfig.config;

      // Construct the constants / unchanging aspects of the field, no matter what language
      const constants: FieldConstants = {
        entityGuid,
        entityId,
        contentTypeNameId,
        fieldName: attribute.Name,
        index,
        angularAssets: inputType?.AngularAssets,
        dropzonePreviewsClass: `dropzone-previews-${eavConfig.formId}-${index}`,
        initialDisabled: initialSettings.Disabled ?? false,
        inputCalc: calculatedInputType,
        inputTypeStrict: calculatedInputType.inputType,
        isExternal: calculatedInputType.isExternal,
        isLastInGroup: FieldsSettingsHelpers.findIsLastInGroup(contentType, attribute),
        type: attribute.Type,
        logic,
      };

      return constants;
    });
    return l.r(constFieldParts);
  }

}
