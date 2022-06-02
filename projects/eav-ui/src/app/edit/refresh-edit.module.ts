import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { EditParams } from './edit-matcher.models';
import { UrlHelpers } from './shared/helpers';

@Component({
  template: '',
})
export class RefreshEditComponent {
  constructor(router: Router, route: ActivatedRoute) {
    const params = route.snapshot.params as EditParams;
    const oldEditUrl = `edit/refresh/${params.items}`;
    const newEditUrl = `edit/${params.items}`;

    const currentUrl = UrlHelpers.calculatePathFromRoot(route);
    const lastIndex = currentUrl.lastIndexOf(oldEditUrl);
    if (lastIndex <= 0) { return; }
    const newUrl = currentUrl.substring(0, lastIndex) + currentUrl.substring(lastIndex).replace(oldEditUrl, newEditUrl);
    router.navigate([newUrl]);
  }
}

const editRefreshRoutes: Routes = [
  {
    path: '', component: RefreshEditComponent, data: { title: 'Refreshing Edit Dialog' }
  },
];

@NgModule({
  declarations: [
    RefreshEditComponent,
  ],
  imports: [
    RouterModule.forChild(editRefreshRoutes),
  ],
})
export class RefreshEditModule { }
