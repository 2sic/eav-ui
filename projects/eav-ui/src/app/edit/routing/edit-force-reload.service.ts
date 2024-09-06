import { inject, Injectable, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { filter, map, Subscription } from 'rxjs';
import { ItemHistoryResult } from '../../item-history/models/item-history-result.model';
import { EditEntryComponent } from '../dialog/entry/edit-entry.component';
import { EditUrlParams } from './edit-url-params.model';
import { UrlHelpers } from '../shared/helpers';
import { EavLogger } from '../../shared/logging/eav-logger';
import { NavigateFormResult } from '../shared/services/edit-routing.service';
import { transient } from '../../core';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

const logSpecs = {
  enabled: true,
  name: 'EditRoutingReloadWatcher',
  specs: {
    all: true,
    watchToRefreshOnVersionsClosed: true,
  }
}

/**
 * Special helper to watch for history-dialog closing.
 */
@Injectable()
export class EditForceReloadService implements OnDestroy {

  log = new EavLogger(logSpecs);

  #dialogRef = inject(MatDialogRef<EditEntryComponent>);
  #dialogRouter = transient(DialogRoutingService);

  ngOnDestroy() {
    this.#watcher?.unsubscribe();
  }
  #watcher: Subscription;

  watchToRefreshOnVersionsClosed() {
    const l = this.log.fnIf('watchToRefreshOnVersionsClosed');
    this.#watcher = this.#dialogRouter.childDialogClosed$().pipe(
      map(() => this.#dialogRouter.state<ItemHistoryResult>()),
      filter(result => result?.refreshEdit === true),
    ).subscribe(_ => {
      const l2 = this.log.fnIf('watchToRefreshOnVersionsClosed', null, 'refreshEdit');
      l.a('version closed, refreshing edit dialog');
      const p = this.#dialogRouter.snapshot.params as EditUrlParams;
      const newUrl = UrlHelpers.newUrlIfCurrentContainsOldUrl(this.#dialogRouter.route,`edit/${p.items}`, `edit/refresh/${p.items}`);
      if (newUrl == null) return l2.end('no change');
      this.#dialogRef.close({ navigateUrl: newUrl } satisfies NavigateFormResult);
      l2.end(`routed away to :${newUrl}`);
    })
    l.end();
  }
}
