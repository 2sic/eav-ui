import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, map, pairwise, startWith, Subscription } from 'rxjs';
import { SiteLanguagePermissions } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';
import { IdFieldComponent } from '../../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { LanguagesPermissionsActionsComponent } from '../../ag-grid-components/languages-permissions-actions/languages-permissions-actions.component';
import { LanguagesPermissionsActionsParams } from '../../ag-grid-components/languages-permissions-actions/languages-permissions-actions.models';

@Component({
  selector: 'app-language-permissions',
  templateUrl: './language-permissions.component.html',
  styleUrls: ['./language-permissions.component.scss'],
})
export class LanguagePermissionsComponent implements OnInit, OnDestroy {
  languages$: BehaviorSubject<SiteLanguagePermissions[] | undefined>;
  modules = AllCommunityModules;
  gridOptions: GridOptions;

  private subscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<LanguagePermissionsComponent>,
    private zoneService: ZoneService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.subscription = new Subscription();
    this.languages$ = new BehaviorSubject<SiteLanguagePermissions[] | undefined>(undefined);
    this.gridOptions = {
      ...defaultGridOptions,
      frameworkComponents: {
        idFieldComponent: IdFieldComponent,
        languagesPermissionsActionsComponent: LanguagesPermissionsActionsComponent,
      },
      columnDefs: [
        {
          headerName: 'ID', field: 'Code', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
          cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
          cellRendererParams: {
            tooltipGetter: (language: SiteLanguagePermissions) => `ID: ${language.Code}`,
          } as IdFieldParams,
        },
        {
          headerName: 'Name', field: 'Culture', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
          sort: 'asc', filter: 'agTextColumnFilter',
        },
        {
          width: 42, cellClass: 'secondary-action no-padding', cellRenderer: 'languagesPermissionsActionsComponent', pinned: 'right',
          cellRendererParams: {
            onOpenPermissions: (language) => this.openPermissions(language),
          } as LanguagesPermissionsActionsParams,
        },
      ],
    };
  }

  ngOnInit(): void {
    this.getLanguages();
    this.refreshOnChildClosed();
  }

  ngOnDestroy(): void {
    this.languages$.complete();
    this.subscription.unsubscribe();
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

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.getLanguages();
      })
    );
  }
}
