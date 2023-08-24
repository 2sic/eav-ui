import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, Subscription } from 'rxjs';
import { EavService } from '.';
import { FieldSettings } from '../../../../../../edit-types';
import { consoleLogAngular } from '../../../shared/helpers/console-log-angular.helper';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../form/shared/field-logic/field-logic-tools';
import { FormulaEngine } from '../../formulas/formula-engine';
// tslint:disable-next-line:max-line-length
import { EntityReader, FieldsSettingsHelpers, GeneralHelpers, InputFieldHelpers } from '../helpers';
// tslint:disable-next-line:max-line-length
import { ContentTypeSettings, FieldConstants, FieldsProps, FormValues, TranslationState } from '../models';
// tslint:disable-next-line:max-line-length
import { ContentTypeService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';
import { FormsStateService } from './forms-state.service';
import { ConstantFieldParts } from '../../formulas/models/constant-field-parts.model';
import { FormulaPromiseResult } from '../../formulas/models/formula-promise-result.model';
import { FieldValuePair } from '../../formulas/models/formula-results.models';
import { FormItemFormulaService } from '../../formulas/form-item-formula.service';
import { FormulaPromiseHandler } from '../../formulas/formula-promise-handler';
import { ItemFieldVisibility } from './item-field-visibility';
import { EmptyFieldHelpers } from '../../form/fields/empty/empty-field-helpers';


/**
 * FieldsSettingsService is responsible for handling the settings, values and validations of fields.
 */
@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$ = new BehaviorSubject<ContentTypeSettings>(null);
  private fieldsProps$ = new BehaviorSubject<FieldsProps>(null);
  private forceRefreshSettings$ = new BehaviorSubject<void>(null);
  private subscription: Subscription;
  public updateValueQueue: Record<string, FormulaPromiseResult> = {};
  private latestFieldProps: FieldsProps = {};
  private itemFieldVisibility: ItemFieldVisibility;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private globalConfigService: GlobalConfigService,
    private formsStateService: FormsStateService,
    private formulaEngine: FormulaEngine,
    private formItemFormulaService: FormItemFormulaService,
    private formulaPromiseHandler: FormulaPromiseHandler,
  ) {
    formulaPromiseHandler.init(this);
    formItemFormulaService.init(this.itemService);
    formulaEngine.init(this, this.formulaPromiseHandler, this.contentTypeSettings$);
  }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.forceRefreshSettings$?.complete();
    this.subscription?.unsubscribe();
  }

  init(entityGuid: string): void {
    this.subscription = new Subscription();

    const item = this.itemService.getItem(entityGuid);
    this.itemFieldVisibility = new ItemFieldVisibility(item.Header);
    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    // todo: @STV unsure why we have a stream for the header, isn't it the same as item.Header?
    // pls find out and either clarify or fix
    const itemHeader$ = this.itemService.getItemHeader$(entityGuid);
    const entityReader$ = this.languageInstanceService.getEntityReader$(this.eavService.eavConfig.formId);

    this.subscription.add(
      combineLatest([contentType$, itemHeader$, entityReader$]).pipe(
        map(([contentType, itemHeader, entityReader]) => {
          const ctSettings = FieldsSettingsHelpers.setDefaultContentTypeSettings(
            entityReader.flattenAll<ContentTypeSettings>(contentType.Metadata),
            contentType,
            entityReader.currentLanguage,
            entityReader.defaultLanguage,
            itemHeader,
          );
          return ctSettings;
        }),
      ).subscribe(ctSettings => {
        this.contentTypeSettings$.next(ctSettings);
      })
    );

    const inputTypes$ = this.inputTypeService.getInputTypes$();
    const entityId = item.Entity.Id;

    const eavConfig = this.eavService.eavConfig;
    const constantFieldParts$ = combineLatest([inputTypes$, contentType$, entityReader$]).pipe(
      map(([inputTypes, contentType, entityReader]) => {
        // When merging metadata, the primary language must be the real primary, not the current
        const mdMerger = new EntityReader(eavConfig.lang, entityReader.defaultLanguage);

        const allConstFieldParts = contentType.Attributes.map((attribute, index) => {
          const initialSettings = FieldsSettingsHelpers.setDefaultFieldSettings(mdMerger.flattenAll<FieldSettings>(attribute.Metadata));
          const initialDisabled = initialSettings.Disabled ?? false;
          const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
          const inputType = inputTypes.find(i => i.Type === attribute.InputType);

          // Construct the constants / unchanging aspects of the field
          const constants: FieldConstants = {
            angularAssets: inputType?.AngularAssets,
            contentTypeId,
            dropzonePreviewsClass: `dropzone-previews-${eavConfig.formId}-${index}`,
            entityGuid,
            entityId,
            fieldName: attribute.Name,
            index,
            initialDisabled,
            inputType: calculatedInputType.inputType,
            isExternal: calculatedInputType.isExternal,
            isLastInGroup: FieldsSettingsHelpers.findIsLastInGroup(contentType, attribute),
            type: attribute.Type,
          };

          // Construct the constants with settings and everything
          // TODO: unclear why we're doing this again (see `initialSettings`) - with different languages in the flattening
          const mergeRaw = entityReader.flattenAll<FieldSettings>(attribute.Metadata);
          // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
          mergeRaw.InputType = attribute.InputType;
          mergeRaw.VisibleDisabled = this.itemFieldVisibility.isVisibleDisabled(attribute.Name);
          const settingsInitial = FieldsSettingsHelpers.setDefaultFieldSettings(mergeRaw);
          consoleLogAngular('merged', JSON.parse(JSON.stringify(settingsInitial)));
          const logic = FieldLogicManager.singleton().get(attribute.InputType);
          const constantFieldParts: ConstantFieldParts = {
            logic,
            settingsInitial,
            inputType,
            calculatedInputType,
            constants,
            currentLanguage: entityReader.currentLanguage,
          };

          return constantFieldParts;
        });

        // Make sure that groups, which have a forced-visible-field are also visible
        try { // ATM in try-catch, to ensure we don't break anything
          if (this.itemFieldVisibility.hasRules())
            allConstFieldParts.forEach((groupField, index) => {
              // Only work on group-starts
              if (!EmptyFieldHelpers.isGroupStart(groupField.calculatedInputType)) return;
              // Ignore if visible-disabled is already ok
              if (groupField.settingsInitial.VisibleDisabled == false) return;
              // Check if any of the following fields is forced visible - before another group-start/end
              for (let i = index + 1; i < allConstFieldParts.length; i++) {
                const innerField = allConstFieldParts[i];
                // Stop checking the current group if we found another group start/end
                if (EmptyFieldHelpers.isGroup(innerField.calculatedInputType)) return;
                if (innerField.settingsInitial.VisibleDisabled == false) {
                  consoleLogAngular('Forced visible', groupField.constants.fieldName, 'because of', innerField.constants.fieldName)
                  groupField.settingsInitial.VisibleDisabled = false;
                  return;
                }
              }
            });
        } catch (e) {
          console.error('Error trying to set item field visibility', e);
        }

        return allConstFieldParts;
      })
    );

    const itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);
    const formReadOnly$ = this.formsStateService.readOnly$;
    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();

    this.subscription.add(
      combineLatest([
        contentType$, itemAttributes$, itemHeader$, entityReader$,
        formReadOnly$, this.forceRefreshSettings$, debugEnabled$, constantFieldParts$
      ]).pipe(
        map(([
          contentType, itemAttributes, itemHeader, entityReader,
          formReadOnly, _, debugEnabled, constantFieldParts
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
            formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
          }

          const slotIsEmpty = itemHeader.IsEmptyAllowed && itemHeader.IsEmpty;
          const logicTools: FieldLogicTools = {
            eavConfig: this.eavService.eavConfig,
            entityReader,
            debug: debugEnabled,
          };

          if (Object.keys(this.latestFieldProps).length) {
            const status = this.formulaPromiseHandler.updateValuesFromQueue(
              entityGuid, this.updateValueQueue, contentType, formValues, this.latestFieldProps, slotIsEmpty, entityReader,
              this.latestFieldProps, contentType.Attributes, contentType.Metadata, constantFieldParts,
              itemAttributes, formReadOnly.isReadOnly, logicTools, this.formItemFormulaService);
            // we only updated values from promise (queue), don't trigger property regular updates
            // NOTE: if any value changes then the entire cycle will automatically retrigger
            if (status.newFieldProps)
              this.latestFieldProps = status.newFieldProps;
            if (status.valuesUpdated) return null;
          }

          const fieldsProps: FieldsProps = {};
          const possibleValueUpdates: FormValues = {};
          const possibleFieldsUpdates: FieldValuePair[] = [];

          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default and empty-message have no value
            const valueBefore = formValues[attribute.Name];

            const constantFieldPart = constantFieldParts.find(f => f.constants.fieldName === attribute.Name);

            // if the currentLanguage changed then we need to flush the settings with initial ones that have updated language
            let latestSettings: FieldSettings;
            if (constantFieldPart.currentLanguage == this.latestFieldProps[attribute.Name]?.currentLanguage) {
              latestSettings = this.latestFieldProps[attribute.Name]?.settings
                ?? { ...constantFieldPart.settingsInitial };
            } else {
              latestSettings = { ...constantFieldPart.settingsInitial };
            }

            // run formulas
            const formulaResult = this.formulaEngine.runAllFormulas(
              entityGuid, entityId, attribute, formValues,
              constantFieldPart.inputType, constantFieldPart.logic, constantFieldPart.settingsInitial, latestSettings,
              itemHeader, contentType.Metadata, attributeValues, entityReader, slotIsEmpty,
              formReadOnly.isReadOnly, valueBefore, logicTools
            );

            const fixed = formulaResult.settings;

            possibleValueUpdates[attribute.Name] = formulaResult.value;
            if (formulaResult.fields)
              possibleFieldsUpdates.push(...formulaResult.fields);

            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(
              attributeValues, fixed.DisableTranslation, entityReader.currentLanguage, entityReader.defaultLanguage,
            );
            const wrappers = InputFieldHelpers.getWrappers(fixed, constantFieldPart.calculatedInputType);

            fieldsProps[attribute.Name] = {
              calculatedInputType: constantFieldPart.calculatedInputType,
              constants: constantFieldPart.constants,
              settings: fixed,
              translationState: fieldTranslation,
              value: valueBefore,
              wrappers,
              formulaValidation: formulaResult.validation,
              currentLanguage: constantFieldPart.currentLanguage,
            };
          }
          this.latestFieldProps = fieldsProps;

          const changesWereApplied = this.formItemFormulaService.applyValueChangesFromFormulas(
            entityGuid, contentType, formValues, fieldsProps,
            possibleValueUpdates, possibleFieldsUpdates,
            slotIsEmpty, entityReader);
          // if changes were applied do not trigger field property updates
          if (changesWereApplied) return null;
          // if no changes were applied then we trigger field property updates and reset the loop counter
          this.formItemFormulaService.valueFormulaCounter = 0;
          return fieldsProps;
        }),
        filter(fieldsProps => !!fieldsProps),
      ).subscribe(fieldsProps => {
        consoleLogAngular('fieldsProps', JSON.parse(JSON.stringify(fieldsProps)));
        this.fieldsProps$.next(fieldsProps);
      })
    );
  }

  /**
   * Used to get content type settings.
   * @returns Content type settings
   */
  getContentTypeSettings(): ContentTypeSettings {
    return this.contentTypeSettings$.value;
  }

  /**
   * Used to get content type settings stream.
   * @returns Stream of content type settings
   */
  getContentTypeSettings$(): Observable<ContentTypeSettings> {
    return this.contentTypeSettings$.asObservable();
  }

  /**
   * Used to get field properties for all fields.
   * @returns Object that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps(): FieldsProps {
    return this.fieldsProps$.value;
  }

  /**
   * Used to get field properties stream for all fields.
   * @returns Stream of objects that has attribute name as a key and all of its field properties as a value
   */
  getFieldsProps$(): Observable<FieldsProps> {
    return this.fieldsProps$.asObservable();
  }

  /**
   * Used for getting field settings for a specific field.
   * @param fieldName 
   * @returns Field settings
   */
  getFieldSettings(fieldName: string): FieldSettings {
    return this.fieldsProps$.value[fieldName].settings;
  }

  /**
   * Used for getting field settings stream for a specific field.
   * @param fieldName 
   * @returns Field settings stream
   */
  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  /**
   * Used for translation state stream for a specific field.
   * @param fieldName 
   * @returns Translation state stream
   */
  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  /**
   * Triggers a reevaluation of all formulas.
   */
  retriggerFormulas(): void {
    this.forceRefreshSettings$.next();
  }
}
