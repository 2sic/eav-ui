import { Injectable, OnDestroy, Signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise, startWith, Subject } from 'rxjs';
import { ItemHistoryResult } from '../../../item-history/models/item-history-result.model';
import { BaseComponentSubscriptions } from '../../../shared/components/base.component';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { EditForm } from '../../../shared/models/edit-form.model';
import { EditEntryComponent } from '../../dialog/entry/edit-entry.component';
import { EditParams } from '../../edit-matcher.models';
import { UrlHelpers } from '../helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';
import { FormConfigService } from '../../state/form-config.service';
import { LanguageInstanceService } from '../store/language-instance.service';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logSpecs = {
  enabled: true,
  name: 'EditRoutingService',
  specs: {
    all: false,
    childFormResult: true,
    expand: false,
    open: false,
    test: ['...'],
  }
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
export class EditRoutingService extends BaseComponentSubscriptions implements OnDestroy {

  log = new EavLogger(logSpecs);

  constructor(
    private dialogRef: MatDialogRef<EditEntryComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private langInstanceSvc: LanguageInstanceService,
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
    this.#watchToRefreshOnVersionsClosed();
  }

  #childFormResult$ = new Subject<ChildFormResult>();

  #getParams() { return this.route.snapshot.params as EditParams; }

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
    return this.route.params.pipe(
      mapUntilChanged((p: EditParams) => p.detailsEntityGuid === entityGuid && p.detailsFieldId === fieldIndex),
    );
  }

  isExpandedSignal(fieldId: number, entityGuid: string): Signal<boolean> {
    // Create a unique key by combining fieldId and entityGuid, then check cache
    const key = `${fieldId}-${entityGuid}`;
    const cached = this.#signalsExpandedCache[key];
    if (cached) return cached;

    // Get the observable and convert it to a signal
    const obs = this.isExpanded$(fieldId, entityGuid);
    return this.#signalsExpandedCache[key] = toSignal(obs);
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
    const url = this.#newUrlIfCurrentContainsOldUrl(oldEditUrl, newEditUrl);
    if (url == null) return l.end('no change');
    this.router.navigate([url], { state: componentTag && { componentTag } });
    l.end('routed away to ', { url});
  }

  /** Opens child dialog and stores update entityGuid and fieldId in the url, if field is not expanded already */
  open(fieldId: number, entityGuid: string, form: EditForm) {
    const l = this.log.fnIf('open', { fieldId, entityGuid, form });
    const formUrl = convertFormToUrl(form);
    const pInfo = this.#getParamsAndPayload();
    // if field is expanded, just open child because that info will be used for field update
    if (pInfo.hasDetails) {
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
      return l.end('expanded, just open child');
    }

    // otherwise add /update/:entityGuid/:fieldId to the url
    const oldEditUrl = `edit/${pInfo.params.items}`;
    const newEditUrl = `edit/${pInfo.params.items}/update/${entityGuid}/${fieldId}/edit/${formUrl}`;
    const url = this.#newUrlIfCurrentContainsOldUrl(oldEditUrl, newEditUrl);
    if (url == null) return l.end('no change');
    this.router.navigate([url]);
    l.end('routed away to ', { url });
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  #initHideHeader() {
    this.subscriptions.add(
      this.route.params
        .pipe(mapUntilChanged((p: EditParams) => p.detailsEntityGuid != null && p.detailsFieldId != null))
        .subscribe(hasDetails => this.langInstanceSvc.updateHideHeader(this.formConfig.config.formId, hasDetails))
    );
  }

  /** Believe this will trigger both on open and on close...? of a first-sub-dialog */
  #routerEventsChildDialog$() {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(!!this.route.snapshot.firstChild),
      map(() => !!this.route.snapshot.firstChild),
      pairwise(),
      filter(([hadChild, hasChild]) => hadChild && !hasChild),
    );
  }

  #watchChildFormResult() {
    this.subscriptions.add(
      this.#routerEventsChildDialog$().pipe(
        map(() => {
          const pInfo = this.#getParamsAndPayload();
          return {
            pInfo,
            result: {
              updateEntityGuid: pInfo.guid,
              updateFieldId: parseInt(pInfo.fieldId, 10),
              result: this.router.getCurrentNavigation().extras?.state,
            } satisfies ChildFormResult
        };
        }),
      ).subscribe(({ pInfo, result }) => {
        // alert subscribers that child form closed
        this.#childFormResult$.next(result);

        // clear update ids from url (leave expanded/details)
        if (!pInfo.hasUpdate) return;
        
        const p = pInfo.params;
        const url = this.#newUrlIfCurrentContainsOldUrl(`edit/${p.items}/update/${p.updateEntityGuid}/${p.updateFieldId}`, `edit/${p.items}`);
        if (url == null) return;
        this.router.navigate([url]);
      })
    );
  }

  #watchToRefreshOnVersionsClosed() {
    this.subscriptions.add(
      this.#routerEventsChildDialog$().pipe(
        map(() => this.router.getCurrentNavigation().extras?.state as ItemHistoryResult),
        filter(result => result?.refreshEdit != null),
      ).subscribe(result => {
        if (!result.refreshEdit) return;
        const p = this.#getParams();
        const newUrl = this.#newUrlIfCurrentContainsOldUrl(`edit/${p.items}`, `edit/refresh/${p.items}`);
        if (newUrl == null) return;
        this.dialogRef.close({ navigateUrl: newUrl } satisfies NavigateFormResult);
      })
    );
  }

  #newUrlIfCurrentContainsOldUrl(oldEditUrl: string, newEditUrl: string) {
    const currentUrl = UrlHelpers.calculatePathFromRoot(this.route);
    const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
    if (lastIndex <= 0) return null;
    const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
    return newUrl;
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
