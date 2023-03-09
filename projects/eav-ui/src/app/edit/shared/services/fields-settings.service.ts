import { Injectable, OnDestroy } from '@angular/core';
import { consoleLogWebpack } from 'projects/field-custom-gps/src/shared/console-log-webpack.helper';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, Subscription } from 'rxjs';
import { EavService } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { consoleLogAngular } from '../../../shared/helpers/console-log-angular.helper';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../form/shared/field-logic/field-logic-tools';
import { FormulaEngine } from '../../formulas/formula-engine';
import { FieldValuePair } from '../../formulas/models/FormulaResultRaw';
// tslint:disable-next-line:max-line-length
import { EntityReader, FieldsSettingsHelpers, GeneralHelpers, InputFieldHelpers, ValidationHelpers } from '../helpers';
// tslint:disable-next-line:max-line-length
import { ContentTypeSettings, FieldsProps, FormValues, TranslationState } from '../models';
import { EavContentType } from '../models/eav';
// tslint:disable-next-line:max-line-length
import { ContentTypeService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';
import { FormsStateService } from './forms-state.service';

@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$ = new BehaviorSubject<ContentTypeSettings>(null);
  private fieldsProps$ = new BehaviorSubject<FieldsProps>(null);
  private forceRefreshSettings$ = new BehaviorSubject<void>(null);
  private subscription: Subscription;
  private valueFormulaCounter = 0;
  private maxValueFormulaCycles = 5;
  public updateValueQueue: Record<string, { possibleValueUpdates: FormValues, possibleAdditionalValueUpdates: FieldValuePair[] }> = {};
  private fieldsProps: FieldsProps = {};

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private globalConfigService: GlobalConfigService,
    private formsStateService: FormsStateService,
    private formulaEngine: FormulaEngine,
  ) {
    formulaEngine.init(this, this.contentTypeSettings$);
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
    const entityId = item.Entity.Id;
    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
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

    const itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);
    const inputTypes$ = this.inputTypeService.getInputTypes$();
    const readOnly$ = this.formsStateService.readOnly$;
    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();

    const constantFieldParts$ = combineLatest([inputTypes$, contentType$, entityReader$]).pipe(
      map(([inputTypes, contentType, entityReader]) => {
        return contentType.Attributes.map((attribute, index) => {
          const initialSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
            // TODO: unclear why we're not using the current language but the default
            new EntityReader(this.eavService.eavConfig.lang, entityReader.defaultLanguage).flattenAll<FieldSettings>(attribute.Metadata)
            // FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage),
          );
          const initialDisabled = initialSettings.Disabled ?? false;
          const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
          const inputType = inputTypes.find(i => i.Type === attribute.InputType);

          const mergeRaw = entityReader.flattenAll<FieldSettings>(attribute.Metadata);
          // Sometimes the metadata doesn't have the input type (empty string), so we'll add the attribute.InputType just in case...
          mergeRaw.InputType = attribute.InputType;
          const merged = FieldsSettingsHelpers.setDefaultFieldSettings(mergeRaw);
          consoleLogAngular('merged', JSON.parse(JSON.stringify(merged)));

          const logic = FieldLogicManager.singleton().get(attribute.InputType);

          return ({
            logic,
            merged,
            inputType,
            calculatedInputType,
            constants: {
              angularAssets: inputType?.AngularAssets,
              contentTypeId,
              dropzonePreviewsClass: `dropzone-previews-${this.eavService.eavConfig.formId}-${index}`,
              entityGuid,
              entityId,
              fieldName: attribute.Name,
              index,
              initialDisabled,
              inputType: calculatedInputType.inputType,
              isExternal: calculatedInputType.isExternal,
              isLastInGroup: FieldsSettingsHelpers.findIsLastInGroup(contentType, attribute),
              type: attribute.Type,
            }
          });
        });
      }));

    this.subscription.add(
      combineLatest([
        contentType$, itemAttributes$, itemHeader$, entityReader$,
        readOnly$, this.forceRefreshSettings$, debugEnabled$, constantFieldParts$
      ]).pipe(
        map(([
          contentType, itemAttributes, itemHeader, entityReader,
          readOnly, _, debugEnabled, constantFieldParts
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
            formValues[fieldName] = entityReader.getBestValue(fieldValues, null);
          }

          const fieldsProps: FieldsProps = {};
          const possibleValueUpdates: FormValues = {};
          const possibleAdditionalValueUpdates: FieldValuePair[] = [];
          const logicTools: FieldLogicTools = {
            eavConfig: this.eavService.eavConfig,
            entityReader,
            debug: debugEnabled,
          };
          const slotIsEmpty = itemHeader.IsEmptyAllowed && itemHeader.IsEmpty;

          const areValuesFromPromiseUpdated = this.formulaEngine.updateValuesFromQueue(
            entityGuid, this.updateValueQueue, contentType, formValues, this.fieldsProps, slotIsEmpty, entityReader);
          // we only updated values from promise (queue), don't trigger property regular updates
          // NOTE: if any value changes then the entire cycle will automatically retrigger
          if (areValuesFromPromiseUpdated) return null;

          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default and empty-message have no value
            const valueBefore = formValues[attribute.Name];

            const constantFieldPart = constantFieldParts.find(f => f.constants.fieldName === attribute.Name);

            // run formulas
            const formulaResult = this.formulaEngine.runFormulas(
              entityGuid, entityId, attribute.Name, formValues,
              constantFieldPart.inputType, constantFieldPart.merged, itemHeader
            );

            // ensure new settings match requirements
            const newSettings = formulaResult.settings;
            newSettings.Name = newSettings.Name || attribute.Name;
            newSettings.Required = ValidationHelpers.isRequired(newSettings);
            const disableTranslation = FieldsSettingsHelpers.findDisableTranslation(
              contentType.Metadata, constantFieldPart.inputType, attributeValues, entityReader.defaultLanguage, attribute.Metadata,
            );
            newSettings.DisableTranslation = slotIsEmpty || disableTranslation;
            newSettings._disabledBecauseOfTranslation = FieldsSettingsHelpers.getDisabledBecauseTranslations(
              attributeValues, newSettings.DisableTranslation, entityReader.currentLanguage, entityReader.defaultLanguage,
            );
            newSettings.Disabled = newSettings.Disabled || slotIsEmpty || newSettings._disabledBecauseOfTranslation || readOnly.isReadOnly;
            newSettings.DisableAutoTranslation = newSettings.DisableAutoTranslation || newSettings.DisableTranslation;

            // update settings with respective FieldLogics
            const fixed = constantFieldPart.logic?.update(newSettings, valueBefore, logicTools) ?? newSettings;
            consoleLogAngular('newSettings', JSON.parse(JSON.stringify(newSettings)));

            possibleValueUpdates[attribute.Name] = formulaResult.value;
            if (formulaResult.additionalValues)
              possibleAdditionalValueUpdates.push(...formulaResult.additionalValues);

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
            };
          }
          this.fieldsProps = fieldsProps;

          const changesWereApplied = this.applyValueChangesFromFormulas(
            entityGuid, contentType, formValues, fieldsProps,
            possibleValueUpdates, possibleAdditionalValueUpdates,
            slotIsEmpty, entityReader);
          // if changes were applied do not trigger field property updates
          if (changesWereApplied) return null;
          // if no changes were applied then we trigger field property updates and reset the loop counter
          this.valueFormulaCounter = 0;
          return fieldsProps;
        }),
        filter(fieldsProps => !!fieldsProps),
      ).subscribe(fieldsProps => {
        this.fieldsProps$.next(fieldsProps);
      })
    );
  }

  getContentTypeSettings(): ContentTypeSettings {
    return this.contentTypeSettings$.value;
  }

  getContentTypeSettings$(): Observable<ContentTypeSettings> {
    return this.contentTypeSettings$.asObservable();
  }

  getFieldsProps(): FieldsProps {
    return this.fieldsProps$.value;
  }

  getFieldsProps$(): Observable<FieldsProps> {
    return this.fieldsProps$.asObservable();
  }

  getFieldSettings(fieldName: string): FieldSettings {
    return this.fieldsProps$.value[fieldName].settings;
  }

  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  forceSettings(): void {
    this.forceRefreshSettings$.next();
  }


  applyValueChangesFromFormulas(
    entityGuid: string,
    contentType: EavContentType,
    formValues: FormValues,
    fieldsProps: FieldsProps,
    possibleValueUpdates: FormValues,
    possibleAdditionalValueUpdates: FieldValuePair[],
    slotIsEmpty: boolean,
    entityReader: EntityReader): boolean {
    const valueUpdates: FormValues = {};
    for (const attribute of contentType.Attributes) {
      const possibleAdditionalValueUpdatesForAttribute = possibleAdditionalValueUpdates.filter(f => f.field === attribute.Name);
      const valueBefore = formValues[attribute.Name];
      const valueFromFormula = possibleValueUpdates[attribute.Name];
      const additionalValueFromFormula =
        possibleAdditionalValueUpdatesForAttribute[possibleAdditionalValueUpdatesForAttribute.length - 1]?.value;
      const newValue = additionalValueFromFormula ? additionalValueFromFormula : valueFromFormula;
      if (this.shouldUpdate(valueBefore, newValue, slotIsEmpty, fieldsProps[attribute.Name]?.settings._disabledBecauseOfTranslation)) {
        valueUpdates[attribute.Name] = newValue;
      }
    }

    if (Object.keys(valueUpdates).length > 0) {
      if (this.maxValueFormulaCycles > this.valueFormulaCounter) {
        this.valueFormulaCounter++;
        this.itemService.updateItemAttributesValues(
          entityGuid, valueUpdates, entityReader.currentLanguage, entityReader.defaultLanguage
        );
        // return true to make sure fieldProps are not updated yet
        return true;
      } else {
        // consoleLogWebpack('Max value formula cycles reached');
        return false;
      }
    }
    return false;
  }

  private shouldUpdate(
    valueBefore: FieldValue, valueFromFormula: FieldValue,
    slotIsEmpty: boolean, disabledBecauseTranslations: boolean
  ): boolean {
    // important to compare with undefined because null is allowed value
    if (slotIsEmpty || disabledBecauseTranslations || valueBefore === undefined || valueFromFormula === undefined)
      return false;

    let valuesNotEqual = valueBefore !== valueFromFormula;
    // do a more in depth comparison in case of calculated entity fields
    if (valuesNotEqual && Array.isArray(valueBefore) && Array.isArray(valueFromFormula)) {
      valuesNotEqual = !GeneralHelpers.arraysEqual(valueBefore as string[], valueFromFormula as string[]);
    }
    return valuesNotEqual;
  }
}
