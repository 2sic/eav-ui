import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { ExportAppPartsService } from '../../services/export-app-parts.service';
import { ContentInfo, ContentInfoEntity, ContentInfoTemplate } from '../../models/content-info.model';
import { eavConstants, EavScopeOption } from '../../../shared/constants/eav.constants';
import { ContentTypesService } from '../../services/content-types.service';

@Component({
  selector: 'app-export-app-parts',
  templateUrl: './export-app-parts.component.html',
  styleUrls: ['./export-app-parts.component.scss']
})
export class ExportAppPartsComponent implements OnInit {
  contentInfo: ContentInfo;
  exportScope = eavConstants.defaultScope.value;
  scopeOptions: EavScopeOption[];
  lockScope = true;
  isExporting = false;

  constructor(
    private dialogRef: MatDialogRef<ExportAppPartsComponent>,
    private exportAppPartsService: ExportAppPartsService,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit() {
    this.fetchScopes();
    this.fetchContentInfo();
  }

  exportAppParts() {
    this.isExporting = true;
    // spm TODO: maybe optimize these functions to not loop content types and entities multiple times for no reason
    // spm TODO: figure out how to capture window loading to disable export button
    const contentTypeIds = this.selectedContentTypes().map(contentType => contentType.Id);
    const templateIds = this.selectedTemplates().map(template => template.Id);
    let entityIds = this.selectedEntities().map(entity => entity.Id);
    entityIds = entityIds.concat(templateIds);

    this.exportAppPartsService.exportParts(contentTypeIds, entityIds, templateIds);
    this.isExporting = false;
  }

  changeScope(event: MatSelectChange) {
    let newScope: string = event.value;
    if (newScope === 'Other') {
      // tslint:disable-next-line:max-line-length
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.');
      if (!newScope) {
        newScope = eavConstants.defaultScope.value;
      } else if (!this.scopeOptions.find(option => option.value === newScope)) {
        const newScopeOption: EavScopeOption = {
          name: newScope,
          value: newScope,
        };
        this.scopeOptions.push(newScopeOption);
      }
    }
    this.exportScope = newScope;
    this.fetchContentInfo();
  }

  unlockScope(event: Event) {
    event.stopPropagation();
    this.lockScope = !this.lockScope;
    if (this.lockScope) {
      this.exportScope = eavConstants.defaultScope.value;
      this.fetchContentInfo();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchScopes() {
    this.contentTypesService.getScopes().subscribe(scopes => {
      this.scopeOptions = scopes;
    });
  }

  private fetchContentInfo() {
    this.exportAppPartsService.getContentInfo(this.exportScope).subscribe(contentInfo => {
      this.contentInfo = contentInfo;
    });
  }

  private selectedContentTypes() {
    return this.contentInfo.ContentTypes.filter(contentType => contentType._export);
  }

  private selectedEntities() {
    let entities: ContentInfoEntity[] = [];
    for (const contentType of this.contentInfo.ContentTypes) {
      entities = entities.concat(contentType.Entities.filter(entity => entity._export));
    }
    return entities;
  }

  private selectedTemplates() {
    let templates: ContentInfoTemplate[] = [];
    // The ones with...
    for (const contentType of this.contentInfo.ContentTypes) {
      templates = templates.concat(contentType.Templates.filter(template => template._export));
    }
    // ...and without content types
    templates = templates.concat(this.contentInfo.TemplatesWithoutContentTypes.filter(template => template._export));
    return templates;
  }
}
