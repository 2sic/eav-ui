import { AfterViewInit, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, of } from 'rxjs';
import { dropdownInsertValue } from '../../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { contentTypeNameError, contentTypeNamePattern } from '../../constants/content-type.patterns';
import { ContentTypeEdit } from '../../models/content-type.model';
import { ContentTypesService } from '../../services/content-types.service';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.component.html',
  styleUrls: ['./edit-content-type.component.scss'],
})
export class EditContentTypeComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('className') hostClass = 'dialog-component';

  contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  /** RegEx property to use in HTML */
  contentTypeNamePattern = contentTypeNamePattern;
  contentTypeNameError = contentTypeNameError;
  dropdownInsertValue = dropdownInsertValue;

  private contentType$ = new BehaviorSubject<ContentTypeEdit>(null);
  private lockScope$ = new BehaviorSubject(true);
  private scopeOptions$ = new BehaviorSubject<ScopeOption[]>(null);
  private disableAnimation$ = new BehaviorSubject(true);
  private loading$ = new BehaviorSubject(false);
  viewModel$ = combineLatest([this.contentType$, this.lockScope$, this.scopeOptions$, this.disableAnimation$, this.loading$]).pipe(
    map(([contentType, lockScope, scopeOptions, disableAnimation, loading]) =>
      ({ contentType, lockScope, scopeOptions, disableAnimation, loading })),
  );
  private scope = this.route.snapshot.parent.paramMap.get('scope');

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const contentType$ = this.contentTypeStaticName
      ? this.contentTypesService.retrieveContentType(this.contentTypeStaticName)
        .pipe(
          map(contentType => {
            const contentTypeEdit: ContentTypeEdit = {
              ...contentType,
              ChangeStaticName: false,
              NewStaticName: contentType.StaticName,
            };
            return contentTypeEdit;
          }),
        )
      : of({
        StaticName: '',
        Name: '',
        Description: '',
        Scope: this.scope,
        ChangeStaticName: false,
        NewStaticName: '',
      } as ContentTypeEdit);
    const scopes$ = this.contentTypesService.getScopes();
    combineLatest([contentType$, scopes$]).subscribe(([contentType, scopeOptions]) => {
      this.contentType$.next(contentType);

      const newScopes = [...(this.scopeOptions$.value ?? [])];
      scopeOptions.forEach(scopeOption => {
        if (!newScopes.some(scope => scope.value === scopeOption.value)) {
          newScopes.push(scopeOption);
        }
      });
      if (!newScopes.some(scope => scope.value === this.scope)) {
        const newScopeOption: ScopeOption = {
          name: this.scope,
          value: this.scope,
        };
        newScopes.push(newScopeOption);
      }
      this.scopeOptions$.next(newScopes);
    });
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.lockScope$.complete();
    this.scopeOptions$.complete();
    this.disableAnimation$.complete();
    this.loading$.complete();
  }

  // workaround for angular component issue #13870
  ngAfterViewInit() {
    // timeout required to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.disableAnimation$.next(false));
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeContentTypeName(newName: string) {
    this.contentType$.next({ ...this.contentType$.value, Name: newName });
  }

  changeScope(newScope: string) {
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
      if (!this.scopeOptions$.value.some(option => option.value === newScope)) {
        const newScopeOption: ScopeOption = {
          name: newScope,
          value: newScope,
        };
        this.scopeOptions$.next([newScopeOption, ...this.scopeOptions$.value]);
      }
    }
    this.contentType$.next({ ...this.contentType$.value, Scope: newScope });
  }

  unlockScope() {
    this.lockScope$.next(!this.lockScope$.value);
    if (this.lockScope$.value) {
      this.contentType$.next({ ...this.contentType$.value, Scope: this.scope });
    }
  }

  save() {
    this.loading$.next(true);
    this.snackBar.open('Saving...');
    this.contentTypesService.save(this.contentType$.value).subscribe(result => {
      this.loading$.next(false);
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
