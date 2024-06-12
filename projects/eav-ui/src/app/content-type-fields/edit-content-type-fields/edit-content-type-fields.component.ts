import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, concatMap, filter, forkJoin, map, of, share, Subscription, switchMap, toArray } from 'rxjs';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ContentType } from '../../app-administration/models/content-type.model';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { BaseComponent } from '../../shared/components/base.component';
import { DataTypeConstants } from '../constants/data-type.constants';
import { InputTypeStrict, InputTypeConstants } from '../constants/input-type.constants';
import { calculateTypeIcon, calculateTypeLabel } from '../content-type-fields.helpers';
import { Field, FieldInputTypeOption } from '../models/field.model';
import { ReservedNames } from '../models/reserved-names.model';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { calculateDataTypes, DataType } from './edit-content-type-fields.helpers';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { AddSharingFieldsComponent } from '../add-sharing-fields/add-sharing-fields.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ReservedNamesValidatorDirective } from './reserved-names.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';

@Component({
    selector: 'app-edit-content-type-fields',
    templateUrl: './edit-content-type-fields.component.html',
    styleUrls: ['./edit-content-type-fields.component.scss'],
    standalone: true,
    imports: [
        SharedComponentsModule,
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
    ],
})
export class EditContentTypeFieldsComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;

  fields: Partial<Field>[] = [];
  existingFields: Field[] = [];
  reservedNames: ReservedNames;
  editMode: 'name' | 'inputType';
  dataTypes: DataType[];
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];
  dataTypeHints: string[] = [];
  inputTypeHints: string[] = [];
  fieldNamePattern = fieldNamePattern;
  fieldNameError = fieldNameError;
  findIcon = calculateTypeIcon;
  findLabel = calculateTypeLabel;
  loading$ = new BehaviorSubject(true);
  saving$ = new BehaviorSubject(false);
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();

  private contentType: ContentType;
  private inputTypeOptions: FieldInputTypeOption[];

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private globalConfigService: GlobalConfigService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super();
    this.dialogRef.disableClose = true;
    this.subscriptions.add(
      this.dialogRef.backdropClick().subscribe(event => {
        if (this.form.dirty) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) { return; }
        }
        this.closeDialog();
      })
    );
  }

  ngOnInit() {
    this.editMode = this.route.snapshot.paramMap.get('editMode') as 'name' | 'inputType';

    const contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
    const contentType$ = this.contentTypesService.retrieveContentType(contentTypeStaticName).pipe(share());
    const fields$ = contentType$.pipe(switchMap(contentType => this.contentTypesFieldsService.getFields(contentType.StaticName)));
    const dataTypes$ = this.contentTypesFieldsService.typeListRetrieve().pipe(map(rawDataTypes => calculateDataTypes(rawDataTypes)));
    const inputTypes$ = this.contentTypesFieldsService.getInputTypesList();
    const reservedNames$ = this.contentTypesFieldsService.getReservedNames();

    forkJoin([contentType$, fields$, dataTypes$, inputTypes$, reservedNames$]).subscribe(
      ([contentType, fields, dataTypes, inputTypes, reservedNames]) => {
        this.contentType = contentType;
        this.dataTypes = dataTypes;
        this.inputTypeOptions = inputTypes;
        this.existingFields = fields;

        const existingFields: ReservedNames = {};
        fields.forEach(field => {
          existingFields[field.StaticName] = 'Field with this name already exists';
        });
        this.reservedNames = {
          ...reservedNames,
          ...existingFields,
        };

        if (this.editMode != null) {
          const editFieldId = this.route.snapshot.paramMap.get('id') ? parseInt(this.route.snapshot.paramMap.get('id'), 10) : null;
          const editField = fields.find(field => field.Id === editFieldId);
          if (this.editMode === 'name') {
            delete this.reservedNames[editField.StaticName];
          }
          this.fields.push(editField);
        } else {
          for (let i = 1; i <= 8; i++) {
            this.fields.push({
              Id: 0,
              Type: DataTypeConstants.String,
              InputType: InputTypeConstants.StringDefault,
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

  closeDialog() {
    this.dialogRef.close();
  }

  filterInputTypeOptions(index: number) {
    this.filteredInputTypeOptions[index] = this.inputTypeOptions.filter(
      option => option.dataType === this.fields[index].Type.toLocaleLowerCase()
    );
  }

  resetInputType(index: number) {
    let defaultInputType = this.fields[index].Type.toLocaleLowerCase() + InputTypeConstants.DefaultSuffix as InputTypeStrict;
    const defaultExists = this.filteredInputTypeOptions[index].some(option => option.inputType === defaultInputType);
    if (!defaultExists) {
      defaultInputType = this.filteredInputTypeOptions[index][0].inputType;
    }
    this.fields[index].InputType = defaultInputType;
  }

  calculateHints(index: number) {
    const selectedDataType = this.dataTypes.find(dataType => dataType.name === this.fields[index].Type);
    const selectedInputType = this.inputTypeOptions.find(inputTypeOption => inputTypeOption.inputType === this.fields[index].InputType);
    this.dataTypeHints[index] = selectedDataType?.description ?? '';
    this.inputTypeHints[index] = selectedInputType?.isObsolete
      ? `OBSOLETE - ${selectedInputType.obsoleteMessage}`
      : selectedInputType?.description ?? '';
  }

  getInputTypeOption(inputName: string) {
    return this.inputTypeOptions.find(option => option.inputType === inputName);
  }

  addSharedField() {
    this.dialog.open(AddSharingFieldsComponent, {
      autoFocus: false,
      width: '1600px',
      data: { contentType: this.contentType, existingFields: this.existingFields }
    });
  }

  save() {
    this.saving$.next(true);
    this.snackBar.open('Saving...');
    if (this.editMode != null) {
      const field = this.fields[0];
      if (this.editMode === 'name') {
        this.contentTypesFieldsService.rename(field.Id, this.contentType.Id, field.StaticName).subscribe(() => {
          this.saving$.next(false);
          this.snackBar.open('Saved', null, { duration: 2000 });
          this.closeDialog();
        });
      } else if (this.editMode === 'inputType') {
        this.contentTypesFieldsService.updateInputType(field.Id, field.StaticName, field.InputType).subscribe(() => {
          this.saving$.next(false);
          this.snackBar.open('Saved', null, { duration: 2000 });
          this.closeDialog();
        });
      }
    } else {
      of(...this.fields).pipe(
        filter(field => !!field.StaticName),
        concatMap(field =>
          this.contentTypesFieldsService.add(field, this.contentType.Id).pipe(catchError(error => of(null)))
        ),
        toArray(),
      ).subscribe(responses => {
        this.saving$.next(false);
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.closeDialog();
      });
    }
  }
}
