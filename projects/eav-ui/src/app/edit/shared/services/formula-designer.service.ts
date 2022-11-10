import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { EavService, LoggingService } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { EavWindow } from '../../../shared/models/eav-window.model';
import { FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { DesignerState, FormulaCacheItem, FormulaFunction, FormulaResult, FormulaTarget, FormulaV1CtxTargetEntity, LogSeverities } from '../models';
import { EavItem } from '../models/eav/eav-item';
import { FormulaCacheItemShared, FormulaV1CtxUser } from '../models/formula.models';
import { ContentTypeItemService, ContentTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';

declare const window: EavWindow;
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

  upsertFormula(entityGuid: string, fieldName: string, target: FormulaTarget, formula: string, run: boolean): void {
    let formulaFunction: FormulaFunction;
    if (run) {
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

    // Get shared calculated properties, which we need in case the old-formula doesn't have them yet
    const shared = this.buildItemFormulaCacheSharedParts(null, entityGuid);

    const newFormulaItem: FormulaCacheItem = {
      cache: oldFormulaItem?.cache ?? {},
      entityGuid,
      fieldName,
      fn: formulaFunction?.bind({}),
      isDraft: run ? formulaFunction == null : true,
      source: formula,
      sourceFromSettings: oldFormulaItem?.sourceFromSettings,
      sourceGuid: oldFormulaItem?.sourceGuid,
      sourceId: oldFormulaItem?.sourceId,
      target,
      version: FormulaHelpers.findFormulaVersion(formula),
      targetEntity: oldFormulaItem?.targetEntity ?? shared.targetEntity, // new 14.07.05
      user: oldFormulaItem?.user ?? shared.user, // new 14.07.05
      app: oldFormulaItem?.app ?? shared.app,    // new in v14.07.05
      sxc: oldFormulaItem?.sxc ?? shared.sxc,    // new in 14.11
    };

    const newCache = oldFormulaIndex >= 0
      ? [...oldFormulaCache.slice(0, oldFormulaIndex), newFormulaItem, ...oldFormulaCache.slice(oldFormulaIndex + 1)]
      : [newFormulaItem, ...oldFormulaCache];
    this.formulaCache$.next(newCache);
  }

  updateSaved(entityGuid: string, fieldName: string, target: FormulaTarget, formula: string, sourceGuid: string, sourceId: number): void {
    const oldFormulaCache = this.formulaCache$.value;
    const oldFormulaIndex = oldFormulaCache.findIndex(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target);
    const oldFormulaItem = oldFormulaCache[oldFormulaIndex];
    if (oldFormulaItem == null) { return; }

    const newFormulaItem: FormulaCacheItem = {
      ...oldFormulaItem,
      sourceFromSettings: formula,
      sourceGuid,
      sourceId,
    };

    const newCache = [...oldFormulaCache.slice(0, oldFormulaIndex), newFormulaItem, ...oldFormulaCache.slice(oldFormulaIndex + 1)];
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

    if (oldFormulaItem?.sourceFromSettings != null) {
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
    return this.designerState$.pipe(distinctUntilChanged(GeneralHelpers.objectsEqual));
  }

  private buildItemFormulaCacheSharedParts(item: EavItem, entityGuid: string): FormulaCacheItemShared {
    item = item ?? this.itemService.getItem(entityGuid);
    const targetEntity: FormulaV1CtxTargetEntity = {
      guid: item.Entity.Guid,
      id: item.Entity.Id,
      type: {
        guid: item.Entity.Type.Id,
        name: item.Entity.Type.Name,
        // id: -999,
      }
    };
    const eavService = this.eavService;
    const user = eavService.eavConfig.dialogContext.User;
    const eavConfig = eavService.eavConfig;
    return {
      targetEntity,
      user: {
        email: user?.Email,
        guid: user?.Guid,
        id: user?.Id,
        isAnonymous: user?.IsAnonymous,
        isSiteAdmin: user?.IsSiteAdmin,
        isContentAdmin: user?.IsContentAdmin,
        isSystemAdmin: user?.IsSystemAdmin,
        name: user?.Name,
        username: user?.Username,
      } as FormulaV1CtxUser,
      app: {
        appId: parseInt(eavConfig.appId, 10),
        zoneId: parseInt(eavConfig.zoneId, 10),
        isGlobal: eavConfig.dialogContext.App.IsGlobalApp,
        isSite: eavConfig.dialogContext.App.IsSiteApp,
        isContent: eavConfig.dialogContext.App.IsContentApp,
      },
      sxc: window.$2sxc({
        zoneId: eavConfig.zoneId,
        appId: eavConfig.appId,
        pageId: eavConfig.tabId,
        moduleId: eavConfig.moduleId,
        _noContextInHttpHeaders: true,  // disable pageid etc. headers in http headers, because it would make debugging very hard
        _autoAppIdsInUrl: true,         // auto-add appid and zoneid to url so formula developer can see what's happening
      } as any),
    };
  }

  private buildFormulaCache(): FormulaCacheItem[] {
    const formulaCache: FormulaCacheItem[] = [];
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    for (const entityGuid of this.eavService.eavConfig.itemGuids) {
      const item = this.itemService.getItem(entityGuid);

      const sharedParts = this.buildItemFormulaCacheSharedParts(item, entityGuid);

      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);
      for (const attribute of contentType.Attributes) {
        const settings = FieldsSettingsHelpers.setDefaultFieldSettings(
          FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, defaultLanguage, defaultLanguage),
        );
        const formulaItems = this.contentTypeItemService.getContentTypeItems(settings.Formulas).filter(formulaItem => {
          const enabled: boolean = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Enabled, null);
          return enabled;
        });
        for (const formulaItem of formulaItems) {
          const formula: string = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Formula, null);
          if (formula == null) { continue; }

          const target: FormulaTarget = LocalizationHelpers.translate(
            currentLanguage, defaultLanguage, formulaItem.Attributes.Target, null
          );

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
            fn: formulaFunction?.bind({}),
            isDraft: formulaFunction == null,
            source: formula,
            sourceFromSettings: formula,
            sourceGuid: formulaItem.Guid,
            sourceId: formulaItem.Id,
            target,
            version: FormulaHelpers.findFormulaVersion(formula),
            targetEntity: sharedParts.targetEntity, // new v14.07.05
            user: sharedParts.user,   // new in v14.07.05
            app: sharedParts.app,   // new in v14.07.05
            sxc: sharedParts.sxc,   // put in shared in 14.11
          };

          formulaCache.push(formulaCacheItem);
        }
      }
    }

    return formulaCache;
  }
}
