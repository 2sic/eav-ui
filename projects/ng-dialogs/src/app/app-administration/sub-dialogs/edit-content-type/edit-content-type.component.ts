import { Component, OnInit, AfterViewInit, HostBinding, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentTypeEdit } from '../../models/content-type.model';
import { ContentTypesService } from '../../services/content-types.service';
import { eavConstants, EavScopeOption } from '../../../shared/constants/eav.constants';
import { contentTypeNamePattern, contentTypeNameError } from '../../constants/content-type.patterns';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.component.html',
  styleUrls: ['./edit-content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditContentTypeComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('className') hostClass = 'dialog-component';

  scope = this.route.snapshot.paramMap.get('scope');
  id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
  contentType: ContentTypeEdit;
  lockScope = true;
  scopeOptions: EavScopeOption[];
  disableAnimation$ = new BehaviorSubject(true);
  loading$ = new BehaviorSubject(true);
  saving$ = new BehaviorSubject(false);
  contentTypeNamePattern = contentTypeNamePattern;
  contentTypeNameError = contentTypeNameError;

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const contentType$ = this.id
      ? this.contentTypesService.retrieveContentTypes(this.scope)
        .pipe(
          map(contentTypes => {
            const contentType = contentTypes.find(ct => ct.Id === this.id);
            const contentTypeEdit: ContentTypeEdit = {
              ...contentType,
              ChangeStaticName: false,
              NewStaticName: contentType.StaticName,
            };
            return contentTypeEdit;
          }),
        )
      : of({
        ...(new ContentTypeEdit()),
        StaticName: '',
        Name: '',
        Description: '',
        Scope: this.scope,
        ChangeStaticName: false,
        NewStaticName: '',
      });
    const scopes$ = this.contentTypesService.getScopes();
    combineLatest([contentType$, scopes$]).subscribe(([contentType, scopes]) => {
      this.contentType = contentType;
      this.scopeOptions = scopes;
      this.loading$.next(false);
    });
  }

  ngOnDestroy() {
    this.disableAnimation$.complete();
    this.loading$.complete();
    this.saving$.complete();
  }

  // workaround for angular component issue #13870
  ngAfterViewInit() {
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => this.disableAnimation$.next(false));
  }

  changeScope(newScope: string) {
    if (newScope === 'Other') {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.');
      if (!newScope) {
        newScope = eavConstants.scopes.default.value;
      } else if (!this.scopeOptions.find(option => option.value === newScope)) {
        const newScopeOption: EavScopeOption = {
          name: newScope,
          value: newScope,
        };
        this.scopeOptions.push(newScopeOption);
      }
    }
    this.contentType.Scope = newScope;
  }

  unlockScope(event: Event) {
    event.stopPropagation();
    this.lockScope = !this.lockScope;
    if (this.lockScope) {
      this.contentType.Scope = this.scope;
    }
  }

  save() {
    this.saving$.next(true);
    this.snackBar.open('Saving...');
    this.contentTypesService.save(this.contentType).subscribe(result => {
      this.saving$.next(false);
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
