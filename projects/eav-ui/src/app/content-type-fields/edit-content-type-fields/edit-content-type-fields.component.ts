import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostBinding, linkedSignal, QueryList, Signal, signal, ViewChild, ViewChildren } from '@angular/core';
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
import { catchError, concatMap, filter, of, toArray } from 'rxjs';
import { transient } from '../../../../../core';
import { fieldNameError, fieldNamePattern } from '../../app-administration/constants/field-name.patterns';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { BaseComponent } from '../../shared/components/base.component';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { ContentTypesFieldsService } from '../../shared/fields/content-types-fields.service';
import { DataTypeCatalog } from '../../shared/fields/data-type-catalog';
import { Field, FieldInputTypeOption } from '../../shared/fields/field.model';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { computedObj } from '../../shared/signals/signal.utilities';
import { calculateTypeIcon, calculateTypeLabel } from '../content-type-fields.helpers';
import { ReservedNamesValidatorDirective } from './reserved-names.directive';

interface Hints {
  input: string;
  data: string;
}

type FieldSubset = Pick<Field, 'Id' | 'Type' | 'InputType' | 'StaticName' | 'IsTitle' | 'SortOrder'>;

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
    TranslateModule,
    FieldHintComponent,
  ]
})
export class EditContentTypeFieldsComponent extends BaseComponent implements AfterViewInit {
  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { read: NgForm }) private form: NgForm;
  @ViewChildren('autoFocusInputField') autoFocusInputField!: QueryList<ElementRef>;

  #typesSvc = transient(ContentTypesService);
  #typesFieldsSvc = transient(ContentTypesFieldsService);

  constructor(
    protected dialog: MatDialogRef<EditContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    super();
    this.dialog.disableClose = true;
    this.subscriptions.add(
      this.dialog.backdropClick().subscribe(_ => {
        if (this.form.dirty) {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to close this dialog?');
          if (!confirmed) return;
        }
        this.dialog.close();
      })
    );
  }

  // External functions / constants to pass to the view
  fieldNamePattern = fieldNamePattern;
  fieldNameError = fieldNameError;
  findIcon = calculateTypeIcon;
  findLabel = calculateTypeLabel;

  /** Edit mode is either not set (new fields) or edit-name / edit-inputType */
  editMode = this.route.snapshot.paramMap.get('editMode') as 'name' | 'inputType';
  filteredInputTypeOptions: FieldInputTypeOption[][] = [];
  saving = signal(false);

  /** Data types such as string, number, ... */
  dataTypes = this.#typesFieldsSvc.dataTypes();

  #inputTypeOptions = this.#typesFieldsSvc.getInputTypes();
  #contentTypeSig = this.#typesSvc.getType(this.route.snapshot.paramMap.get('contentTypeStaticName')).value;

  // Existing fields - to setup reserved names and initialize the fields
  existingFieldsLazy = computedObj<Signal<Field[]>>('rawFields', () => {
    const contentType = this.#contentTypeSig();
    return contentType
      ? this.#typesFieldsSvc.getFieldsSig(contentType.NameId)
      : signal([]);
  });

  fields = (() => {
    // Get the fields once the data is ready
    const initial = computedObj('fields', () => {
      const fields = this.existingFieldsLazy()();
      if (this.editMode != null) {
        if (fields.length === 0) return [];
        const routeId = this.route.snapshot.paramMap.get('id');
        const editFieldId = routeId ? parseInt(routeId, 10) : null;
        const editField = fields.find(field => field.Id === editFieldId);
        return [editField];
      } else
        return this.#generateNewList(fields.length);
    });

    return linkedSignal({
      source: initial,
      computation: fields => fields,
    });
  })();

  // Figure out the reserved names which should not be used as field names
  #reservedNamesSystem = this.#typesFieldsSvc.reservedNames();
  reservedNames = computedObj('reservedNamesAll', () => {
    // setup watchers
    const fields = this.existingFieldsLazy()();
    const reservedNames = this.#reservedNamesSystem();
    if (fields.length === 0)
      return reservedNames;
    const merged = ReservedNamesValidatorDirective.mergeReserved(reservedNames, fields);
    
    // If we're about to rename, allow the current name to be reused
    if (this.editMode === 'name')
      delete merged[fields[0].StaticName];
    return merged;
  });

  ngAfterViewInit(): void {
    // Wait for the inputFields to be available
    // But delay execution to ensure the view is fully rendered
    if (this.autoFocusInputField)
      setTimeout(() => this.autoFocusInputField.first?.nativeElement?.focus(), 250);
  }

  #generateNewList(existingFieldCount: number): FieldSubset[] {
    return [...Array(8).keys()].map(k => ({
      Id: 0,
      Type: DataTypeCatalog.String,
      InputType: InputTypeCatalog.StringDefault,
      StaticName: '',
      // first one is title, if there were no fields before
      IsTitle: existingFieldCount === 0 && k === 0,
      SortOrder: existingFieldCount + k + 1,
    } satisfies FieldSubset));
  }

  /** 2D array of all possible options (by field index) */
  inputTypeOptions = computedObj('inputTypeOptions', () => {
    const all = this.#inputTypeOptions();
    const fields = this.fields();
    return fields.map((field, i) => {
      return all.filter(option => option.dataType === field.Type.toLocaleLowerCase());
    });
  });

  updateFieldPart(index: number, patch: Partial<Field>) {
    this.fields.update(fields => [...fields].map((f, i) => (i !== index) ? f : ({ ...f, ...patch })));
  }

  setFieldType(index: number, type: string) {
    // First update the field, as we'll access this again indirectly through other signals
    this.updateFieldPart(index, { Type: type });

    // Check if it has a xxx-default like string-default in the list
    const defaultInputName = type.toLocaleLowerCase() + InputTypeCatalog.DefaultSuffix;
    const options = this.inputTypeOptions()[index];
    const inputName = options.find(option => option.inputType === defaultInputName)?.inputType
      ?? options[0].inputType;
    this.updateFieldPart(index, { InputType: inputName });
  }

  hints = computedObj('hints', () => {
    const fields = this.fields();
    return fields.map((field, i) => {
      const dataType = this.dataTypes().find(dataType => dataType.name === field.Type);
      const inputType = this.#inputTypeOptions().find(option => option.inputType === field.InputType);
      return {
        data: dataType?.description ?? '',
        input: inputType?.isObsolete
          ? `OBSOLETE - ${inputType.obsoleteMessage}`
          : inputType?.description ?? '',
      } satisfies Hints;
    });
  });

  getInputTypeOption(inputName: string) {
    return this.#inputTypeOptions().find(option => option.inputType === inputName);
  }

  save() {
    this.saving.set(true);
    this.snackBar.open('Saving...');

    // Prepare finalize-action to reuse below
    const doneAndClose = () => {
      this.saving.set(false);
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.dialog.close();
    }

    if (this.editMode != null) {
      const field = this.fields()[0];
      if (this.editMode === 'name') {
        this.#typesFieldsSvc
          .rename(field.Id, this.#contentTypeSig().Id, field.StaticName)
          .subscribe(() => doneAndClose());
      } else if (this.editMode === 'inputType') {
        this.#typesFieldsSvc
          .updateInputType(field.Id, field.StaticName, field.InputType)
          .subscribe(() => doneAndClose());
      }
    } else {
      of(...this.fields())
        .pipe(
          filter(field => !!field.StaticName),
          concatMap(field =>
            this.#typesFieldsSvc.add(field, this.#contentTypeSig().Id).pipe(catchError(_ => of(null)))
          ),
          toArray(),
        )
        .subscribe(() => doneAndClose());
    }
  }
}
