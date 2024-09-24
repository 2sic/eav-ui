import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, merge, Observable, startWith } from 'rxjs';
import { ContentType } from '../../app-administration/models';
import { ContentTypesService } from '../../app-administration/services';
import { transient } from '../../core';
import { UiControl } from '../../edit/shared/controls/ui-control';
import { BaseComponent } from '../../shared/components/base.component';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { dropdownInsertValue } from '../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, MetadataKeyType, ScopeOption } from '../../shared/constants/eav.constants';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { mapUntilObjChanged } from '../../shared/rxJs/mapUntilChanged';
import { RxHelpers } from '../../shared/rxJs/rx.helpers';
import { Context } from '../../shared/services/context';
import { ContentItem } from '../models/content-item.model';
import { ContentItemsService } from '../services/content-items.service';
import { MetadataDialogViewModel, MetadataFormValues, MetadataInfo, TargetTypeOption } from './create-metadata-dialog.models';
import { metadataKeyValidator } from './metadata-key.validator';

@Component({
  selector: 'app-create-metadata-dialog',
  templateUrl: './create-metadata-dialog.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    NgTemplateOutlet,
    MatButtonModule,
    NgClass,
    MatIconModule,
    MatDialogActions,
    MatSlideToggleModule,
    AsyncPipe,
    FieldHintComponent,
    ClickStopPropagationDirective,
    TippyDirective,
  ]
})
export class CreateMetadataDialogComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  eavConstants = eavConstants;
  dropdownInsertValue = dropdownInsertValue;
  form: UntypedFormGroup;
  viewModel$: Observable<MetadataDialogViewModel>;
  targetTypeOptions: TargetTypeOption[];

  /** Constants from metadata definitions */
  private keyTypeOptions: MetadataKeyType[];
  private guidedMode$: BehaviorSubject<boolean>;
  /** Currently available options */
  private keyTypeOptions$: BehaviorSubject<MetadataKeyType[]>;
  private scopeOptions$: BehaviorSubject<ScopeOption[]>;
  private contentItems$: BehaviorSubject<ContentItem[]>;
  private contentTypes$: BehaviorSubject<ContentType[]>;
  private guidedKey$: BehaviorSubject<boolean>;

  private contentItemsService = transient(ContentItemsService);
  
  private contentTypesService = transient(ContentTypesService);
  constructor(
    private dialogRef: MatDialogRef<CreateMetadataDialogComponent>,
    private context: Context,
  ) {
    super();
  }

  ngOnInit(): void {
    this.targetTypeOptions = Object.values(eavConstants.metadata).map(option => ({ ...option }));
    this.keyTypeOptions = Object.values(eavConstants.keyTypes);

    this.keyTypeOptions$ = new BehaviorSubject<MetadataKeyType[]>([]);
    this.scopeOptions$ = new BehaviorSubject<ScopeOption[]>([]);
    this.guidedMode$ = new BehaviorSubject(true);
    this.contentItems$ = new BehaviorSubject<ContentItem[]>([]);
    this.contentTypes$ = new BehaviorSubject<ContentType[]>([]);
    this.guidedKey$ = new BehaviorSubject(true);

    this.fetchScopes();

    this.form = new UntypedFormGroup({});
    this.form.addControl('targetType', new UntypedFormControl(eavConstants.metadata.entity.targetType, [Validators.required, Validators.pattern(/^[0-9]+$/)]));
    this.form.addControl('keyType', new UntypedFormControl(eavConstants.metadata.entity.keyType, [Validators.required]));
    this.form.addControl('contentTypeForContentItems', new UntypedFormControl(null));
    this.form.addControl('scopeForContentTypes', new UntypedFormControl(eavConstants.scopes.default.value));
    this.form.addControl('key', new UntypedFormControl(null, [Validators.required, metadataKeyValidator(this.form)]));

    this.subscriptions.add(
      this.form.controls['scopeForContentTypes'].valueChanges.pipe(
        startWith(this.form.controls['scopeForContentTypes'].value),
        distinctUntilChanged(),
      ).subscribe((newScope: string) => {
        if (this.form.controls['contentTypeForContentItems'].value != null) {
          this.form.controls['contentTypeForContentItems'].patchValue(null);
        }

        if (newScope === dropdownInsertValue) {
          newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
          if (!this.scopeOptions$.value.some(option => option.value === newScope)) {
            const newScopeOption: ScopeOption = {
              name: newScope,
              value: newScope,
            };
            this.scopeOptions$.next([newScopeOption, ...this.scopeOptions$.value]);
          }
          this.form.controls['scopeForContentTypes'].patchValue(newScope);
        } else {
          this.fetchContentTypes(newScope);
        }
      })
    );

    // reset key if target or keyType changed
    this.subscriptions.add(
      merge(
        this.form.controls['targetType'].valueChanges.pipe(distinctUntilChanged()),
        this.form.controls['keyType'].valueChanges.pipe(distinctUntilChanged()),
      ).subscribe(() => {
        this.guidedKey$.next(true);

        const formValues: MetadataFormValues = this.form.getRawValue();
        if (formValues.key != null) {
          const updatedForm: Partial<MetadataFormValues> = {
            key: null,
          };
          this.form.patchValue(updatedForm);
        }
      })
    );

    // reset key if contentTypeForContentItems changed
    this.subscriptions.add(
      this.form.controls['contentTypeForContentItems'].valueChanges.pipe(
        startWith(this.form.controls['contentTypeForContentItems'].value),
        distinctUntilChanged(),
      ).subscribe(contentTypeStaticName => {
        const formValues: MetadataFormValues = this.form.getRawValue();
        if (formValues.targetType === eavConstants.metadata.entity.targetType && formValues.key != null) {
          const updatedForm: Partial<MetadataFormValues> = {
            key: null,
          };
          this.form.patchValue(updatedForm);
        }

        this.contentItemsService.getAll(contentTypeStaticName).subscribe(items => {
          this.contentItems$.next(items);
        });
      })
    );

    const formValues$ = this.form.valueChanges.pipe(
      startWith(this.form.getRawValue() as MetadataFormValues),
      map(() => this.form.getRawValue() as MetadataFormValues),
      mapUntilObjChanged(m => m)
      // distinctUntilChanged(RxHelpers.objectsEqual),
    );

    this.subscriptions.add(
      combineLatest([formValues$, this.guidedMode$]).subscribe(([formValues, guidedMode]) => {
        // keyTypeOptions depend on targetType and advanced
        const foundTargetType = this.targetTypeOptions.find(option => option.targetType === formValues.targetType);
        const keyTypeOptions = guidedMode && foundTargetType ? [foundTargetType.keyType] : [...this.keyTypeOptions];
        if (!RxHelpers.arraysEqual(keyTypeOptions, this.keyTypeOptions$.value))
          this.keyTypeOptions$.next(keyTypeOptions);

        // update form if keyType is not available
        const updatedForm: Partial<MetadataFormValues> = {};
        if (!this.keyTypeOptions$.value.includes(formValues.keyType))
          updatedForm.keyType = this.keyTypeOptions$.value[0];

        // if target is app key must be current app id
        const isAppMetadata = guidedMode && formValues.targetType === eavConstants.metadata.app.targetType;
        if (isAppMetadata && formValues.key !== this.context.appId)
          updatedForm.key = this.context.appId;

        if (Object.keys(updatedForm).length)
          this.form.patchValue(updatedForm);

        const keyTypeDisabled = guidedMode && this.keyTypeOptions$.value.length <= 1;
        UiControl.disable(this.form.controls['keyType'], keyTypeDisabled);
        UiControl.disable(this.form.controls['key'], isAppMetadata);
      })
    );

    this.viewModel$ = combineLatest([
      combineLatest([this.guidedMode$, this.keyTypeOptions$, this.scopeOptions$, this.contentItems$, this.contentTypes$]),
      combineLatest([formValues$, this.guidedKey$]),
    ]).pipe(
      map(([
        [guidedMode, keyTypeOptions, scopeOptions, contentItems, contentTypes],
        [formValues, guidedKey],
      ]) => {
        const viewModel: MetadataDialogViewModel = {
          guidedMode,
          unknownTargetType: !this.targetTypeOptions.some(option => option.targetType === formValues.targetType),
          targetTypeHint: guidedMode && this.targetTypeOptions.find(option => option.targetType === formValues.targetType)?.hint,
          keyTypeOptions,
          scopeOptions,
          guidedKey,
          guidedKeyExists:
            [eavConstants.metadata.entity.targetType, eavConstants.metadata.contentType.targetType].includes(formValues.targetType),
          formValues,
          contentItems,
          contentTypes,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    this.guidedMode$.complete();
    this.keyTypeOptions$.complete();
    this.contentItems$.complete();
    this.contentTypes$.complete();
    this.guidedKey$.complete();
    super.ngOnDestroy();
  }

  closeDialog(result?: MetadataInfo): void {
    this.dialogRef.close(result);
  }

  toggleGuidedKey(event: boolean): void {
    this.guidedKey$.next(event);
  }

  toggleGuidedMode(event: MatSlideToggleChange): void {
    this.guidedMode$.next(event.checked);
  }

  confirm(): void {
    const formValues: MetadataFormValues = this.form.getRawValue();

    const result: MetadataInfo = {
      target: this.targetTypeOptions.find(option => option.targetType === formValues.targetType)?.target,
      targetType: formValues.targetType,
      keyType: formValues.keyType,
      // if keyType is guid remove curly brackets
      key: formValues.keyType === eavConstants.keyTypes.guid ? (formValues.key as string).replace(/{|}/g, '') : formValues.key.toString(),
    };
    this.closeDialog(result);
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
