import { NgClass } from '@angular/common';
import { Component, computed, HostBinding, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { distinctUntilChanged, startWith } from 'rxjs';
import { transient } from '../../../../../core';
import { ContentTypesService } from '../../app-administration/services';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../shared/constants/eav.constants';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { MetadataSaveFormValues } from './metadata-save-dialog.models';

@Component({
  selector: 'app-metadata-save-dialog',
  templateUrl: './metadata-save-dialog.component.html',
  styleUrls: ['./metadata-save-dialog.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
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
  ]
})
export class MetadataSaveDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  dropdownInsertValue = dropdownInsertValue;
  guidedContentType = true;
  advancedMode = false;

  #contentTypesService = transient(ContentTypesService);

  constructor(
    private dialog: MatDialogRef<MetadataSaveDialogComponent>,
  ) { }

  scope = signal(eavConstants.scopes.default.value);
  scopeOptions = this.#contentTypesService.getScopesSig(undefined) as WritableSignal<ScopeOption[]>;

  contentTypes = computed(() => {
    const scope = this.scope();
    return this.#contentTypesService.retrieveContentTypesSig(scope, undefined);
  });


  ngOnInit(): void {
    this.buildForm();
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

  confirm(): void {
    const formValues: MetadataSaveFormValues = this.form.getRawValue();
    this.closeDialog(formValues.contentType);
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
