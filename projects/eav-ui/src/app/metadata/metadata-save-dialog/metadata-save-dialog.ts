import { NgClass } from '@angular/common';
import { Component, computed, HostBinding, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { distinctUntilChanged, startWith } from 'rxjs';
import { transient } from '../../../../../core';
import { ContentTypesService } from '../../app-administration/services';
import { isCtrlEnter } from '../../edit/dialog/main/keyboard-shortcuts';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../shared/constants/eav.constants';
import { DialogHeaderComponent } from "../../shared/dialog-header/dialog-header";
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { SaveCloseButtonFabComponent } from '../../shared/modules/save-close-button-fab/save-close-button-fab';
import { MetadataSaveFormValues } from './metadata-save-dialog.models';

@Component({
    selector: 'app-metadata-save-dialog',
    templateUrl: './metadata-save-dialog.html',
    styleUrls: ['./metadata-save-dialog.scss'],
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    NgClass,
    MatIconModule,
    MatSlideToggleModule,
    FieldHintComponent,
    ClickStopPropagationDirective,
    MatDialogActions,
    SaveCloseButtonFabComponent,
    DialogHeaderComponent,
]
})
export class MetadataSaveDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  formValid = signal(false);
  protected canSave = computed(() => this.formValid());

  dropdownInsertValue = dropdownInsertValue;
  guidedContentType = true;
  advancedMode = false;

  #contentTypesService = transient(ContentTypesService);

  constructor(
    private dialog: MatDialogRef<MetadataSaveDialogComponent>,
  ) { }

  scope = signal(eavConstants.scopes.default.value);
  scopeOptions = this.#contentTypesService.getScopesSig() as WritableSignal<ScopeOption[]>;

  contentTypes = this.#contentTypesService.getTypes(this.scope).value;

  ngOnInit(): void {
    this.buildForm();
    this.#watchKeyboardShortcuts();

    // Subscribe to form status changes to update signal
    this.form.statusChanges.subscribe(() => {
      this.formValid.set(this.form.valid);
    });
  }

  closeDialog(contentType?: string): void {
    this.dialog.close(contentType);
  }

  toggleGuidedContentType(guidedContentType: boolean): void {
    this.guidedContentType = guidedContentType;
  }

  toggleAdvancedMode(event: MatSlideToggleChange): void {
    this.advancedMode = event.checked;
  }

  saveAndClose(): void {
    const formValues: MetadataSaveFormValues = this.form.getRawValue();
    this.closeDialog(formValues.contentType);
  }
  
  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event) && this.canSave()) {
        event.preventDefault();
        this.saveAndClose();
      }
    });
  }

  private buildForm(): void {
    this.form = new UntypedFormGroup({});
    this.form.addControl('contentType', new UntypedFormControl(null, [Validators.required]));
    this.form.addControl('scope', new UntypedFormControl(eavConstants.scopes.default.value));

    this.form.controls.scope.valueChanges.pipe(
      startWith(this.form.controls.scope.value),
      distinctUntilChanged(),
    ).subscribe((newScope: string) => {
      // reset content types when scope changes
      if (this.form.controls.contentType.value != null) {
        this.form.controls.contentType.patchValue(null);
      }

      // add new scope on manual entry
      if (newScope === dropdownInsertValue) {
        newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
        if (!this.scopeOptions().some(option => option.value === newScope)) {
          const newScopeOption: ScopeOption = {
            name: newScope,
            value: newScope,
          };
          this.scopeOptions.set([newScopeOption, ...this.scopeOptions()]);
        }
        this.form.controls.scope.patchValue(newScope);
      } else {
        this.scope.set(newScope);
      }
    });
  }
}
