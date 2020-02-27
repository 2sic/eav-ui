import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { ContentType } from '../../models/content-type.model';
import { ContentTypesService } from '../../services/content-types.service';
import { eavConstants, EavScopesKey, EavScopeOption } from '../../../../shared/constants/eav-constants';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.component.html',
  styleUrls: ['./edit-content-type.component.scss']
})
export class EditContentTypeComponent implements OnInit {
  scope: string;
  id: number;
  contentType: ContentType;
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

  ngOnInit() {
    if (!this.id) {
      this.contentType = {
        ...(new ContentType()),
        StaticName: '',
        Name: '',
        Description: '',
        Scope: this.scope,
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
      this.contentType = contentTypes.find(contentType => contentType.Id === this.id);
    });
  }
}
