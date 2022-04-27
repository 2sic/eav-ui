import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, map } from 'rxjs';
import { ContentType } from '../app-administration/models/content-type.model';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentImportDialogData } from './content-import-dialog.config';
import { ContentImport, EvaluateContentResult, ImportContentResult } from './models/content-import.model';
import { ContentImportService } from './services/content-import.service';

@Component({
  selector: 'app-content-import',
  templateUrl: './content-import.component.html',
  styleUrls: ['./content-import.component.scss'],
})
export class ContentImportComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  formValues: ContentImport;
  private contentType$ = new BehaviorSubject<ContentType>(null);
  private loading$ = new BehaviorSubject(false);
  private viewStates = {
    waiting: 0,
    default: 1,
    evaluated: 2,
    imported: 3,
  };
  private viewStateSelected$ = new BehaviorSubject<number>(this.viewStates.default);
  private evaluationResult$ = new BehaviorSubject<EvaluateContentResult>(null);
  private importResult$ = new BehaviorSubject<ImportContentResult>(null);
  templateVars$ = combineLatest([
    this.contentType$, this.loading$, this.viewStateSelected$, this.evaluationResult$, this.importResult$,
  ]).pipe(
    map(([contentType, loading, viewStateSelected, evaluationResult, importResult]) =>
      ({ contentType, loading, viewStateSelected, evaluationResult, importResult })),
  );
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
    private dialogRef: MatDialogRef<ContentImportComponent>,
    private route: ActivatedRoute,
    private contentImportService: ContentImportService,
    private appDialogConfigService: AppDialogConfigService,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit() {
    this.loading$.next(true);
    const contentType$ = this.contentTypesService.retrieveContentType(this.contentTypeStaticName);
    const dialogSettings$ = this.appDialogConfigService.getDialogSettings();
    forkJoin([contentType$, dialogSettings$]).subscribe(([contentType, dialogSettings]) => {
      this.contentType$.next(contentType);
      this.formValues = {
        defaultLanguage: dialogSettings.Context.Language.Primary,
        contentType: this.contentTypeStaticName,
        file: this.dialogData.files != null ? this.dialogData.files[0] : null,
        resourcesReferences: 'Keep',
        clearEntities: 'None',
      };
      this.loading$.next(false);
    });
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.loading$.complete();
    this.viewStateSelected$.complete();
    this.evaluationResult$.complete();
    this.importResult$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  evaluateContent() {
    this.viewStateSelected$.next(this.viewStates.waiting);
    this.contentImportService.evaluateContent(this.formValues).subscribe(result => {
      this.evaluationResult$.next(result);
      this.viewStateSelected$.next(this.viewStates.evaluated);
    });
  }

  importContent() {
    this.viewStateSelected$.next(this.viewStates.waiting);
    this.contentImportService.importContent(this.formValues).subscribe(result => {
      this.importResult$.next(result);
      this.viewStateSelected$.next(this.viewStates.imported);
    });
  }

  back() {
    this.viewStateSelected$.next(this.viewStates.default);
    this.evaluationResult$.next(null);
  }

  fileChange(event: Event) {
    this.formValues.file = (event.target as HTMLInputElement).files[0];
  }

  filesDropped(files: File[]) {
    const importFile = files[0];
    this.formValues.file = importFile;
  }
}
