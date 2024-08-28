import { Injectable, OnDestroy, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, filter, from, switchMap } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../edit-types';
import { EntityReader, FieldsSettingsHelpers, ContentTypeSettingsHelpers } from '../shared/helpers';
import { EavItem } from '../shared/models/eav/eav-item';
import { FormulaHelpers } from './helpers/formula.helpers';
// tslint:disable-next-line: max-line-length
import { FormulaCacheItem, FormulaCacheItemShared, FormulaFunction, FormulaTarget, FormulaV1CtxTargetEntity, FormulaV1CtxUser } from './models/formula.models';
import { FormulaResult, DesignerState, FormulaResultRaw, FormulaIdentifier } from './models/formula-results.models';
import { ServiceBase } from '../../shared/services/service-base';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FormulaDesignerService } from './formula-designer.service';
import { LocalizationHelpers } from '../localization/localization.helpers';
import { FormConfigService } from '../state/form-config.service';
import { ItemHelper } from '../shared/helpers/item.helper';
import { LoggingService, LogSeverities } from '../shared/services/logging.service';
import { ItemService } from '../shared/store/item.service';
import { ContentTypeService } from '../shared/store/content-type.service';
import { ContentTypeItemService } from '../shared/store/content-type-item.service';

const logThis = false;
const nameOfThis = 'FormulaCacheService';

/**
 * Service just to cache formulas for execution and use in the designer.
 */
@Injectable()
export class FormulaCacheService extends ServiceBase implements OnDestroy {

  /** All the formulas with various additional info to enable execution and editing */
  formulas = signal<FormulaCacheItem[]>([]);

  /** All the formula results */
  results = signal<FormulaResult[]>([]);

  /** Parent service for call backs */
  private designerSvc: FormulaDesignerService;

  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private loggingService: LoggingService,
    private translate: TranslateService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  init(designerSvc: FormulaDesignerService) {
    this.designerSvc = designerSvc;
    const formulaCache = this.buildFormulaCache();
    this.formulas.set(formulaCache);
  }

  ngOnDestroy() {
    super.destroy();
  }

  /**
   * Used for building formula cache.
   * @returns
   */
  private buildFormulaCache(): FormulaCacheItem[] {
    const formulaCache: FormulaCacheItem[] = [];
    const language = this.formConfig.language();
    const entityReader = new EntityReader(language.current, language.primary);

    for (const entityGuid of this.formConfig.config.itemGuids) {
      const item = this.itemService.get(entityGuid);

      const sharedParts = this.buildItemFormulaCacheSharedParts(item, entityGuid);

      const contentType = this.contentTypeService.getContentTypeOfItem(item);
      for (const attribute of contentType.Attributes) {
        const settings = FieldsSettingsHelpers.getDefaultFieldSettings(
          entityReader.flattenAll<FieldSettings>(attribute.Metadata),
        );
        const formulaItems = this.contentTypeItemService.getMany(settings.Formulas).filter(formulaItem => {
          const enabled: boolean = LocalizationHelpers.translate<boolean>(language, formulaItem.Attributes.Enabled, null);
          return enabled;
        });
        for (const formulaItem of formulaItems) {
          const formula: string = LocalizationHelpers.translate<string>(language, formulaItem.Attributes.Formula, null);
          if (formula == null) 
            continue;

          const target: FormulaTarget = LocalizationHelpers.translate<string>(language, formulaItem.Attributes.Target, null);

          let formulaFunction: FormulaFunction;
          try {
            formulaFunction = FormulaHelpers.buildFormulaFunction(formula);
          } catch (error) {
            this.cacheResults({ entityGuid, fieldName: attribute.Name, target } satisfies FormulaIdentifier, undefined, true, false);
            const itemTitle = ContentTypeSettingsHelpers.getContentTypeTitle(contentType, language);
            this.loggingService.addLog(LogSeverities.Error, `Error building formula for Entity: "${itemTitle}", Field: "${attribute.Name}", Target: "${target}"`, error);
            this.loggingService.showMessage(this.translate.instant('Errors.FormulaConfiguration'), 2000);
          }

          const streams = this.createPromisedParts();

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
            stopFormula: false,
            promises$: streams.promises$,
            updateCallback$: streams.callback$,
          };

          formulaCache.push(formulaCacheItem);
        }
      }
    }

