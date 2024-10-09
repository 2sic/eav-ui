import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../../core';
import { SiteLanguagePermissions } from '../../../apps-management/models/site-language.model';
import { ZoneService } from '../../../apps-management/services/zone.service';
import { GoToPermissions } from '../../../permissions';
import { ColumnDefinitions } from '../../../shared/ag-grid/column-definitions';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../../shared/constants/default-grid-options.constants';
import { SxcGridModule } from '../../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { LanguagesPermissionsActionsComponent } from './languages-permissions-actions/languages-permissions-actions.component';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions/languages-permissions-actions.models';

@Component({
  selector: 'app-language-permissions',
  templateUrl: './language-permissions.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatDialogActions,
    SxcGridModule,
  ],
})
export class LanguagePermissionsComponent implements OnInit {
  gridOptions: GridOptions = this.#buildGridOptions();

  languages = signal<SiteLanguagePermissions[]>([]);

  #zoneService = transient(ZoneService);
  #dialogRouting = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<LanguagePermissionsComponent>,
  ) { }

  ngOnInit(): void {
    this.getLanguages();
    this.#dialogRouting.doOnDialogClosed(() => { this.getLanguages(); });
  }

  closeDialog(): void {
    this.dialog.close();
  }

  openPermissions(language: SiteLanguagePermissions): void {
    this.#dialogRouting.navRelative([GoToPermissions.getUrlLanguage(language.NameId)]);
  }

  private getLanguages(): void {
    this.#zoneService.getLanguagesPermissions().subscribe({
      error: () => {
        this.languages.set(undefined);
      },
      next: (languages) => {
        this.languages.set(languages);
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
          valueGetter: (p: { data: SiteLanguagePermissions }) => p.data.Culture,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight1,
          cellRenderer: LanguagesPermissionsActionsComponent,
          cellRendererParams: (() => {
            const params: LanguagesPermissionsActionsParams = {
              onOpenPermissions: (lang) => this.openPermissions(lang),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}


