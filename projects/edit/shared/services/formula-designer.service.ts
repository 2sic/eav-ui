import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavService, LoggingService } from '.';
import { FieldSettings, FieldValue } from '../../../edit-types';
import { FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { DesignerState, FormulaCacheItem, FormulaFunction, FormulaResult, FormulaTarget, LogSeverities } from '../models';
import { ContentTypeItemService, ContentTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';

@Injectable()
export class FormulaDesignerService implements OnDestroy {
  private formulaCache$: BehaviorSubject<FormulaCacheItem[]>;
  private formulaResults$: BehaviorSubject<FormulaResult[]>;
  private designerState$: BehaviorSubject<DesignerState>;

  constructor(
    private eavService: EavService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeItemService: ContentTypeItemService,
    private loggingService: LoggingService,
    private translate: TranslateService,
  ) { }

  ngOnDestroy(): void {
    this.formulaCache$?.complete();
    this.formulaResults$?.complete();
    this.designerState$?.complete();
  }

  init(): void {
    this.formulaResults$ = new BehaviorSubject([]);
    const initialDesignerState: DesignerState = {
      editMode: false,
      entityGuid: undefined,
      fieldName: undefined,
      isOpen: false,
      target: undefined,
    };
    this.designerState$ = new BehaviorSubject(initialDesignerState);
    const formulaCache = this.buildFormulaCache();
    this.formulaCache$ = new BehaviorSubject(formulaCache);
  }

  getFormula(entityGuid: string, fieldName: string, target: FormulaTarget, allowDraft: boolean): FormulaCacheItem {
    return this.formulaCache$.value.find(
      f =>
        f.entityGuid === entityGuid
        && f.fieldName === fieldName
        && f.target === target
        && (allowDraft ? true : !f.isDraft)
    );
  }

  getFormula$(entityGuid: string, fieldName: string, target: FormulaTarget, allowDraft: boolean): Observable<FormulaCacheItem> {
    const isDraft = allowDraft ? [true, false] : [false];
    return this.formulaCache$.pipe(
      map(formulas => formulas.find(
        f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target && isDraft.includes(f.isDraft))
      ),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  getFormulas(entityGuid?: string, fieldName?: string, target?: FormulaTarget, allowDraft?: boolean): FormulaCacheItem[] {
    return this.formulaCache$.value.filter(
      f =>
        (entityGuid ? f.entityGuid === entityGuid : true)
        && (fieldName ? f.fieldName === fieldName : true)
        && (target ? f.target === target : true)
        && (allowDraft ? true : !f.isDraft)
    );
  }

  getFormulas$(): Observable<FormulaCacheItem[]> {
    return this.formulaCache$.asObservable();
  }

  upsertFormula(entityGuid: string, fieldName: string, target: FormulaTarget, formula: string, save: boolean): void {
    let formulaFunction: FormulaFunction;
    if (save) {
      try {
        formulaFunction = FormulaHelpers.buildFormulaFunction(formula);
      } catch (error) {
        this.upsertFormulaResult(entityGuid, fieldName, target, undefined, true);
        const item = this.itemService.getItem(entityGuid);
        const contentTypeId = InputFieldHelpers.getContentTypeId(item);
        const contentType = this.contentTypeService.getContentType(contentTypeId);
        const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
        const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
        const itemTitle = FieldsSettingsHelpers.getContentTypeTitle(contentType, currentLanguage, defaultLanguage);
        const errorLabel = `Error building formula for Entity: "${itemTitle}", Field: "${fieldName}", Target: "${target}"`;
        this.loggingService.addLog(LogSeverities.Error, errorLabel, error);
        const designerState = this.getDesignerState();
        const isOpenInDesigner = designerState.isOpen
          && designerState.entityGuid === entityGuid
          && designerState.fieldName === fieldName
          && designerState.target === target;
        if (isOpenInDesigner) {
          console.error(errorLabel, error);
        }
      }
    }

    const oldFormulaCache = this.formulaCache$.value;
    const oldFormulaIndex = oldFormulaCache.findIndex(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target);
    const oldFormulaItem = oldFormulaCache[oldFormulaIndex];

    const cache = oldFormulaItem?.cache ?? {};
    const newFormulaItem: FormulaCacheItem = {
      cache,
      entityGuid,
      fieldName,
      fn: formulaFunction?.bind(cache),
      isDraft: save ? formulaFunction == null : true,
      source: formula,
      sourceFromSettings: oldFormulaItem?.sourceFromSettings,
      target,
      version: FormulaHelpers.findFormulaVersion(formula),
    };

    const newCache = oldFormulaIndex >= 0
      ? [...oldFormulaCache.slice(0, oldFormulaIndex), newFormulaItem, ...oldFormulaCache.slice(oldFormulaIndex + 1)]
      : [newFormulaItem, ...oldFormulaCache];
    this.formulaCache$.next(newCache);
  }

  resetFormula(entityGuid: string, fieldName: string, target: FormulaTarget): void {
    const oldResults = this.formulaResults$.value;
    const oldResultIndex = oldResults.findIndex(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.target === target);
    if (oldResultIndex >= 0) {
      const newResults = [...oldResults.slice(0, oldResultIndex), ...oldResults.slice(oldResultIndex + 1)];
      this.formulaResults$.next(newResults);
    }

    const oldFormulaCache = this.formulaCache$.value;
    const oldFormulaIndex = oldFormulaCache.findIndex(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target);
    const oldFormulaItem = oldFormulaCache[oldFormulaIndex];

    if (oldFormulaItem.sourceFromSettings != null) {
      this.upsertFormula(entityGuid, fieldName, target, oldFormulaItem.sourceFromSettings, true);
    } else if (oldFormulaIndex >= 0) {
      const newCache = [...oldFormulaCache.slice(0, oldFormulaIndex), ...oldFormulaCache.slice(oldFormulaIndex + 1)];
      this.formulaCache$.next(newCache);
    }
  }

  upsertFormulaResult(entityGuid: string, fieldName: string, target: FormulaTarget, value: FieldValue, isError: boolean): void {
    const newResult: FormulaResult = {
      entityGuid,
      fieldName,
      target,
      value,
      isError,
    };

    const oldResults = this.formulaResults$.value;
    const oldResultIndex = oldResults.findIndex(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.target === target);
    const newResults = oldResultIndex >= 0
      ? [...oldResults.slice(0, oldResultIndex), newResult, ...oldResults.slice(oldResultIndex + 1)]
      : [newResult, ...oldResults];
    this.formulaResults$.next(newResults);
  }

  getFormulaResult$(entityGuid: string, fieldName: string, target: FormulaTarget): Observable<FormulaResult> {
    return this.formulaResults$.pipe(
      map(results => results.find(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.target === target)),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  setDesignerOpen(isOpen: boolean): void {
    const newState: DesignerState = {
      ...this.getDesignerState(),
      isOpen,
    };
    this.setDesignerState(newState);
  }

  setDesignerState(activeDesigner: DesignerState): void {
    this.designerState$.next(activeDesigner);
  }

  getDesignerState(): DesignerState {
    return this.designerState$.value;
  }

  getDesignerState$(): Observable<DesignerState> {
    return this.designerState$.pipe(
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  private buildFormulaCache(): FormulaCacheItem[] {
    const formulaCache: FormulaCacheItem[] = [];
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    for (const entityGuid of this.eavService.eavConfig.itemGuids) {
      const item = this.itemService.getItem(entityGuid);
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);
      for (const attribute of contentType.Attributes) {
        const settings = FieldsSettingsHelpers.setDefaultFieldSettings(
          FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, defaultLanguage, defaultLanguage)
        );
        const formulaItems = this.contentTypeItemService.getContentTypeItems(settings.Formulas ?? [])
          .filter(formulaItem => {
            const enabled: boolean = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Enabled, null);
            return enabled;
          });
        for (const formulaItem of formulaItems) {
          const formula: string = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Formula, null);
          if (formula == null) { continue; }

          const target: FormulaTarget = LocalizationHelpers
            .translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Target, null);

          let formulaFunction: FormulaFunction;
          try {
            formulaFunction = FormulaHelpers.buildFormulaFunction(formula);
          } catch (error) {
            this.upsertFormulaResult(entityGuid, attribute.Name, target, undefined, true);
            const itemTitle = FieldsSettingsHelpers.getContentTypeTitle(contentType, currentLanguage, defaultLanguage);
            this.loggingService.addLog(LogSeverities.Error, `Error building formula for Entity: "${itemTitle}", Field: "${attribute.Name}", Target: "${target}"`, error);
            this.loggingService.showMessage(this.translate.instant('Errors.FormulaConfiguration'), 2000);
          }

          const formulaCacheItem: FormulaCacheItem = {
            cache: {},
            entityGuid,
            fieldName: attribute.Name,
            fn: formulaFunction,
            isDraft: formulaFunction == null,
            source: formula,
            sourceFromSettings: formula,
            target,
            version: FormulaHelpers.findFormulaVersion(formula),
          };

          formulaCache.push(formulaCacheItem);
        }
      }
    }

    return formulaCache;
  }
}
