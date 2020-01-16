import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { ContentTypeEdit } from '../../models/content-type.model';
import { ContentTypesService } from '../../services/content-types.service';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.component.html',
  styleUrls: ['./edit-content-type.component.scss']
})
export class EditContentTypeComponent implements OnInit {
  scope: string;
  id: number;
  contentType: ContentTypeEdit;

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
  ) {
    this.scope = this.route.snapshot.paramMap.get('scope');
    this.id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
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
      this.contentType = {
        ...contentTypes.find(contentType => contentType.Id === this.id),
        ChangeStaticName: false,
        NewStaticName: '',
      };
    });
  }
}
