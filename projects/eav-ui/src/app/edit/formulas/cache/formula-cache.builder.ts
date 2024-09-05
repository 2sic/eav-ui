import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, filter, from, switchMap } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { EntityReader, FieldsSettingsHelpers, ContentTypeSettingsHelpers } from '../../shared/helpers';
import { EavItem } from '../../shared/models/eav/eav-item';
import { FormulaSourceCodeHelper } from './source-code-helper';
import { FormulaFunction } from '../formula-definitions';
import { FormulaDefaultTargets, FormulaNewPickerTargets, FormulaTarget } from '../targets/formula-targets';
import { FormulaV1CtxApp, FormulaV1CtxTargetEntity, FormulaV1CtxUser } from '../run/formula-run-context.model';
import { FormulaCacheItem } from './formula-cache.model';
import { FormulaCacheItemConstants } from './formula-cache.model';
import { FormulaResultRaw, FormulaIdentifier } from '../results/formula-results.models';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { LocalizationHelpers as LocHelper } from '../../localization/localization.helpers';
import { FormConfigService } from '../../state/form-config.service';
import { LoggingService, LogSeverities } from '../../shared/services/logging.service';
import { ItemService } from '../../shared/store/item.service';
import { ContentTypeService } from '../../shared/store/content-type.service';
import { ContentTypeItemService } from '../../shared/store/content-type-item.service';
import { FormulaCacheService } from './formula-cache.service';
import { Sxc } from '@2sic.com/2sxc-typings';
import { InputTypeService } from '../../shared/input-types/input-type.service';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';

const logSpecs = {
  enabled: false,
  name: 'FormulaCacheBuilder',
  specs: {
    all: false,
    buildFormulaCache: false,
    updateFormulaFromEditor: false,
    createPromisedParts: false,
    buildItemFormulaCacheSharedParts: false,
  }
};


/**
 * Service just to cache formulas for execution and use in the designer.
 */
