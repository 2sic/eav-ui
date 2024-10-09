import { Injectable, Injector, OnDestroy, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Subject } from 'rxjs';
import { transient } from '../../../../../core';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { classLog } from '../../shared/logging';
import { EditForm } from '../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { mapUntilChanged } from '../../shared/rxJs/mapUntilChanged';
import { ServiceBase } from '../../shared/services/service-base';
import { FormConfigService } from '../form/form-config.service';
import { FormLanguageService } from '../form/form-language.service';
import { UrlHelpers } from '../shared/helpers';
import { EditUrlParams } from './edit-url-params.model';

const logSpecs = {
  all: false,
  childFormResult: true,
  expand: false,
  open: false,
  watchToRefreshOnVersionsClosed: true,
}

/**
 * Special helper to handle opening / closing field-specific popups.
 * E.g. the larger dialog on hyperlinks/files or entity-pickers.
 *
 * Note: also seems to be involved in the version-dialog closing as well.
 * 
 * Note that it seems to be "Scoped" to the EditDialogMain Component
 */
@Injectable()
export class EditRoutingService extends ServiceBase implements OnDestroy {

  log = classLog({EditRoutingService}, logSpecs);

  #dialogRouter = transient(DialogRoutingService);
  #route = this.#dialogRouter.route;
  #router = this.#dialogRouter.router;

  constructor(
    private langInstanceSvc: FormLanguageService,
    private formConfig: FormConfigService
  ) {
    super();
    this.log.a('constructor');
  }

  ngOnDestroy() {
    this.#childFormResult$.complete();
    super.ngOnDestroy();
  }

  init() {
    this.#initHideHeader();
    this.#watchChildFormResult();
  }

  #childFormResult$ = new Subject<ChildFormResult>();

  #getParams() { return this.#route.snapshot.params as EditUrlParams; }

