import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, signal, ViewContainerRef } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';
import { combineLatest, from, map, Observable } from 'rxjs';
import { transient } from '../../../../../core';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { FeatureSummary } from '../../features/models';
import { TippyDirective } from '../../shared/directives/tippy.directive';
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
import { CodeGenerator } from './code-generator';

type DataCopilotConfiguration = {
  Guid: string;
  Id: number;
  Title?: string;
  CodeGenerator?: string;
};

@Component({
  selector: 'app-copilot-generator',
  templateUrl: './copilot-generator.html',
  styleUrls: ['./copilot-generator.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    RouterOutlet,
    TippyDirective,
  ]
})
export class CopilotGeneratorComponent {
  outputType = input<string>();
  title = input<string>('Copilot Generator');

  #entitySvc = transient(EntityService);
  #dialogRouter = transient(DialogRoutingService);
  #matDialog = transient(MatDialog);
  #snackBar = transient(MatSnackBar);
  #context = transient(Context);
  #http = transient(HttpClient);
  #dataSvc = transient(SysDataService);
  #contentItemsSvc = transient(ContentItemsService);
  #viewContainerRef = inject(ViewContainerRef);

  readonly #copilotConfigurationGuid = 'b08dcd23-2eb0-4a5e-a3d0-3178d2aae451';
  readonly #webApiGeneratedCode = 'admin/code/generateDataModels';

  entities$: Observable<DataCopilotConfiguration[]>;
  displayedColumns = ['title', 'generator', 'actions'];

  // Get the data from multiple streams in one go.
  // Note that it's an httpResource, so it may still be loading, and the value may be null at the beginning
  #data = this.#dataSvc.getMany<{ default: CodeGenerator[], outputType: { name: string }[], feature: FeatureSummary[] }>({
    source: 'f512e44b-5b34-4a32-bfe3-d46d46800a7f', // Code Generators DataSource internal ID
    // Note 2dm: params temporarily turned off, as it affects all streams (accidentally) hiding the OutputType stream
    // params: computed(() => ({
    //   '$filter': `OutputType eq '${this.outputType()}'`,
    // })),
    streams: '*', // All streams
  });
  
  generators = computed(() => 
    // 2dm: had to temporarily move the outputType filter to here, as we can't use OData till I fix something
    this.#data.value()?.default.filter(g => g.outputType === this.outputType())
      ?? []  // may still be loading...
  );

  // generators = this.#dataSvc.get<CodeGenerator>({
  //   source: 'f512e44b-5b34-4a32-bfe3-d46d46800a7f', // Code Generators DataSource internal ID
  //   params: computed(() => ({
  //     '$filter': `OutputType eq '${this.outputType()}'`,
  //   })),
  //   streams: 'Default,OutputType',
  // });

  #generators$ = toObservable(this.generators);

  selectedGeneratorName = linkedSignal(() => this.generators()?.[0]?.name ?? '');

  selectedGenerator = computed(() => {
    const gens = this.generators();
    const selected = this.selectedGeneratorName();
    return gens.find(g => g.name === selected);
  });

  #editions = this.#dataSvc.get<{ name: string; label: string; description: string, isDefault: boolean }>({
    source: 'ToSic.Sxc.DataSources.AppEditions',
  });

  editions = computed(() => this.#editions().map(e => ({
    name: e.name,
    label: `/${e.name}/AppCode/Data`.replace(/\/\//g, '/'),
    description: (e.description || 'no description provided') + (e.isDefault ? ' ✅' : '')
  })));

  selectedEdition = linkedSignal(() => this.#editions().find(e => e.isDefault)?.name ?? '');

  selectedEntity?: DataCopilotConfiguration;
  showConfigurationDropdown = signal(false);

  ngOnInit(): void {
    this.fetchEntities();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchEntities());
  }

  fetchEntities(): void {
    const allEntities$ = from(this.#contentItemsSvc.getAllPromise(this.#copilotConfigurationGuid));

    this.entities$ = combineLatest([allEntities$, this.#generators$]).pipe(
      map(([data, currentGenerators]) => {
        const entities = data as DataCopilotConfiguration[];
        const generatorNames = new Set(currentGenerators.map(g => g.name));
        
        // Only show configurations that match one of the current generators
        return entities.filter(e => generatorNames.has(e.CodeGenerator));
      })
    );
  }

  editConfig(entity?: DataCopilotConfiguration): void {
    const target = entity ?? this.selectedEntity;
    const form: EditForm = {
      items: [target
        ? ItemIdHelper.editId(target.Id)
        : ItemIdHelper.newFromType(this.#copilotConfigurationGuid, {
            CodeGenerator: this.selectedGeneratorName(),
            OutputType: this.outputType()
          })
      ]
    };
    const url = convertFormToUrl(form);
    this.#dialogRouter.navRelative([`edit/${url}`]);
  }

  deleteConfiguration(entity?: DataCopilotConfiguration): void {
    const target = entity ?? this.selectedEntity;
    if (!target) {
      return;
    }
    const data: ConfirmDeleteDialogData = {
      entityId: target.Id,
      entityTitle: target.Title,
      message: 'Are you sure you want to delete?',
      hasDeleteSnackbar: true
    };

    this.#matDialog.open(ConfirmDeleteDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.#viewContainerRef,
      width: '400px',
    }).afterClosed().subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.#entitySvc.delete(
          this.#context.appId,
          this.#copilotConfigurationGuid,
            target.Id,
          false
        ).subscribe({
          next: () => {
            this.#snackBar.open('Deleted', null, { duration: 2000 });
              if (this.selectedEntity?.Id === target.Id) {
                this.selectedEntity = undefined;
              }
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

  generateForConfiguration(entity: DataCopilotConfiguration): void {
    this.#http.get<RichResult>(this.#webApiGeneratedCode, {
      params: {
        appId: this.#context.appId,
        edition: this.selectedEdition(),
        generator: this.selectedGeneratorName(),
        configurationId: entity.Id,
      }
    }).subscribe(result => {
      this.#snackBar.open(`${result.message} (took ${result.timeTaken}ms)`, null, { duration: 5000 });
    });
  }

  autoGeneratedCode(): void {
    const params: Record<string, string | number> = {
      appId: this.#context.appId,
      edition: this.selectedEdition(),
      generator: this.selectedGeneratorName(),
    };

    if (this.selectedEntity) {
      params.configurationId = this.selectedEntity.Id;
    }

    this.#http.get<RichResult>(this.#webApiGeneratedCode, { params }).subscribe(result => {
      this.#snackBar.open(`${result.message} (took ${result.timeTaken}ms)`, null, { duration: 5000 });
    });
  }

  toggleConfigurationDropdown(): void {
    this.showConfigurationDropdown.update(value => !value);
  }
}