@Injectable()
export class FormulaCacheBuilder extends ServiceBase implements OnDestroy {
  log = new EavLogger(logSpecs);
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private loggingService: LoggingService,
    private translate: TranslateService,
    private inputTypes: InputTypeService,
  ) {
    super();
  }

  ngOnDestroy() {
    // Destroy all observables which were used for promises and callback triggers
    super.destroy();
  }

  /**
   * Used for building the initial formula cache.
   * @returns
   */
  public buildFormulaCache(cacheSvc: FormulaCacheService): FormulaCacheItem[] {
    const l = this.log.fnIf('buildFormulaCache');
    const formulaCache: FormulaCacheItem[] = [];
    const language = this.formConfig.language();
    const reader = new EntityReader(language.current, language.primary);

    for (const entityGuid of this.formConfig.config.itemGuids) {
      const item = this.itemService.get(entityGuid);

      const sharedParts = this.#buildItemFormulaCacheSharedParts(item, entityGuid);

      const contentType = this.contentTypeService.getContentTypeOfItem(item);
      for (const attribute of contentType.Attributes) {
        // Get field settings
        const settings = FieldsSettingsHelpers.getDefaultSettings(reader.flattenAll<FieldSettings>(attribute.Metadata));

        // get input type specs
        const inputType = this.inputTypes.getSpecs(attribute);

        // Get all formulas for the field
        const formula = this.contentTypeItemService
          .getMany(settings.Formulas)
          .filter(f => LocHelper.translate<boolean>(language, f.Attributes.Enabled, null));

        for (const formulaItem of formula) {
          const sourceCode: string = LocHelper.translate<string>(language, formulaItem.Attributes.Formula, null);
          if (sourceCode == null) 
            continue;

          const target: FormulaTarget = LocHelper.translate<string>(language, formulaItem.Attributes.Target, null);

          // create cleaned formula function, or if this fails, add info to log & results
          let formulaFunction: FormulaFunction;
          try {
            formulaFunction = FormulaSourceCodeHelper.buildFormulaFunction(sourceCode);
          } catch (error) {
            cacheSvc.cacheResults({ entityGuid, fieldName: attribute.Name, target } satisfies FormulaIdentifier, undefined, true, false);
            const itemTitle = ContentTypeSettingsHelpers.getTitle(contentType, language);
            this.loggingService.addLog(LogSeverities.Error, `Error building formula for Entity: "${itemTitle}", Field: "${attribute.Name}", Target: "${target}"`, error);
            this.loggingService.showMessage(this.translate.instant('Errors.FormulaConfiguration'), 2000);
          }

          const streams = this.#createPromisedParts();

          const formulaCacheItem: FormulaCacheItem = {
            cache: {},
            entityGuid,
            fieldName: attribute.Name,
            fn: formulaFunction?.bind({}),
            isDraft: formulaFunction == null,
            sourceCode,
            sourceCodeSaved: sourceCode,
            sourceCodeGuid: formulaItem.Guid,
            sourceCodeId: formulaItem.Id,
            target,
            ...this.#inputTypeSpecsForCacheItem(target, inputType),
            version: FormulaSourceCodeHelper.findFormulaVersion(sourceCode),
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

  #inputTypeSpecsForCacheItem(target: FormulaTarget, inputType: InputTypeSpecs) {
    return inputType.isNewPicker && [FormulaDefaultTargets.Value, FormulaNewPickerTargets.Options].includes(target)
      ? { inputType, disabled: true, disabledReason: 'New picker is not supported in formulas yet' }
      : { inputType, disabled: false, disabledReason: '' };
  }



  /**
   * Used for building shared parts of formula cache item.
   * @param item
   * @param entityGuid
   * @returns
   */
  #buildItemFormulaCacheSharedParts(item: EavItem, entityGuid: string): FormulaCacheItemConstants {
    this.log.fnIf('buildItemFormulaCacheSharedParts', { item, entityGuid });
    item = item ?? this.itemService.get(entityGuid);
    const entity = item.Entity;
    const mdFor = entity.For;
    const targetEntity: FormulaV1CtxTargetEntity = {
      guid: entity.Guid,
      id: entity.Id,
      type: {
        guid: entity.Type.Id,
        name: entity.Type.Name,
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
      } satisfies FormulaV1CtxUser,
      app: {
        appId: formConfig.appId,
        zoneId: formConfig.zoneId,
        isGlobal: formConfig.dialogContext.App.IsGlobalApp,
        isSite: formConfig.dialogContext.App.IsSiteApp,
        isContent: formConfig.dialogContext.App.IsContentApp,
        getSetting: (key: string) => undefined,
      } satisfies FormulaV1CtxApp,
      sxc: window.$2sxc({
        zoneId: formConfig.zoneId,
        appId: formConfig.appId,
        pageId: formConfig.tabId,
        moduleId: formConfig.moduleId,
        _noContextInHttpHeaders: true,  // disable pageid etc. headers in http headers, because it would make debugging very hard
        _autoAppIdsInUrl: true,         // auto-add appid and zoneid to url so formula developer can see what's happening
      } as any) satisfies Sxc,
    } satisfies FormulaCacheItemConstants;
  }


  /**
   * Used for pacing promises$ and callback$ triggers. Callback$ triggers for the first time when the last promise is resolved.
   * @returns
   */
  #createPromisedParts() {
    this.log.fnIf('createPromisedParts');
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
   * Used for updating formula from editor.
   * @param entityGuid
   * @param fieldName
   * @param target
   * @param formula
   * @param run
   */
  public updateFormulaFromEditor(cacheSvc: FormulaCacheService, id: FormulaIdentifier, formula: string, run: boolean) {
    this.log.fnIf('updateFormulaFromEditor', { id, formula, run });
    // important: the designer contains too much info, so we need to extract the essentials
    // to not have it in the cache - which would trigger loads of changes to that signal later on.
    let formulaFunction: FormulaFunction;

    // If we should also run it, push it to the formulas cache so it will be executed
    if (run)
      try {
        formulaFunction = FormulaSourceCodeHelper.buildFormulaFunction(formula);
      } catch (error) {
        cacheSvc.cacheResults(id, /* value: */ undefined, /* isError: */ true, /* isPromise */ false);
        const item = this.itemService.get(id.entityGuid);
        const contentType = this.contentTypeService.getContentTypeOfItem(item);
        const language = this.formConfig.language();
        const itemTitle = ContentTypeSettingsHelpers.getTitle(contentType, language);
        const errorLabel = `Error building formula for Entity: "${itemTitle}", Field: "${id.fieldName}", Target: "${id.target}"`;
        this.loggingService.addLog(LogSeverities.Error, errorLabel, error);

        console.error(errorLabel, error);
      }

    // find input type
    const item = this.itemService.get(id.entityGuid);
    const attribute = this.contentTypeService.getAttributeOfItem(item, id.fieldName);
    const inputType = this.inputTypes.getSpecs(attribute);

    // Find original in case we had it already (as we would then update it)
    const { list, index, value } = cacheSvc.formulaListIndexAndOriginal(id);

    // Get shared calculated properties, which we need in case the old-formula doesn't have them yet
    const shared = this.#buildItemFormulaCacheSharedParts(null, id.entityGuid);

    const streams = (value?.promises$ && value?.updateCallback$)
      ? { promises$: value.promises$, callback$: value.updateCallback$ }
      : this.#createPromisedParts();

    const newFormulaItem: FormulaCacheItem = {
      ...id,
      cache: value?.cache ?? {},
      fn: formulaFunction?.bind({}),
      isDraft: run ? formulaFunction == null : true,
      sourceCode: formula,
      sourceCodeSaved: value?.sourceCodeSaved,
      sourceCodeGuid: value?.sourceCodeGuid,
      sourceCodeId: value?.sourceCodeId,
      version: FormulaSourceCodeHelper.findFormulaVersion(formula),
      ...this.#inputTypeSpecsForCacheItem(id.target, inputType),
      targetEntity: value?.targetEntity ?? shared.targetEntity,
      user: value?.user ?? shared.user,
      app: value?.app ?? shared.app,
      sxc: value?.sxc ?? shared.sxc,
      stopFormula: false,
      promises$: value?.promises$ ?? streams.promises$,
      updateCallback$: value?.updateCallback$ ?? streams.callback$,
    };

    const newCache = index >= 0
      ? [...list.slice(0, index), newFormulaItem, ...list.slice(index + 1)]
      : [newFormulaItem, ...list];
    return newCache;
  }

}