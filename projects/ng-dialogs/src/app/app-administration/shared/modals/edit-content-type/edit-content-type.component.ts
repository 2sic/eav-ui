import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { ContentTypeEdit } from '../../models/content-type.model';
import { ContentTypesService } from '../../services/content-types.service';
import { eavConstants, EavScopesKey, EavScopeOption } from '../../../../shared/constants/eav-constants';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.component.html',
  styleUrls: ['./edit-content-type.component.scss']
})
export class EditContentTypeComponent implements OnInit, AfterViewInit {
  scope: string;
  id: number;
  contentType: ContentTypeEdit;
  lockScope = true;
  scopeOptions: EavScopeOption[];

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
  ) {
    this.scope = this.route.snapshot.paramMap.get('scope');
    this.scopeOptions = Object.keys(eavConstants.scopes).map((key: EavScopesKey) => eavConstants.scopes[key]);
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
  }

  // Workaround for angular component issue #13870
  disableAnimation = true;
  ngAfterViewInit() {
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => this.disableAnimation = false);
  }

  ngOnInit() {
    if (!this.id) {
      this.contentType = {
        ...(new ContentTypeEdit()),
        StaticName: '',
        Name: '',
        Description: '',
        Scope: this.scope,
        ChangeStaticName: false,
        NewStaticName: '',
      };
    } else {
      this.fetchContentType();
    }
  }

  changeScope(event: MatSelectChange) {
    let newScope: string = event.value;
    if (newScope === 'Other') {
      // tslint:disable-next-line:max-line-length
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

  onSubmit() {
    this.contentTypesService.save(this.contentType).subscribe(result => {
      this.closeDialog();
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchContentType() {
    this.contentTypesService.retrieveContentTypes(this.scope).subscribe(contentTypes => {
      const contentType = contentTypes.find(ct => ct.Id === this.id);
      this.contentType = {
        ...contentType,
        ChangeStaticName: false,
        NewStaticName: contentType.StaticName,
      };
    });
  }
}
