import { Component, HostBinding, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { transient } from '../../../../core';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { DialogConfigAppService } from '../app-administration/services/dialog-config-app.service';
import { DragAndDropDirective } from '../shared/directives/drag-and-drop.directive';
import { ContentImportDialogData } from './content-import-dialog.config';
import { ContentImport, EvaluateContentResult, ImportContentResult } from './models/content-import.model';
import { ContentImportService } from './services/content-import.service';

@Component({
  selector: 'app-content-import',
  templateUrl: './content-import.component.html',
  styleUrls: ['./content-import.component.scss'],
  imports: [
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatDialogActions,
    DragAndDropDirective,
  ]
})
export class ContentImportComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  private contentImportService = transient(ContentImportService);
  private contentTypesService = transient(ContentTypesService);
  private dialogConfigSvc = transient(DialogConfigAppService);

  formValues: ContentImport;

  private viewStates = {
    waiting: 0,
    default: 1,
    evaluated: 2,
    imported: 3,
  };

  contentType = signal<ContentType>(null);
  viewStateSelected = signal(this.viewStates.default);
  evaluationResult = signal<EvaluateContentResult>(null);
  importResult = signal<ImportContentResult>(null);

  errors: Record<number, string> = {
    0: 'Unknown error occured.',
    1: 'Selected content-type does not exist.',
    2: 'Document is not a valid XML file.',
    3: 'Selected content-type does not match the content-type in the XML file.',
    4: 'The language is not supported.',
    5: 'The document does not specify all languages for all entities.',
    6: 'Language reference cannot be parsed, the language is not supported.',
    7: 'Language reference cannot be parsed, the read-write protection is not supported.',
    8: 'Value cannot be read, because of it has an invalid format.'
  };

  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ContentImportDialogData,
    private dialog: MatDialogRef<ContentImportComponent>,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const contentTypeTemp = this.contentTypesService.retrieveContentType(this.contentTypeStaticName);
    const dialogSettings$ = this.dialogConfigSvc.getCurrent$();
    forkJoin([contentTypeTemp, dialogSettings$]).subscribe(([contentType, dialogSettings]) => {
      this.contentType.set(contentType);
      this.formValues = {
        defaultLanguage: dialogSettings.Context.Language.Primary,
        contentType: this.contentTypeStaticName,
        file: this.dialogData.files != null ? this.dialogData.files[0] : null,
        resourcesReferences: 'Keep',
        clearEntities: 'None',
      };
    });
  }

  closeDialog() {
    this.dialog.close();
  }

  evaluateContent() {
    this.viewStateSelected.set(this.viewStates.waiting);
    this.contentImportService.evaluateContent(this.formValues).subscribe(result => {
      this.evaluationResult.set(result);
      this.viewStateSelected.set(this.viewStates.evaluated);
    });
  }

  importContent() {
    this.viewStateSelected.set(this.viewStates.waiting);
    this.contentImportService.importContent(this.formValues).subscribe(result => {
      this.importResult.set(result);
      this.viewStateSelected.set(this.viewStates.imported);
    });
  }

  back() {
    this.viewStateSelected.set(this.viewStates.default);
    this.evaluationResult.set(null);
  }

  fileChange(event: Event) {
    this.formValues.file = (event.target as HTMLInputElement).files[0];
  }

  filesDropped(files: File[]) {
    const importFile = files[0];
    this.formValues.file = importFile;
  }
}
