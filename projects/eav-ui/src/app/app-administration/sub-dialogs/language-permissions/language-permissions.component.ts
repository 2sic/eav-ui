import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, Subscription } from 'rxjs';
import { SiteLanguagePermissions } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';
import { BaseComponent } from '../../../shared/components/base-component/base.component';
import { IdFieldComponent } from '../../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { LanguagesPermissionsActionsComponent } from './languages-permissions-actions/languages-permissions-actions.component';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions/languages-permissions-actions.models';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';

@Component({
  selector: 'app-language-permissions',
  templateUrl: './language-permissions.component.html',
  styleUrls: ['./language-permissions.component.scss'],
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
          ...ColumnDefinitions.Id,
          field: 'Code',
          filter: 'agTextColumnFilter',
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<SiteLanguagePermissions> = {
              tooltipGetter: (language) => `ID: ${language.Code}`,
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          sort: 'asc',
          valueGetter: (params) => {
            const language: SiteLanguagePermissions = params.data;
            return language.Culture;
          },
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight1,
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
