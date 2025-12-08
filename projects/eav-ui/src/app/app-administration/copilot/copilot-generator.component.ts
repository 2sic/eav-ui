import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, input, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EntityLightIdentifier } from 'projects/edit-types/src/EntityLight';
import { Guid } from 'projects/field-string-wysiwyg/src/shared/guid';
import { map, Observable, of, take } from 'rxjs';
import { transient } from '../../../../../core';
import { DialogRoutingState } from '../../edit/dialog/dialogRouteState.model';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { RichResult } from '../../shared/models/rich-result';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { EntityService } from '../../shared/services/entity.service';
import { ContentTypesService } from '../services';
import { ConfirmDeleteDialogComponent } from '../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmDeleteDialogData } from '../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { CopilotService } from './copilot-service';

type DataCopilotConfiguration = {
  Guid: Guid;
  Id: number;
  Title?: string;
};

@Component({
  selector: 'app-copilot-generator',
  templateUrl: './copilot-generator.component.html',
  styleUrls: ['./copilot-generator.component.scss'],
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

  private copilotSvc = transient(CopilotService);
  private entitySvc = transient(EntityService);
  #dialogRouter = transient(DialogRoutingService);
  #router = transient(Router);
  #matDialog = transient(MatDialog);
  #viewContainerRef = inject(ViewContainerRef);
  #contentTypeSvc = transient(ContentTypesService);
  #snackBar = transient(MatSnackBar);
  #context = transient(Context);
  #http = transient(HttpClient);

  private readonly copilotConfigurationGuid = 'b08dcd23-2eb0-4a5e-a3d0-3178d2aae451';

  webApiGeneratedCode: string = 'admin/code/generateDataModels';
  editions$ = this.copilotSvc.getEditions();

  showConfigurationDropdown = signal(false);

  entities$: Observable<EntityLightIdentifier[]>;
  selectedEntity?: DataCopilotConfiguration;

  generators$ = this.copilotSvc.getGenerators()
    .pipe(
      map((gens) => gens.filter(g => g.outputType === this.outputType()))
    );

  selectedGenerator$ = this.generators$.pipe(map(gens => gens.find(g => g.name === this.selectedGenerator)));

  selectedGenerator = '';
  selectedEdition = '';

  ngOnInit(): void {
    this.generators$.pipe(take(1)).subscribe(gens => {
      this.selectedGenerator = gens[0]?.name ?? '';
    });
    this.copilotSvc.specs.pipe(take(1)).subscribe(specs => {
      this.selectedEdition = specs.editions.find(e => e.isDefault)?.name ?? '';
    });
    this.fetchEntities();

    // Subscribe to route changes to refresh entities when dialog closes
    this.#dialogRouter.doOnDialogClosed(() => this.fetchEntities());
  }

  fetchEntities() {
    this.entities$ = this.entitySvc.getEntities$(of({ contentTypeName: this.copilotConfigurationGuid }));
  }

  editConfiguration(config: DataCopilotConfiguration) {
    const form: EditForm = {
      items: [EditPrep.editId(config.Id)]
    };

    const subRoute = this.#dialogRouter.urlSubRoute(`edit/${convertFormToUrl(form)}`);
    const routeSegments = subRoute.split('/').filter(Boolean);

    this.#router.navigate(routeSegments, {
      state: {
        returnValue: true,
      } satisfies DialogRoutingState,
    });
  }

  addConfiguration() {
    const form: EditForm = {
      items: [EditPrep.newFromType(this.copilotConfigurationGuid)]
    };

    const subRoute = this.#dialogRouter.urlSubRoute(`edit/${convertFormToUrl(form)}`);
    const routeSegments = subRoute.split('/').filter(Boolean);

    this.#router.navigate(routeSegments, {
      state: {
        returnValue: true,
      } satisfies DialogRoutingState,
    });
  }

  deleteConfiguration(contentType: DataCopilotConfiguration) {
    const data: ConfirmDeleteDialogData = {
      entityId: contentType.Id,
      entityTitle: contentType.Title,
      message: "Are you sure you want to delete? ",
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
        this.#contentTypeSvc.delete(contentType as any).subscribe(_ => {
          this.#snackBar.open('Deleted', null, { duration: 2000 });
          this.fetchEntities();
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
        appId: this.#context.appId.toString(),
        edition: this.selectedEdition,
        generator: this.selectedGenerator,
      }
    }).subscribe(d => {
      this.#snackBar.open(d.message + `\n (this took ${d.timeTaken}ms)`, null, { duration: 5000, });
    });
  }
}
