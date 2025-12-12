import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { distinctUntilChanged, startWith } from 'rxjs';
import { transient } from '../../../../../../core';
import { ContentTypesService } from '../../../app-administration/services';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { BaseComponent } from '../../../shared/components/base';
import { FieldHintComponent } from '../../../shared/components/field-hint/field-hint.component';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { ClickStopPropagationDirective } from '../../../shared/directives/click-stop-propagation.directive';
import { SaveCloseButtonFabComponent } from '../../../shared/modules/save-close-button-fab/save-close-button-fab.component';
import { VisualQueryStateService } from '../../services/visual-query.service';
import { RenameStreamDialogControls, RenameStreamDialogData, RenameStreamDialogFormValue } from './rename-stream.models';

@Component({
  selector: 'app-rename-stream',
  templateUrl: './rename-stream.component.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    NgClass,
    MatDialogActions,
    MatSlideToggleModule,
    FieldHintComponent,
    ClickStopPropagationDirective,
    SaveCloseButtonFabComponent,
  ]
})
export class RenameStreamComponent extends BaseComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  controls: RenameStreamDialogControls;
  isSource = this.dialogData.isSource;
  pipelineResultExists = this.visualQueryService.queryResult != null;
  scopeOptions: ScopeOption[] = [];
  labelOptions: string[] = [];
  guidedLabel = true;
  advancedMode = false;

  #contentTypesSvc = transient(ContentTypesService);

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: RenameStreamDialogData,
    private dialog: MatDialogRef<RenameStreamComponent>,
    private visualQueryService: VisualQueryStateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.#buildForm();
    this.#watchKeyboardShortcuts();
  }

  closeDialog(label?: string): void {
    this.dialog.close(label);
  }

  toggleGuidedLabel(guidedLabel: boolean): void {
    this.guidedLabel = guidedLabel;
  }

  toggleAdvancedMode(event: MatSlideToggleChange): void {
    this.advancedMode = event.checked;
  }

  saveAndClose(): void {
    const formValue: RenameStreamDialogFormValue = this.form.getRawValue();
    this.closeDialog(formValue.label);
  }

  #buildForm(): void {
    this.form = new UntypedFormGroup({
      label: new UntypedFormControl(this.dialogData.label, Validators.required),
      scope: new UntypedFormControl(eavConstants.scopes.default.value),
    });
    this.controls = this.form.controls as any;

    if (!this.isSource || !this.pipelineResultExists)
      return;

    this.subscriptions.add(
      this.controls.scope.valueChanges.pipe(
        startWith<string>(this.controls.scope.value),
        distinctUntilChanged(),
      ).subscribe(scope => {
        this.labelOptions = Object.values(this.visualQueryService.queryResult.Sources)
          .find(source => source.Guid === this.dialogData.pipelineDataSourceGuid).Out
          .filter(out => out.Scope === scope)
          .map(out => out.Name);

        if (!this.labelOptions.includes(this.controls.label.value) && this.controls.label.value != null)
          this.controls.label.patchValue(null);
      })
    );

    this.#contentTypesSvc.getScopesPromise().then(scopes => {
      const sourceOut = Object.values(this.visualQueryService.queryResult.Sources)
        .find(source => source.Guid === this.dialogData.pipelineDataSourceGuid).Out;
      const filtered = scopes.filter(s => sourceOut.some(o => o.Scope === s.value));
      this.scopeOptions = filtered;
      this.changeDetectorRef.markForCheck();
    });
  }
  
  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event) && this.form.valid) {
        event.preventDefault();
        this.saveAndClose();
      }
    });
  }
}
