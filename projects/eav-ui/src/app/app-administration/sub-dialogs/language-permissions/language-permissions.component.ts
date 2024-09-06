import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { SiteLanguagePermissions } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { LanguagesPermissionsActionsComponent } from './languages-permissions-actions/languages-permissions-actions.component';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions/languages-permissions-actions.models';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../../../core';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-language-permissions',
  templateUrl: './language-permissions.component.html',
  styleUrls: ['./language-permissions.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatDialogActions,
    AsyncPipe,
    SxcGridModule,
  ],
})
export class LanguagePermissionsComponent implements OnInit, OnDestroy {
  languages$ = new BehaviorSubject<SiteLanguagePermissions[] | undefined>(undefined);
  gridOptions: GridOptions;

  viewModel$: Observable<LanguagePermissionsViewModel>;

  #zoneService = transient(ZoneService);
  #dialogRouting = transient(DialogRoutingService);

  constructor(
    private dialogRef: MatDialogRef<LanguagePermissionsComponent>,
  ) {
    // @2dg proabably move this up to the definition of the variable...
    this.gridOptions = this.#buildGridOptions();
  }

  ngOnInit(): void {
    this.getLanguages();
    this.#dialogRouting.doOnDialogClosed(() => { this.getLanguages(); });
    // TODO: @2dg - this should be easy to get rid of #remove-observables
    this.viewModel$ = combineLatest([this.languages$]).pipe(
      map(([languages]) => ({ languages }))
    );
  }

  ngOnDestroy(): void {
    this.languages$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  openPermissions(language: SiteLanguagePermissions): void {
    this.#dialogRouting.navRelative([GoToPermissions.getUrlLanguage(language.NameId)]);
  }

  private getLanguages(): void {
    this.#zoneService.getLanguagesPermissions().subscribe({
      error: () => {
        this.languages$.next(undefined);
      },
      next: (languages) => {
        this.languages$.next(languages);
      },
    });
  }

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          field: 'Code',
          filter: 'agTextColumnFilter',
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
