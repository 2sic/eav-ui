import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { ContentType } from '../../app-administration/models';
import { ContentTypesService } from '../../app-administration/services';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../shared/constants/eav.constants';
import { MetadataSaveDialogTemplateVars, MetadataSaveFormValues } from './metadata-save-dialog.models';

@Component({
  selector: 'app-metadata-save-dialog',
  templateUrl: './metadata-save-dialog.component.html',
  styleUrls: ['./metadata-save-dialog.component.scss']
})
export class MetadataSaveDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  dropdownInsertValue = dropdownInsertValue;
  templateVars$: Observable<MetadataSaveDialogTemplateVars>;
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

    this.templateVars$ = combineLatest([this.contentTypes$, this.scopeOptions$]).pipe(
      map(([contentTypes, scopeOptions]) => {
        const templateVars: MetadataSaveDialogTemplateVars = {
          contentTypes,
          scopeOptions,
        };
        return templateVars;
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
    const defaultScope = eavConstants.scopes.default.value;
    this.form = new FormGroup({});
    this.form.addControl('contentType', new FormControl(null, [Validators.required]));
    this.form.addControl('scope', new FormControl(defaultScope));

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
        newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || defaultScope;
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
