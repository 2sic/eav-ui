import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, startWith } from 'rxjs/operators';
import { convertFormToUrl } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { EditForm } from '../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { EditParams } from '../../edit-matcher.models';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';
import { ChildFormResult } from './edit-routing.models';

@Injectable()
export class EditRoutingService implements OnDestroy {
  private route: ActivatedRoute;
  private subscription = new Subscription();
  private childFormResult$ = new Subject<ChildFormResult>();

  constructor(private router: Router, private languageInstanceService: LanguageInstanceService) { }

  // spm TODO: ngOnDestroy only fires in services provided in component
  ngOnDestroy() {
    this.childFormResult$.complete();
    this.subscription.unsubscribe();
  }

  init(route: ActivatedRoute, formId: number) {
    this.route = route;
    this.initHideHeader(formId);
    this.initChildFormResult();
  }

  /** Tells if field with this index should be expanded */
  isExpanded(fieldId: number, entityGuid: string) {
    const fieldIndex = fieldId.toString();
    return this.route.params.pipe(
      map((params: EditParams) => params.detailsEntityGuid === entityGuid && params.detailsFieldId === fieldIndex),
      distinctUntilChanged()
    );
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

    const currentUrl = this.calculatePathFromRoot();
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

    const currentUrl = this.calculatePathFromRoot();
    const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
    if (lastIndex <= 0) { return; }
    const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
    this.router.navigate([newUrl]);
  }

  /** Update hideHeader for the form. Fix for safari and mobile browsers */
  private initHideHeader(formId: number) {
    this.subscription.add(
      this.route.params
        .pipe(
          map((params: EditParams) => params.detailsEntityGuid != null && params.detailsFieldId != null),
          distinctUntilChanged()
        )
        .subscribe(hasDetails => {
          this.languageInstanceService.updateHideHeader(formId, hasDetails);
        })
    );
  }

  private initChildFormResult() {
    this.subscription.add(
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

        const currentUrl = this.calculatePathFromRoot();
        const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
        if (lastIndex <= 0) { return; }
        const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
        this.router.navigate([newUrl]);
      })
    );
  }

  private calculatePathFromRoot() {
    let lastChild = this.route;
    while (lastChild.firstChild) {
      lastChild = lastChild.firstChild;
    }
    let pathFromRoot = '';
    for (const path of lastChild.snapshot.pathFromRoot) {
      if (path.url.length <= 0) { continue; }
      for (const urlSegment of path.url) {
        if (!urlSegment.path) { continue; }
        pathFromRoot += '/' + urlSegment.path;
      }
    }
    return pathFromRoot;
  }
}
