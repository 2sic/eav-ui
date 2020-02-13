import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

import { EditForm } from '../../../ng-dialogs/src/app/app-administration/shared/models/edit-form.model';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class ExpandableFieldService {
  private subscription: Subscription;
  private expandedField$$: BehaviorSubject<number>;
  private route: ActivatedRoute;

  constructor(private router: Router, private languageInstanceService: LanguageInstanceService) { }

  init(route: ActivatedRoute) {
    this.subscription = new Subscription();
    this.expandedField$$ = new BehaviorSubject(null);
    this.route = route;
    this.subscription.add(
      this.route.params.subscribe(params => {
        const editFormData: EditForm = JSON.parse(decodeURIComponent(params.items));
        this.expandedField$$.next(editFormData.persistedData.expandedFieldId);
      }),
    );
  }

  getObservable() {
    return this.expandedField$$.asObservable();
  }

  expand(expand: boolean, fieldId: number, formId: number) {
    this.languageInstanceService.updateHideHeader(formId, expand);
    this.updateUrl(expand, fieldId);
  }

  destroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
    this.expandedField$$.unsubscribe();
    this.expandedField$$ = null;
    this.route = null;
  }

  private updateUrl(expand: boolean, fieldId: number) {
    let lastChild = this.route;
    while (lastChild.firstChild) {
      lastChild = lastChild.firstChild;
    }
    let newUrl = '';
    for (const path of lastChild.snapshot.pathFromRoot) {
      if (path.url.length <= 0) { continue; }
      for (const urlSegment of path.url) {
        if (!urlSegment.path) { continue; }
        newUrl += '/' + urlSegment.path;
      }
    }

    const oldFormDataString = this.route.snapshot.params.items;
    const editFormData: EditForm = JSON.parse(decodeURIComponent(oldFormDataString));
    if (expand) {
      editFormData.persistedData.expandedFieldId = fieldId;
    } else {
      delete editFormData.persistedData.expandedFieldId;
    }
    const newFormDataString = JSON.stringify(editFormData);
    const lastIndex = newUrl.lastIndexOf(oldFormDataString);
    if (lastIndex <= 0) { return; }
    newUrl = newUrl.substring(0, lastIndex) + newUrl.substring(lastIndex).replace(oldFormDataString, newFormDataString);
    this.router.navigate([newUrl]);
  }
}
