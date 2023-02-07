import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { dropdownInsertValue } from '../../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { ContentInfo, ContentInfoEntity, ContentInfoTemplate } from '../../models/content-info.model';
import { ContentTypesService } from '../../services/content-types.service';
import { ExportAppPartsService } from '../../services/export-app-parts.service';

@Component({
  selector: 'app-export-app-parts',
  templateUrl: './export-app-parts.component.html',
  styleUrls: ['./export-app-parts.component.scss'],
})
export class ExportAppPartsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  contentInfo: ContentInfo;
  exportScope = eavConstants.scopes.default.value;
  scopeOptions: ScopeOption[];
  lockScope = true;
  dropdownInsertValue = dropdownInsertValue;
  private loading$ = new BehaviorSubject(false);
  private isExporting$ = new BehaviorSubject(false);
  templateVars$ = combineLatest([this.loading$, this.isExporting$]).pipe(
    map(([loading, isExporting]) => ({ loading, isExporting })),
  );

  constructor(
    private dialogRef: MatDialogRef<ExportAppPartsComponent>,
    private exportAppPartsService: ExportAppPartsService,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit() {
    this.fetchScopes();
    this.fetchContentInfo();
  }

  ngOnDestroy() {
    this.loading$.complete();
    this.isExporting$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  exportAppParts() {
    this.isExporting$.next(true);
    // spm TODO: maybe optimize these functions to not loop content types and entities multiple times for no reason
    // spm TODO: figure out how to capture window loading to disable export button
    const contentTypeIds = this.selectedContentTypes().map(contentType => contentType.Id);
    const templateIds = this.selectedTemplates().map(template => template.Id);
    let entityIds = this.selectedEntities().map(entity => entity.Id);
    entityIds = entityIds.concat(templateIds);

    this.exportAppPartsService.exportParts(contentTypeIds, entityIds, templateIds);
    this.isExporting$.next(false);
  }

  changeScope(newScope: string) {
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
      if (!this.scopeOptions.find(option => option.value === newScope)) {
        const newScopeOption: ScopeOption = {
          name: newScope,
          value: newScope,
        };
        this.scopeOptions.unshift(newScopeOption);
      }
    }
    this.exportScope = newScope;
    this.fetchContentInfo();
  }

  unlockScope() {
    this.lockScope = !this.lockScope;
    if (this.lockScope) {
      this.exportScope = eavConstants.scopes.default.value;
      this.fetchContentInfo();
    }
  }

  private fetchScopes() {
    this.loading$.next(true);
    this.contentTypesService.getScopes().subscribe(scopes => {
      this.scopeOptions = scopes;
      this.loading$.next(false);
    });
  }

  private fetchContentInfo() {
    this.loading$.next(true);
    this.exportAppPartsService.getContentInfo(this.exportScope).subscribe(contentInfo => {
      this.contentInfo = contentInfo;
      this.loading$.next(false);
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
