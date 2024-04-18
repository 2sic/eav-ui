import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, pairwise, startWith, Subscription } from 'rxjs';
import { SiteLanguagePermissions } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';
import { BaseComponent } from '../../../shared/components/base-component/base.component';
import { IdFieldComponent } from '../../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { LanguagesPermissionsActionsComponent } from './languages-permissions-actions/languages-permissions-actions.component';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions/languages-permissions-actions.models';
import { AsyncPipe } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-language-permissions',
    templateUrl: './language-permissions.component.html',
    styleUrls: ['./language-permissions.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        SharedComponentsModule,
        MatIconModule,
        RouterOutlet,
        AgGridModule,
        MatDialogActions,
        AsyncPipe,
    ],
})
export class LanguagePermissionsComponent extends BaseComponent implements OnInit, OnDestroy {
  languages$: BehaviorSubject<SiteLanguagePermissions[] | undefined>;
  gridOptions: GridOptions;

  viewModel$: Observable<LanguagePermissionsViewModel>;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<LanguagePermissionsComponent>,
    private zoneService: ZoneService,
  ) {
    super(router, route);
    this.subscription = new Subscription();
    this.languages$ = new BehaviorSubject<SiteLanguagePermissions[] | undefined>(undefined);
    this.gridOptions = this.buildGridOptions();
  }

  ngOnInit(): void {
    this.getLanguages();
    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { this.getLanguages(); }));
    this.viewModel$ = combineLatest([this.languages$]).pipe(
      map(([languages]) => ({ languages }))
    );
  }

  ngOnDestroy(): void {
    this.languages$.complete();
    super.ngOnDestroy();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  openPermissions(language: SiteLanguagePermissions): void {
    this.router.navigate([GoToPermissions.getUrlLanguage(language.NameId)], { relativeTo: this.route });
  }

  private getLanguages(): void {
    this.zoneService.getLanguagesPermissions().subscribe({
      error: () => {
        this.languages$.next(undefined);
      },
      next: (languages) => {
        this.languages$.next(languages);
      },
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const language: SiteLanguagePermissions = params.data;
            return language.Code;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<SiteLanguagePermissions> = {
              tooltipGetter: (language) => `ID: ${language.Code}`,
            };
            return params;
          })(),
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const language: SiteLanguagePermissions = params.data;
            return language.Culture;
          },
        },
        {
          width: 42,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: LanguagesPermissionsActionsComponent,
          cellRendererParams: (() => {
            const params: LanguagesPermissionsActionsParams = {
              onOpenPermissions: (language) => this.openPermissions(language),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

interface LanguagePermissionsViewModel {
  languages: SiteLanguagePermissions[] | undefined
}
