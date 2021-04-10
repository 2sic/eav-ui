import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { WebApi } from '../../app-administration/models/web-api.model';
import { WebApisService } from '../../app-administration/services/web-apis.service';
import { DevRestCustomTemplateVars } from './custom-template-vars';

@Component({
  selector: 'app-dev-rest-custom',
  templateUrl: './custom.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestCustomComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  templateVars$: Observable<DevRestCustomTemplateVars>;

  private webApi$ = new Subject<WebApi>();
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<DevRestCustomComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private webApisService: WebApisService,
  ) {
    this.templateVars$ = combineLatest([this.webApi$]).pipe(
      map(([webApi]) => ({ webApi })),
    );
  }

  ngOnInit() {
    this.fetchData();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.webApi$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchData() {
    const webApiPath = decodeURIComponent(this.route.snapshot.parent.paramMap.get('webApiPath'));

    this.webApisService.getAll().subscribe(webApis => {
      const webApi = webApis.find(w => w.path === webApiPath);
      this.webApi$.next(webApi);
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
