import { CreateEffectOptions, effect, Injectable, Injector, OnDestroy, signal, Signal, WritableSignal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, pairwise, startWith, Subject, Subscription } from 'rxjs';
import { FormConfigService } from '.';
import { ItemHistoryResult } from '../../../item-history/models/item-history-result.model';
import { BaseComponent } from '../../../shared/components/base.component';
import { convertFormToUrl } from '../../../shared/helpers/url-prep.helper';
import { EditForm } from '../../../shared/models/edit-form.model';
import { EditEntryComponent } from '../../dialog/entry/edit-entry.component';
import { EditParams } from '../../edit-matcher.models';
import { UrlHelpers } from '../helpers';
import { ChildFormResult, NavigateFormResult } from '../models';
import { LanguageInstanceService } from '../store/ngrx-data';

@Injectable()
export class EditRoutingService extends BaseComponent implements OnDestroy {
  private childFormResult$: Subject<ChildFormResult>;

  constructor(
    private dialogRef: MatDialogRef<EditEntryComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private languageInstanceService: LanguageInstanceService,
    private formConfig: FormConfigService,
    private injector: Injector
  ) {
    super();
  }

  ngOnDestroy() {
    this.childFormResult$.complete();
    super.ngOnDestroy();
  }

  init() {
    this.childFormResult$ = new Subject<ChildFormResult>();
    this.initHideHeader();
    this.initChildFormResult();
    this.refreshOnChildVersionsClosed();
  }

  /** Tells if field with this index should be expanded */
  isExpanded(fieldId: number, entityGuid: string) {
    const fieldIndex = fieldId.toString();
    const params = this.route.snapshot.params as EditParams;
    const isExpanded = params.detailsEntityGuid === entityGuid && params.detailsFieldId === fieldIndex;
    return isExpanded;
  }

  /** Tells if field with this index should be expanded */
  isExpanded$(fieldId: number, entityGuid: string) {
    const fieldIndex = fieldId.toString();
    return this.route.params.pipe(
      map((params: EditParams) => params.detailsEntityGuid === entityGuid && params.detailsFieldId === fieldIndex),
      distinctUntilChanged()
    );
  }

  // TODO:: New @2dg: New with Signals effect, get WritableSignal<boolean> from isExpandedSignal
  /** Tells if field with this index should be expanded */
  $isExpandedSignal(fieldId: number, entityGuid: string): WritableSignal<boolean> {
    const fieldIndex = fieldId.toString();
    const $expandedSignal: WritableSignal<boolean> = signal(false);

    // Create an effect that listens to the route params and updates the signal
    effect(() => {
      const subscription = this.route.params.pipe(
        map((params: EditParams) => params.detailsEntityGuid === entityGuid && params.detailsFieldId === fieldIndex),
        distinctUntilChanged()
      ).subscribe(isExpanded => {
        $expandedSignal.set(isExpanded);
      });

      // unsubscribe the subscription when the signal is disposed
      return () => subscription.unsubscribe();
    },
      // Set options for the effect
      // Injector is needed to inject services into the effect
      // allowSignalWrites: true is needed to allow the effect to write to the signal in a effect
      { allowSignalWrites: true, injector: this.injector } as CreateEffectOptions
    );

    return $expandedSignal;
  }

  /** Fires when child form is closed and has a result, new entity was added */
  childFormResult(fieldId: number, entityGuid: string) {
    return this.childFormResult$.pipe(
      filter(
        childResult => childResult.updateEntityGuid === entityGuid && childResult.updateFieldId === fieldId && childResult.result != null
      ),
      map(childResult => childResult.result)
    );
  }

  /** Fires when child form is closed */
  childFormClosed() {
    return this.childFormResult$.pipe(map(childResult => null));
  }

