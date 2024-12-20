import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, catchError, concatMap, filter, forkJoin, of, share, switchMap, toArray } from 'rxjs';
import { Of, transient } from '../../../../../core';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ContentType } from '../../app-administration/models/content-type.model';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { BaseComponent } from '../../shared/components/base.component';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { DataTypeCatalog } from '../../shared/fields/data-type-catalog';
import { Field, FieldInputTypeOption } from '../../shared/fields/field.model';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { calculateTypeIcon, calculateTypeLabel } from '../content-type-fields.helpers';
import { ReservedNamesValidatorDirective } from './reserved-names.directive';

@Component({
  selector: 'app-edit-content-type-fields',
  templateUrl: './edit-content-type-fields.component.html',
  styleUrls: ['./edit-content-type-fields.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReservedNamesValidatorDirective,
    MatSelectModule,
    MatIconModule,
    MatOptionModule,
    NgClass,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    TranslateModule,
    FieldHintComponent,
  ]
})
export class EditContentTypeFieldsComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;
  @ViewChildren('autoFocusInputField') autoFocusInputField!: QueryList<ElementRef>;

  #typesSvc = transient(ContentTypesService);
  #typesFieldsSvc = transient(ContentTypesFieldsService);

  fields: Partial<Field>[] = [];
  reservedNames: Record<string, string> = {};
  editMode: 'name' | 'inputType';
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];
  dataTypeHints: string[] = [];
  inputTypeHints: string[] = [];
  fieldNamePattern = fieldNamePattern;
  fieldNameError = fieldNameError;
  findIcon = calculateTypeIcon;
  findLabel = calculateTypeLabel;
  loading$ = new BehaviorSubject(true);
  saving$ = new BehaviorSubject(false);

  #contentType: ContentType;
  dataTypes = this.#typesFieldsSvc.dataTypes();
  #inputTypeOptions = this.#typesFieldsSvc.getInputTypes();

  constructor(
    protected dialog: MatDialogRef<EditContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    super();
    this.dialog.disableClose = true;
    this.subscriptions.add(
      this.dialog.backdropClick().subscribe(event => {
        if (this.form.dirty) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) return;
        }
        this.dialog.close();
      })
    );
  }

  ngAfterViewInit(): void {
    // Wait for the inputFields to be available
    // But delay execution to ensure the view is fully rendered
    if (this.autoFocusInputField)
      setTimeout(() => this.autoFocusInputField.first?.nativeElement?.focus(), 250);
  }

  ngOnInit() {
    this.editMode = this.route.snapshot.paramMap.get('editMode') as 'name' | 'inputType';

    const typeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
    const contentType$ = this.#typesSvc
      .retrieveContentType(typeStaticName)
      .pipe(share());
    const fields$ = contentType$
      .pipe(switchMap(ct => this.#typesFieldsSvc.getFields(ct.NameId)));
    const reservedNames$ = this.#typesFieldsSvc.getReservedNames();

    forkJoin([contentType$, fields$, reservedNames$]).subscribe(
      ([contentType, fields, reservedNames]) => {
        this.#contentType = contentType;
        // this.existingFields = fields;

        this.reservedNames = ReservedNamesValidatorDirective.mergeReserved(reservedNames, fields);

        if (this.editMode != null) {
          const editFieldId = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id'), 10) : null;
          const editField = fields.find(field => field.Id === editFieldId);
          if (this.editMode === 'name')
            delete this.reservedNames[editField.StaticName];
          this.fields.push(editField);
        } else {
          for (let i = 1; i <= 8; i++) {
            this.fields.push({
              Id: 0,
              Type: DataTypeCatalog.String,
              InputType: InputTypeCatalog.StringDefault,
              StaticName: '',
              IsTitle: fields.length === 0,
              SortOrder: fields.length + i,
            });
          }
        }

        for (let i = 0; i < this.fields.length; i++) {
          this.filterInputTypeOptions(i);
          this.calculateHints(i);
        }

        this.loading$.next(false);
      }
    );
  }

  ngOnDestroy() {
    this.loading$.complete();
    this.saving$.complete();
    super.ngOnDestroy();
  }

  filterInputTypeOptions(index: number) {
    this.filteredInputTypeOptions[index] = this.#inputTypeOptions().filter(
      option => option.dataType === this.fields[index].Type.toLocaleLowerCase()
    );
  }

  resetInputType(index: number) {
    let defaultInputType = this.fields[index].Type.toLocaleLowerCase() + InputTypeCatalog.DefaultSuffix as Of<typeof InputTypeCatalog>;
    const defaultExists = this.filteredInputTypeOptions[index].some(option => option.inputType === defaultInputType);
    if (!defaultExists)
      defaultInputType = this.filteredInputTypeOptions[index][0].inputType;
    this.fields[index].InputType = defaultInputType;
  }

  calculateHints(index: number) {
    const field = this.fields[index];
    const selectedDataType = this.dataTypes().find(dataType => dataType.name === field.Type);
    const selectedInputType = this.#inputTypeOptions().find(option => option.inputType === field.InputType);
    this.dataTypeHints[index] = selectedDataType?.description ?? '';
    this.inputTypeHints[index] = selectedInputType?.isObsolete
      ? `OBSOLETE - ${selectedInputType.obsoleteMessage}`
      : selectedInputType?.description ?? '';
  }

  getInputTypeOption(inputName: string) {
    return this.#inputTypeOptions().find(option => option.inputType === inputName);
  }

  save() {
    this.saving$.next(true);
    this.snackBar.open('Saving...');

    // Prepare finalize-action to reuse below
    const doneAndClose = () => {
      this.saving$.next(false);
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.dialog.close();
    }

    if (this.editMode != null) {
      const field = this.fields[0];
      if (this.editMode === 'name') {
        this.#typesFieldsSvc
          .rename(field.Id, this.#contentType.Id, field.StaticName)
          .subscribe(() => doneAndClose());
      } else if (this.editMode === 'inputType') {
        this.#typesFieldsSvc
          .updateInputType(field.Id, field.StaticName, field.InputType)
          .subscribe(() => doneAndClose());
      }
    } else {
      of(...this.fields).pipe(
        filter(field => !!field.StaticName),
        concatMap(field =>
          this.#typesFieldsSvc.add(field, this.#contentType.Id).pipe(catchError(_ => of(null)))
        ),
        toArray(),
      ).subscribe(() => doneAndClose());
    }
  }
}
