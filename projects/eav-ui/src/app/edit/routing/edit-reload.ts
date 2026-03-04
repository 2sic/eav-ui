import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { classLog } from '../../../../../shared/logging';
import { UrlHelpers } from '../shared/helpers';
import { EditUrlParams } from './edit-url-params.model';

/**
 * The purpose of this component is to refresh the edit dialog completely.
 * It works as follows:
 * 1. A close event of the child which requests a full refresh (probably just the history?)
 *    will cause the router to replace the Path to a url going to this control. This flushes the previous edit.
 * 2. This component will then navigate to the original edit dialog, restoring the original parameters. 
 * 
 * TODO: not sure if this is the best way to do this...
 */
@Component({
  selector: 'app-edit-reload',
  template: '',
})
export class EditReloadComponent {

  log = classLog({EditReloadComponent});

  constructor(router: Router, route: ActivatedRoute) {
    const l = this.log.fn('constructor', null, '🔄️');
    const p = route.snapshot.params as EditUrlParams;
    const url = UrlHelpers.newUrlIfCurrentContainsOldUrl(route, `edit/refresh/${p.items}`, `edit/${p.items}`);
    if (!url) return l.rNull('No URL to navigate to');
    router.navigate([url]);
    l.r('✅ refresh complete');
  }
}
