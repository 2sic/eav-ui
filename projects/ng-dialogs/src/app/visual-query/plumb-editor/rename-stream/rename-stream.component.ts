import { ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { ContentTypesService } from '../../../app-administration/services';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { VisualQueryService } from '../../services/visual-query.service';
import { RenameStreamDialogControls, RenameStreamDialogData, RenameStreamDialogFormValue } from './rename-stream.models';

@Component({
  selector: 'app-rename-stream',
  templateUrl: './rename-stream.component.html',
  styleUrls: ['./rename-stream.component.scss']
})
export class RenameStreamComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  controls: RenameStreamDialogControls;
  isSource = this.dialogData.isSource;
  pipelineResultExists = this.visualQueryService.pipelineResult != null;
  scopeOptions: ScopeOption[] = [];
  labelOptions: string[] = [];
  guidedLabel = true;
  advancedMode = false;

  private subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: RenameStreamDialogData,
    private dialogRef: MatDialogRef<RenameStreamComponent>,
    private visualQueryService: VisualQueryService,
    private contentTypesService: ContentTypesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    this.form = new FormGroup({
      label: new FormControl(this.dialogData.label, Validators.required),
      scope: new FormControl(eavConstants.scopes.default.name),
    });
    this.controls = this.form.controls as any;

    if (!this.isSource || !this.pipelineResultExists) { return; }

    this.subscription.add(
      this.controls.scope.valueChanges.pipe(
        startWith<string, string>(this.controls.scope.value),
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
      // TODO: hard-coded rename for 2SexyContent scope to be Default to match out-stream scope.
      // Remove when backend is fixed
      const defaultScope = scopes.find(s => s.value === eavConstants.scopes.default.value);
      if (defaultScope) {
        defaultScope.value = eavConstants.scopes.default.name;
      }
      this.scopeOptions = scopes;
      this.changeDetectorRef.markForCheck();
    });
  }
}
