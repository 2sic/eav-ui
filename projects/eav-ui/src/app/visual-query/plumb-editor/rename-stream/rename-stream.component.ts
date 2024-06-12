import { ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions } from '@angular/material/dialog';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { distinctUntilChanged, startWith, Subscription } from 'rxjs';
import { ContentTypesService } from '../../../app-administration/services';
import { BaseComponent } from '../../../shared/components/base.component';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { VisualQueryService } from '../../services/visual-query.service';
import { RenameStreamDialogControls, RenameStreamDialogData, RenameStreamDialogFormValue } from './rename-stream.models';
import { NgClass } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { FieldHintComponent } from '../../../shared/components/field-hint/field-hint.component';
import { ClickStopPropagationDirective } from '../../../shared/directives/click-stop-propagation.directive';

@Component({
  selector: 'app-rename-stream',
  templateUrl: './rename-stream.component.html',
  styleUrls: ['./rename-stream.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    SharedComponentsModule,
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
  ]
})
export class RenameStreamComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  controls: RenameStreamDialogControls;
  isSource = this.dialogData.isSource;
  pipelineResultExists = this.visualQueryService.pipelineResult != null;
  scopeOptions: ScopeOption[] = [];
  labelOptions: string[] = [];
  guidedLabel = true;
  advancedMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: RenameStreamDialogData,
    private dialogRef: MatDialogRef<RenameStreamComponent>,
    private visualQueryService: VisualQueryService,
    private contentTypesService: ContentTypesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  closeDialog(label?: string): void {
    this.dialogRef.close(label);
  }

  toggleGuidedLabel(guidedLabel: boolean): void {
    this.guidedLabel = guidedLabel;
  }

  toggleAdvancedMode(event: MatSlideToggleChange): void {
    this.advancedMode = event.checked;
  }

  rename(): void {
    const formValue: RenameStreamDialogFormValue = this.form.getRawValue();
    this.closeDialog(formValue.label);
  }

  private buildForm(): void {
    this.form = new UntypedFormGroup({
      label: new UntypedFormControl(this.dialogData.label, Validators.required),
      scope: new UntypedFormControl(eavConstants.scopes.default.value),
    });
    this.controls = this.form.controls as any;

    if (!this.isSource || !this.pipelineResultExists) { return; }

    this.subscriptions.add(
      this.controls.scope.valueChanges.pipe(
        startWith<string>(this.controls.scope.value),
        distinctUntilChanged(),
      ).subscribe(scope => {
        this.labelOptions = Object.values(this.visualQueryService.pipelineResult.Sources)
          .find(source => source.Guid === this.dialogData.pipelineDataSourceGuid).Out
          .filter(out => out.Scope === scope)
          .map(out => out.Name);
        if (!this.labelOptions.includes(this.controls.label.value) && this.controls.label.value != null) {
          this.controls.label.patchValue(null);
        }
      })
    );

    this.contentTypesService.getScopes().subscribe(scopes => {
      const sourceOut = Object.values(this.visualQueryService.pipelineResult.Sources)
        .find(source => source.Guid === this.dialogData.pipelineDataSourceGuid).Out;
      const filtered = scopes.filter(s => sourceOut.some(o => o.Scope === s.value));
      this.scopeOptions = filtered;
      this.changeDetectorRef.markForCheck();
    });
  }
}