  expand(expand: boolean, fieldId: number, entityGuid: string, componentTag?: string) {
    const params = this.route.snapshot.params as EditParams;
    const oldHasDetails = params.detailsEntityGuid != null && params.detailsFieldId != null;
    const oldEditUrl = `edit/${params.items}` + (oldHasDetails ? `/details/${params.detailsEntityGuid}/${params.detailsFieldId}` : '');
    const newEditUrl = `edit/${params.items}` + (expand ? `/details/${entityGuid}/${fieldId}` : '');

    const currentUrl = UrlHelpers.calculatePathFromRoot(this.route);
    const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
    if (lastIndex <= 0) { return; }
    const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
    this.router.navigate([newUrl], { state: componentTag && { componentTag } });
  }

  /** Opens child dialog and stores update entityGuid and fieldId in the url, if field is not expanded already */
  open(fieldId: number, entityGuid: string, form: EditForm) {
    const formUrl = convertFormToUrl(form);
    const params = this.route.snapshot.params as EditParams;
    const hasDetails = params.detailsEntityGuid != null && params.detailsFieldId != null;
    // if field is expanded, just open child because that info will be used for field update
    if (hasDetails) {
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
      return;
    }

    // otherwise add /update/:entityGuid/:fieldId to the url
    const oldEditUrl = `edit/${params.items}`;
    const newEditUrl = `edit/${params.items}/update/${entityGuid}/${fieldId}/edit/${formUrl}`;

    const currentUrl = UrlHelpers.calculatePathFromRoot(this.route);
    const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
    if (lastIndex <= 0) { return; }
    const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
    this.router.navigate([newUrl]);
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  private initHideHeader() {
    this.subscriptions.add(
      this.route.params
        .pipe(
          map((params: EditParams) => params.detailsEntityGuid != null && params.detailsFieldId != null),
          distinctUntilChanged(),
        )
        .subscribe(hasDetails => {
          this.languageInstanceService.updateHideHeader(this.formConfig.config.formId, hasDetails);
        })
    );
  }

  private initChildFormResult() {
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
        map(() => {
          const params = this.route.snapshot.params as EditParams;
          const hasDetails = params.detailsEntityGuid != null && params.detailsFieldId != null;
          const updateEntityGuid = hasDetails ? params.detailsEntityGuid : params.updateEntityGuid;
          const updateFieldId = hasDetails ? params.detailsFieldId : params.updateFieldId;
          const navigation = this.router.getCurrentNavigation();
          const editResult = navigation.extras?.state;
          const formResult: ChildFormResult = {
            updateEntityGuid,
            updateFieldId: parseInt(updateFieldId, 10),
            result: editResult,
          };
          return formResult;
        }),
      ).subscribe(formResult => {
        // alert subscribers that child form closed
        this.childFormResult$.next(formResult);

        // clear update ids from url (leave expanded/details)
        const params = this.route.snapshot.params as EditParams;
        const hasUpdate = params.updateEntityGuid != null && params.updateFieldId != null;
        if (!hasUpdate) { return; }

        const oldEditUrl = `edit/${params.items}/update/${params.updateEntityGuid}/${params.updateFieldId}`;
        const newEditUrl = `edit/${params.items}`;

        const currentUrl = UrlHelpers.calculatePathFromRoot(this.route);
        const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
        if (lastIndex <= 0) { return; }
        const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
        this.router.navigate([newUrl]);
      })
    );
  }

  private refreshOnChildVersionsClosed() {
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
        map(() => {
          const navigation = this.router.getCurrentNavigation();
          const versionsResult = navigation.extras?.state as ItemHistoryResult;
          return versionsResult;
        }),
        filter(versionsResult => versionsResult?.refreshEdit != null),
      ).subscribe(result => {
        if (!result.refreshEdit) { return; }
        const params = this.route.snapshot.params as EditParams;
        const oldEditUrl = `edit/${params.items}`;
        const newEditUrl = `edit/refresh/${params.items}`;

        const currentUrl = UrlHelpers.calculatePathFromRoot(this.route);
        const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
        if (lastIndex <= 0) { return; }
        const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
        const navRes: NavigateFormResult = {
          navigateUrl: newUrl,
        };
        this.dialogRef.close(navRes);
      })
    );
  }
}
