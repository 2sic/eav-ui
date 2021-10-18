import { AfterViewInit, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { GeneralHelpers } from '../../../../../../edit/shared/helpers';
import { eavConstants, EavScopeOption } from '../../../shared/constants/eav.constants';
import { ContentType } from '../../models';
import { ContentTypesService } from '../../services';
import { MetadataSaveDialogData, MetadataSaveDialogTemplateVars } from './metadata-save-dialog.models';

@Component({
  selector: 'app-metadata-save-dialog',
  templateUrl: './metadata-save-dialog.component.html',
  styleUrls: ['./metadata-save-dialog.component.scss']
})
export class MetadataSaveDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  contentTypeControl: AbstractControl;
  scopeControl: AbstractControl;
  templateVars$: Observable<MetadataSaveDialogTemplateVars>;

  private initialScope: string;
  private disableAnimation$: BehaviorSubject<boolean>;
  private scopeOptions$: BehaviorSubject<EavScopeOption[]>;
  private lockScope$: BehaviorSubject<boolean>;
  private contentTypes$: BehaviorSubject<ContentType[]>;
  private subscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: MetadataSaveDialogData | undefined,
    private dialogRef: MatDialogRef<MetadataSaveDialogComponent>,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit(): void {
    this.initialScope = this.dialogData?.scope ?? eavConstants.scopes.default.value;
    this.disableAnimation$ = new BehaviorSubject(true);
    this.scopeOptions$ = new BehaviorSubject<EavScopeOption[]>([]);
    this.lockScope$ = new BehaviorSubject(true);
    this.contentTypes$ = new BehaviorSubject<ContentType[]>([]);
    this.subscription = new Subscription();

    this.form = new FormGroup({
      contentType: new FormControl(null, [Validators.required]),
      scope: new FormControl(this.initialScope, [Validators.required]),
    });
    this.contentTypeControl = this.form.controls['contentType'];
    this.scopeControl = this.form.controls['scope'];

    this.subscription.add(
      this.lockScope$.subscribe(lockScope => {
        if (lockScope) {
          if (this.scopeControl.value !== this.initialScope) {
            this.scopeControl.patchValue(this.initialScope);
          }
          if (!this.scopeControl.disabled) {
            this.scopeControl.disable();
          }
        } else {
          if (this.scopeControl.disabled) {
            this.scopeControl.enable();
          }
        }
      })
    );

    this.subscription.add(
      this.scopeControl.valueChanges.subscribe(scope => {
        if (scope !== 'Other') { return; }

        let newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.');
        if (!newScope) {
          newScope = this.initialScope;
        }
        this.scopeControl.patchValue(newScope);
      })
    );

    const scope$ = this.scopeControl.valueChanges.pipe(
      startWith(this.scopeControl.value),
      filter<string>(scope => scope !== 'Other'),
      distinctUntilChanged(),
    );

    this.subscription.add(
      combineLatest([this.contentTypesService.getScopes(), scope$]).subscribe(([scopeOptions, selectedScope]) => {
        const newScopes = [...this.scopeOptions$.value];
        scopeOptions.forEach(scopeOption => {
          if (!newScopes.some(scope => scope.value === scopeOption.value)) {
            newScopes.push(scopeOption);
          }
        });
        if (!newScopes.some(scope => scope.value === selectedScope)) {
          const newScopeOption: EavScopeOption = {
            name: selectedScope,
            value: selectedScope,
          };
          newScopes.push(newScopeOption);
        }
        this.scopeOptions$.next(newScopes);
      })
    );

    this.subscription.add(
      scope$.subscribe(scope => {
        if (this.contentTypeControl.value != null) {
          this.contentTypeControl.patchValue(null);
        }
        if (this.contentTypes$.value.length > 0) {
          this.contentTypes$.next([]);
        }
        this.contentTypesService.retrieveContentTypes(scope).subscribe(contentTypes => {
          this.contentTypes$.next(contentTypes);
        });
      })
    );

    this.templateVars$ = combineLatest([
      this.disableAnimation$,
      this.scopeOptions$,
      this.contentTypes$,
      this.lockScope$,
      this.form.valueChanges.pipe(
        startWith(this.form.value),
        distinctUntilChanged<Record<string, string>>(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([disableAnimation, scopeOptions, contentTypes, lockScope, formValues]) => {
        const templateVars: MetadataSaveDialogTemplateVars = {
          contentTypes,
          disableAnimation,
          formValues,
          lockScope,
          scopeOptions,
        };
        return templateVars;
      }),
    );
  }

  // workaround for angular component issue #13870
  ngAfterViewInit() {
    // timeout required to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.disableAnimation$.next(false));
  }

  ngOnDestroy(): void {
    this.disableAnimation$.complete();
    this.scopeOptions$.complete();
    this.lockScope$.complete();
    this.contentTypes$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog(saveToContentTypeName?: string): void {
    this.dialogRef.close(saveToContentTypeName);
  }

  unlockScope(): void {
    this.lockScope$.next(!this.lockScope$.value);
  }

  confirm(): void {
    const saveToContentTypeName = this.contentTypeControl.value;
    this.closeDialog(saveToContentTypeName);
  }
}
