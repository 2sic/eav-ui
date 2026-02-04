import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntityLightIdentifier } from 'projects/edit-types/src/EntityLight';
import { Observable, of } from 'rxjs';
import { transient } from '../../../../../core';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { ItemIdHelper } from '../../shared/models/item-id-helper';
import { RichResult } from '../../shared/models/rich-result';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { EntityService } from '../../shared/services/entity.service';
import { SysDataService } from '../../shared/services/sys-data.service';
import { ConfirmDeleteDialogComponent } from '../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ConfirmDeleteDialogData } from '../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { CodeGeneratorNew } from './code-generator';

type DataCopilotConfiguration = {
  Guid: string;
  Id: number;
  Title?: string;
};

@Component({
  selector: 'app-copilot-generator',
  templateUrl: './copilot-generator.html',
  styleUrls: ['./copilot-generator.scss'],
  imports: [
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
  ]
})
export class CopilotGeneratorComponent {

  outputType = input<string>();
  title? = input<string>('Copilot Generator');

  // #copilotSvc = transient(CopilotService);
  #entitySvc = transient(EntityService);
  #dialogRouter = transient(DialogRoutingService);
  #matDialog = transient(MatDialog);
  #snackBar = transient(MatSnackBar);
  #context = transient(Context);
  #http = transient(HttpClient);

  #dataSvc = transient(SysDataService);

  #viewContainerRef = inject(ViewContainerRef);

  readonly #copilotConfigurationGuid = 'b08dcd23-2eb0-4a5e-a3d0-3178d2aae451';

  webApiGeneratedCode: string = 'admin/code/generateDataModels';
  // editions$ = this.#copilotSvc.getEditions();

  showConfigurationDropdown = signal(false);

  entities$: Observable<EntityLightIdentifier[]>;
  selectedEntity?: DataCopilotConfiguration;

  // generators$ = this.#copilotSvc.getGenerators()
  //   .pipe(
  //     map((gens) => gens.filter(g => g.outputType === this.outputType()))
  //   );

  // selectedGenerator$ = this.generators$.pipe(map(gens => gens.find(g => g.name === this.selectedGenerator)));

  // selectedGenerator = '';

  /** Load all the generators */
  generators = this.#dataSvc.get<CodeGeneratorNew>({
    source: 'ToSic.Sxc.DataSources.CodeGenerators',
    params: {
      '$filter': "OutputType eq 'DataModel'",
    }
  });

  /** The name of the selected generator */
  selectedGeneratorName = linkedSignal(() => this.generators()?.[0]?.Name ?? null);

  /** The selected generator object - to display more info */
  selectedGenerator = computed(() => {
    const gens = this.generators();
    const selected = this.selectedGeneratorName();
    return gens.find(g => g.Name === selected);
  });

  // selectedEdition = '';

  #editions = this.#dataSvc.get<{ Name: string; Label: string; Description: string, IsDefault: boolean }>({
    source: 'ToSic.Sxc.DataSources.AppEditions',
  });

  editions = computed(() => this.#editions().map(e => ({
    name: e.Name,
    label: `/${e.Name}/AppCode/Data`.replace(/\/\//g, '/'),
    description: (e.Description || "no description provided") + (e.IsDefault ? ' ✅' : '')
  })));

  /** The name of the selected generator */
  selectedEditionName = linkedSignal(() => this.#editions().find(e => e.IsDefault)?.Name ?? '');

  ngOnInit(): void {
    // this.generators$.pipe(take(1)).subscribe(gens => {
    //   this.selectedGenerator = gens[0]?.name ?? '';
    // });
    // this.#copilotSvc.specs.pipe(take(1)).subscribe(specs => {
    //   this.selectedEdition = specs.editions.find(e => e.isDefault)?.name ?? '';
    // });
    this.fetchEntities();

    // Subscribe to route changes to refresh entities when dialog closes
    this.#dialogRouter.doOnDialogClosed(() => this.fetchEntities());
  }

  fetchEntities() {
    this.entities$ = this.#entitySvc.getEntities$(of({ contentTypeName: this.#copilotConfigurationGuid }));
  }


  editConfig() {
    const form: EditForm = {
      items: [this.selectedEntity
        ? ItemIdHelper.editId(this.selectedEntity.Id)
        : ItemIdHelper.newFromType(this.#copilotConfigurationGuid)
      ]
    };

    const url = convertFormToUrl(form);
    this.#dialogRouter.navRelative([`edit/${url}`]); //
  }

  deleteConfiguration() {
    const selected = this.selectedEntity;
    const data: ConfirmDeleteDialogData = {
      entityId: selected.Id,
      entityTitle: selected.Title,
      message: "Are you sure you want to delete?  ",
      hasDeleteSnackbar: true
    };

    const confirmationDialogRef = this.#matDialog.open(ConfirmDeleteDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.#viewContainerRef,
      width: '400px',
    });

    confirmationDialogRef.afterClosed().subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.#entitySvc.delete(
          this.#context.appId,           // appId: number
          this.#copilotConfigurationGuid,// contentType: string
          selected.Id,                   // entityId: number
          false                          // force: boolean
        ).subscribe({
          next: () => {
            this.#snackBar.open('Deleted', null, { duration: 2000 });
            this.fetchEntities();
          },
          error: (error) => {
            console.error('Error deleting configuration:', error);
            this.#snackBar.open('Error deleting configuration', null, { duration: 3000 });
          }
        });
      }
    });
  }

  toggleConfigurationDropdown() {
    this.showConfigurationDropdown.set(!this.showConfigurationDropdown());
  }

  autoGeneratedCode() {
    this.#http.get<RichResult>(this.webApiGeneratedCode, {
      params: {
        appId: this.#context.appId,
        edition: this.selectedEditionName(),
        generator: this.selectedGeneratorName(),
        ...(this.selectedEntity ? { configurationId: this.selectedEntity.Id } : {}),
      }
    }).subscribe(d => {
      this.#snackBar.open(d.message + `\n (this took ${d.timeTaken}ms)`, null, { duration: 5000, });
    });
  }
}