  #getParamsAndPayload() {
    const p = this.#getParams();
    const hasDetails = p.detailsEntityGuid != null && p.detailsFieldId != null;
    return {
      params: p,
      hasDetails,
      hasUpdate: p.updateEntityGuid != null && p.updateFieldId != null,
      guid: hasDetails ? p.detailsEntityGuid : p.updateEntityGuid,
      fieldId: hasDetails ? p.detailsFieldId : p.updateFieldId,
    };
  }

  /** Tells if field with this index should be expanded */
  isExpanded(fieldId: number, entityGuid: string) {
    const fieldIndex = fieldId.toString();
    const params = this.#getParams();
    const isExpanded = params.detailsEntityGuid === entityGuid && params.detailsFieldId === fieldIndex;
    return isExpanded;
  }

  /** Tells if field with this index should be expanded */
  isExpanded$(fieldId: number, entityGuid: string) {
    const fieldIndex = fieldId.toString();
    return this.#route.params.pipe(
      mapUntilChanged((p: EditUrlParams) => p.detailsEntityGuid === entityGuid && p.detailsFieldId === fieldIndex),
    );
  }

  // TODO: @2pp - if this is only used in the field-injector.service, then make injector required
  isExpandedSignal(fieldId: number, entityGuid: string, injector?: Injector): Signal<boolean> {
    // Create a unique key by combining fieldId and entityGuid, then check cache
    const key = `${fieldId}-${entityGuid}`;
    const cached = this.#signalsExpandedCache[key];
    if (cached) return cached;

    // Get the observable and convert it to a signal
    const obs = this.isExpanded$(fieldId, entityGuid);
    return this.#signalsExpandedCache[key] = toSignal(obs, { injector });
  }
  #signalsExpandedCache: Record<string, Signal<boolean>> = {};

  /** Fires when child form is closed and has a result, new entity was added */
  childFormResult(fieldId: number, entityGuid: string) {
    const l = this.log.fnIf('childFormResult', { fieldId, entityGuid });
    const obs = this.#childFormResult$.pipe(
      filter(cr => cr.updateEntityGuid === entityGuid && cr.updateFieldId === fieldId && cr.result != null),
      map(cr => cr.result),
    );
    return l.rSilent(obs);
  }

  /** Fires when child form is closed */
  childFormClosed() {
    return this.#childFormResult$.pipe(map(_ => null));
  }

  expand(expand: boolean, fieldId: number, entityGuid: string, componentTag?: string) {
    const l = this.log.fnIf('expand', { expand, fieldId, entityGuid, componentTag });
    const pInfo = this.#getParamsAndPayload();
    const p = pInfo.params;
    const oldEditUrl = `edit/${p.items}` + (pInfo.hasDetails ? `/details/${pInfo.guid}/${pInfo.fieldId}` : '');
    const newEditUrl = `edit/${p.items}` + (expand ? `/details/${entityGuid}/${fieldId}` : '');
    const url = UrlHelpers.newUrlIfCurrentContainsOldUrl(this.#route, oldEditUrl, newEditUrl);
    if (url == null) return l.end('no change');
    this.#router.navigate([url], { state: componentTag && { componentTag } });
    l.end('routed away to ', { url});
  }

  /** Opens child dialog and stores update entityGuid and fieldId in the url, if field is not expanded already */
  open(fieldId: number, entityGuid: string, form: EditForm) {
    const l = this.log.fnIf('open', { fieldId, entityGuid, form });
    const formUrl = convertFormToUrl(form);
    const pInfo = this.#getParamsAndPayload();
    // if field is expanded, just open child because that info will be used for field update
    if (pInfo.hasDetails) {
      this.#router.navigate([`edit/${formUrl}`], { relativeTo: this.#route });
      return l.end('expanded, just open child');
    }

    // otherwise add /update/:entityGuid/:fieldId to the url
    const oldEditUrl = `edit/${pInfo.params.items}`;
    const newEditUrl = `edit/${pInfo.params.items}/update/${entityGuid}/${fieldId}/edit/${formUrl}`;
    const url = UrlHelpers.newUrlIfCurrentContainsOldUrl(this.#route,oldEditUrl, newEditUrl);
    if (url == null) return l.end('no change');
    this.#router.navigate([url]);
    l.end('routed away to ', { url });
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  #initHideHeader() {
    this.subscriptions.add(
      this.#route.params
        .pipe(
          mapUntilChanged((p: EditUrlParams) => p.detailsEntityGuid != null && p.detailsFieldId != null)
        )
        .subscribe(hasDetails => this.langInstanceSvc.updateHideHeader(this.formConfig.config.formId, hasDetails))
    );
  }

  #watchChildFormResult() {
    this.subscriptions.add(
      this.#dialogRouter.childDialogClosed$().pipe(
        map(() => {
          const pInfo = this.#getParamsAndPayload();
          return {
            pInfo,
            result: {
              updateEntityGuid: pInfo.guid,
              updateFieldId: parseInt(pInfo.fieldId, 10),
              result: this.#router.getCurrentNavigation().extras?.state,
            } satisfies ChildFormResult
          };
        }),
      ).subscribe(({ pInfo, result }) => {
        // alert subscribers that child form closed
        this.#childFormResult$.next(result);

        // clear update ids from url (leave expanded/details)
        if (!pInfo.hasUpdate) return;
        
        const p = pInfo.params;
        const url = UrlHelpers.newUrlIfCurrentContainsOldUrl(this.#route, `edit/${p.items}/update/${p.updateEntityGuid}/${p.updateFieldId}`, `edit/${p.items}`);
        if (url == null) return;
        this.#router.navigate([url]);
      })
    );
  }
}

export interface NavigateFormResult {
  navigateUrl: string;
}

interface ChildFormResult {
  updateEntityGuid: string;
  updateFieldId: number;
  /** On add, contains GUID and Id of newly added item */
  result: {
    [guid: string]: number;
  };
}