    return formulaCache;
  }



  /**
   * Used for building shared parts of formula cache item.
   * @param item
   * @param entityGuid
   * @returns
   */
  buildItemFormulaCacheSharedParts(item: EavItem, entityGuid: string): FormulaCacheItemShared {
    item = item ?? this.itemService.get(entityGuid);
    const entity = item.Entity;
    const mdFor = entity.For;
    const targetEntity: FormulaV1CtxTargetEntity = {
      guid: entity.Guid,
      id: entity.Id,
      type: {
        guid: entity.Type.Id,
        name: entity.Type.Name,
        // id: -999,
      },
      // New v15.04
      for: {
        targetType: mdFor?.TargetType ?? 0,
        guid: mdFor?.Guid,
        number: mdFor?.Number,
        string: mdFor?.String,
      },
    };
    const formConfig = this.formConfig.config;
    const user = formConfig.dialogContext.User;
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
        appId: formConfig.appId,
        zoneId: formConfig.zoneId,
        isGlobal: formConfig.dialogContext.App.IsGlobalApp,
        isSite: formConfig.dialogContext.App.IsSiteApp,
        isContent: formConfig.dialogContext.App.IsContentApp,
        getSetting: (key: string) => undefined,
      },
      sxc: window.$2sxc({
        zoneId: formConfig.zoneId,
        appId: formConfig.appId,
        pageId: formConfig.tabId,
        moduleId: formConfig.moduleId,
        _noContextInHttpHeaders: true,  // disable pageid etc. headers in http headers, because it would make debugging very hard
        _autoAppIdsInUrl: true,         // auto-add appid and zoneid to url so formula developer can see what's happening
      } as any),
    } satisfies FormulaCacheItemShared;
  }


  /**
   * Used for pacing promises$ and callback$ triggers. Callback$ triggers for the first time when the last promise is resolved.
   * @returns
   */
  private createPromisedParts() {
    const promises$ = new BehaviorSubject<Promise<FieldValue | FormulaResultRaw>>(null);
    const callback$ = new BehaviorSubject<(result: FieldValue | FormulaResultRaw) => void>(null);
    const lastPromise = promises$.pipe(
      filter(x => !!x),
      switchMap(promise => from(promise)),
    );
    // This combineLatest triggers the callback for the first time when the last promise is resolved
    this.subscriptions.add(combineLatest([lastPromise, callback$.pipe(filter(x => !!x))]).subscribe(
      ([result, callback]) => {
        callback(result);
      },
    ));

    return { promises$, callback$ };
  }


  /**
   * Used for returning formulas filtered by optional entity, field or target.
   * @param entityGuid Optional entity guid
   * @param fieldName Optional field
   * @param target Optional target
   * @param allowDraft
   * @returns Filtered formula array
   */
  getFormulas(entityGuid?: string, fieldName?: string, target?: FormulaTarget[], allowDraft?: boolean): FormulaCacheItem[] {
    return this.formulas().filter(f =>
        (entityGuid ? f.entityGuid === entityGuid : true)
        && (fieldName ? f.fieldName === fieldName : true)
        && (target ? target?.find(target => f.target == target) : true)
        && (allowDraft ? true : !f.isDraft)
    );
  }

  /**
   * Used for saving updated formula from editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param formula
   * @param sourceGuid
   * @param sourceId
   * @returns
   */
  updateSaved(formulaItem: FormulaCacheItem, sourceGuid: string, sourceId: number): void {
    const { list, index, old } = this.formulaListIndexAndOriginal(formulaItem);
    if (old == null)
      return;

    const updated: FormulaCacheItem = {
      ...old,
      sourceFromSettings: formulaItem.source,
      sourceGuid,
      sourceId,
    };

    const newCache = [...list.slice(0, index), updated, ...list.slice(index + 1)];
    this.formulas.set(newCache);
  }

  private formulaListIndexAndOriginal(fOrDs: FormulaCacheItem | DesignerState) {
    const list = this.formulas();
    const index = list.findIndex(f => f.entityGuid === fOrDs.entityGuid && f.fieldName === fOrDs.fieldName && f.target === fOrDs.target);
    const old = list[index];
    return { list, index, old };
  }

  /**
   * Used for deleting formula.
   * @param entityGuid
   * @param fieldName
   * @param target
   */
  delete(formulaItem: FormulaCacheItem): void {
    const { list, index, old } = this.formulaListIndexAndOriginal(formulaItem);
    const newCache = [...list.slice(0, index), ...list.slice(index + 1)];
    this.formulas.set(newCache);
  }

  /**
   * Used for resetting formula.
   * @param entityGuid
   * @param fieldName
   * @param target
   */
  resetFormula(designer: DesignerState): void {
    const entityGuid = designer.entityGuid;
    const fieldName = designer.fieldName;
    const target = designer.target;

    const x = this.resultListIndexAndOriginal(designer);
    const oldResults = this.results();
    const oldResultIndex = oldResults.findIndex(r => r.entityGuid === entityGuid && r.fieldName === fieldName && r.target === target);
    if (oldResultIndex >= 0) {
      const newResults = [...oldResults.slice(0, oldResultIndex), ...oldResults.slice(oldResultIndex + 1)];
      this.results.set(newResults);
    }

    const list = this.formulas();
    const index = list.findIndex(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target);
    const oldFormulaItem = list[index];

    if (oldFormulaItem?.sourceFromSettings != null) {
      this.updateFormulaFromEditor(designer, oldFormulaItem.sourceFromSettings, true);
    } else if (index >= 0) {
      const newCache = [...list.slice(0, index), ...list.slice(index + 1)];
      this.formulas.set(newCache);
    }
  }

  /**
   * Used for updating formula from editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param formula
   * @param run
   */
  updateFormulaFromEditor(designer: DesignerState, formula: string, run: boolean): void {
    const entityGuid = designer.entityGuid;
    const fieldName = designer.fieldName;
    const target = designer.target;
    let formulaFunction: FormulaFunction;
    if (run) {
      try {
        formulaFunction = FormulaHelpers.buildFormulaFunction(formula);
      } catch (error) {
        this.cacheResults({entityGuid, fieldName, target} satisfies FormulaIdentifier, undefined, true, false);
        const item = this.itemService.get(entityGuid);
        const contentType = this.contentTypeService.getContentTypeOfItem(item);
        const language = this.formConfig.language();
        const itemTitle = ContentTypeSettingsHelpers.getContentTypeTitle(contentType, language);
        const errorLabel = `Error building formula for Entity: "${itemTitle}", Field: "${fieldName}", Target: "${target}"`;
        this.loggingService.addLog(LogSeverities.Error, errorLabel, error);

        // TODO: PROBABLY UNNECESSARY CHECK AS IT'S PROBABLY ALWAYS THIS ONE
        const designerState = this.designerSvc.designerState();
        const isOpenInDesigner = designerState.isOpen
          && designerState.entityGuid === entityGuid
          && designerState.fieldName === fieldName
          && designerState.target === target;

        if (isOpenInDesigner) {
          console.error(errorLabel, error);
        }
      }
    }

    const { list, index, old } = this.formulaListIndexAndOriginal(designer);

    // const list = this.formulas();
    // const index = list.findIndex(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target);
    // const old = list[index];

    // Get shared calculated properties, which we need in case the old-formula doesn't have them yet
    const shared = this.buildItemFormulaCacheSharedParts(null, entityGuid);

    const streams = (old?.promises$ && old?.updateCallback$)
      ? { promises$: old.promises$, callback$: old.updateCallback$ }
      : this.createPromisedParts();

    const newFormulaItem: FormulaCacheItem = {
      cache: old?.cache ?? {},
      entityGuid,
      fieldName,
      fn: formulaFunction?.bind({}),
      isDraft: run ? formulaFunction == null : true,
      source: formula,
      sourceFromSettings: old?.sourceFromSettings,
      sourceGuid: old?.sourceGuid,
      sourceId: old?.sourceId,
      target,
      version: FormulaHelpers.findFormulaVersion(formula),
      targetEntity: old?.targetEntity ?? shared.targetEntity,
      user: old?.user ?? shared.user,
      app: old?.app ?? shared.app,
      sxc: old?.sxc ?? shared.sxc,
      stopFormula: false,
      promises$: old?.promises$ ?? streams.promises$,
      updateCallback$: old?.updateCallback$ ?? streams.callback$,
    };

    const newCache = index >= 0
      ? [...list.slice(0, index), newFormulaItem, ...list.slice(index + 1)]
      : [newFormulaItem, ...list];
    this.formulas.set(newCache);
  }

  /**
   * Cache the results of a formula - mainly for showing formula result in editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param value
   * @param isError
   * @param isOnlyPromise
   */
  cacheResults(formulaItem: FormulaIdentifier, value: FieldValue, isError: boolean, isOnlyPromise: boolean
  ): void {
    const newResult: FormulaResult = {
      entityGuid: formulaItem.entityGuid,
      fieldName: formulaItem.fieldName,
      target: formulaItem.target,
      value,
      isError,
      isOnlyPromise,
    };

    const {list, index, old} = this.resultListIndexAndOriginal(formulaItem);
    const newResults = index >= 0
      ? [...list.slice(0, index), newResult, ...list.slice(index + 1)]
      : [newResult, ...list];
    this.results.set(newResults);
  }

  resultListIndexAndOriginal(r: FormulaIdentifier) {
    const list = this.results();
    const index = list.findIndex(result => result.entityGuid === r.entityGuid && result.fieldName === r.fieldName && result.target === r.target);
    const old = list[index];
    return { list, index, old };
  }
}