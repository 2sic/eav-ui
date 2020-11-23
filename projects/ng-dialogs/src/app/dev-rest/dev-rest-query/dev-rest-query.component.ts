import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { Query } from '../../app-administration/models/query.model';
import { PipelinesService } from '../../app-administration/services';
import { Permission } from '../../permissions/models/permission.model';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DevRestQueryTemplateVars } from './dev-rest-query-template-vars';

@Component({
  selector: 'app-dev-rest-query',
  templateUrl: './dev-rest-query.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestQueryComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  templateVars$: Observable<DevRestQueryTemplateVars>;

  private query$ = new Subject<Query>();
  private permissions$ = new Subject<Permission[]>();
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<DevRestQueryComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private pipelinesService: PipelinesService,
    private permissionsService: PermissionsService,
  ) {
    this.templateVars$ = combineLatest([this.query$, this.permissions$]).pipe(
      map(([query, permissions]) => ({
        query,
        permissions,
      })),
    );
  }

  ngOnInit() {
    this.fetchData();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.query$.complete();
    this.permissions$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchData() {
    const queryGuid = this.route.snapshot.parent.paramMap.get('queryGuid');

    this.pipelinesService.getAll(eavConstants.contentTypes.query).subscribe(queries => {
      const query = queries.find(q => q.Guid === queryGuid);
      this.query$.next(query);
    });

    const targetType = eavConstants.metadata.entity.type;
    const keyType = eavConstants.keyTypes.guid;
    this.permissionsService.getAll(targetType, keyType, queryGuid).subscribe(permissions => {
      this.permissions$.next(permissions);
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchData();
      })
    );
  }

}
