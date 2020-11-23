import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { DevRestNavigation, fireOnStartAndWhenSubDialogCloses } from '..';
import { PipelinesService } from '../../app-administration/services';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DevRestQueryTemplateVars } from './dev-rest-query-template-vars';

@Component({
  selector: 'app-dev-rest-query',
  templateUrl: './dev-rest-query.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestQueryComponent implements OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  templateVars$: Observable<DevRestQueryTemplateVars>;

  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<DevRestQueryComponent>,
    private router: Router,
    private route: ActivatedRoute,
    pipelinesService: PipelinesService,
    permissionsService: PermissionsService,
  ) {

    // Build Query Stream
    const query$ = combineLatest([
      route.paramMap.pipe(map(pm => pm.get(DevRestNavigation.paramQuery))),
      pipelinesService.getAll(eavConstants.contentTypes.query).pipe(share()),
    ]).pipe(
      map(([queryGuid, all]) => all.find(q => q.Guid === queryGuid)),
      share()
    );

    // Build Permissions Stream
    // This is triggered on start and everything a sub-dialog closes
    const permissions$ = combineLatest([
      fireOnStartAndWhenSubDialogCloses(this.router, this.route),
      route.paramMap.pipe(map(pm => pm.get(DevRestNavigation.paramQuery))),
    ]).pipe(
      switchMap(([_, queryName])  => {
        return permissionsService.getAll(eavConstants.metadata.entity.type, eavConstants.keyTypes.guid, queryName);
      }),
      share()
    );

    // Build variables for template
    this.templateVars$ = combineLatest([query$, permissions$]).pipe(
      map(([query, permissions]) => ({ query, permissions })),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
