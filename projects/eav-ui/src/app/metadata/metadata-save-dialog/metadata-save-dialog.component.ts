import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { ContentType } from '../../app-administration/models';
import { ContentTypesService } from '../../app-administration/services';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../shared/constants/eav.constants';
import { MetadataSaveDialogViewModel, MetadataSaveFormValues } from './metadata-save-dialog.models';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-metadata-save-dialog',
    templateUrl: './metadata-save-dialog.component.html',
    styleUrls: ['./metadata-save-dialog.component.scss'],
    standalone: true,
    imports: [MatCardModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, SharedComponentsModule, MatInputModule, MatButtonModule, NgClass, MatIconModule, MatSlideToggleModule, AsyncPipe]
})
export class MetadataSaveDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;
  dropdownInsertValue = dropdownInsertValue;
  viewModel$: Observable<MetadataSaveDialogViewModel>;
  guidedContentType = true;
  advancedMode = false;

  private contentTypes$: BehaviorSubject<ContentType[]>;
  private scopeOptions$: BehaviorSubject<ScopeOption[]>;

  constructor(
    private dialogRef: MatDialogRef<MetadataSaveDialogComponent>,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit(): void {
    this.contentTypes$ = new BehaviorSubject<ContentType[]>([]);
    this.scopeOptions$ = new BehaviorSubject<ScopeOption[]>([]);

    this.buildForm();
    this.fetchScopes();

    this.viewModel$ = combineLatest([this.contentTypes$, this.scopeOptions$]).pipe(
      map(([contentTypes, scopeOptions]) => {
        const viewModel: MetadataSaveDialogViewModel = {
          contentTypes,
          scopeOptions,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    this.contentTypes$.complete();
    this.scopeOptions$.complete();
  }

  closeDialog(contentType?: string): void {
    this.dialogRef.close(contentType);
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
        if (!this.scopeOptions$.value.some(option => option.value === newScope)) {
          const newScopeOption: ScopeOption = {
            name: newScope,
            value: newScope,
          };
          this.scopeOptions$.next([newScopeOption, ...this.scopeOptions$.value]);
        }
        this.form.controls.scope.patchValue(newScope);
      } else {
        this.fetchContentTypes(newScope);
      }
    });
  }

  private fetchContentTypes(scope: string): void {
    this.contentTypesService.retrieveContentTypes(scope).subscribe(contentTypes => {
      this.contentTypes$.next(contentTypes);
    });
  }

  private fetchScopes(): void {
    this.contentTypesService.getScopes().subscribe(scopes => {
      this.scopeOptions$.next(scopes);
    });
  }
}
