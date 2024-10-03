import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { transient } from '../../../../../../core';
import { FieldHintComponent } from '../../../shared/components/field-hint/field-hint.component';
import { dropdownInsertValue } from '../../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { ClickStopPropagationDirective } from '../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentInfo, ContentInfoEntity, ContentInfoTemplate } from '../../models/content-info.model';
import { ContentTypesService } from '../../services/content-types.service';
import { ExportAppPartsService } from '../../services/export-app-parts.service';

@Component({
  selector: 'app-export-app-parts',
  templateUrl: './export-app-parts.component.html',
  styleUrls: ['./export-app-parts.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogActions,
    FieldHintComponent,
    ClickStopPropagationDirective,
    TippyDirective,
    MatDialogModule,
  ],
})
export class ExportAppPartsComponent implements OnInit{
  @HostBinding('className') hostClass = 'dialog-component';

  #exportAppPartsSvc = transient(ExportAppPartsService);
  #contentTypesSvc = transient(ContentTypesService);

  exportScope = eavConstants.scopes.default.value;
  lockScope = true;
  dropdownInsertValue = dropdownInsertValue;

  loading = signal(false);
  isExporting = signal(false);
  scopeOptions = signal<ScopeOption[]>([]);
  contentInfo = signal<ContentInfo>(undefined);

  constructor() { }

  ngOnInit() {
    this.#fetchScopes();
    this.#fetchContentInfo();
  }

  exportAppParts() {
    this.isExporting.set(true);
    // spm TODO: maybe optimize these functions to not loop content types and entities multiple times for no reason
    // spm TODO: figure out how to capture window loading to disable export button
    const contentTypeIds = this.#selectedContentTypes().map(contentType => contentType.Id);
    const templateIds = this.#selectedTemplates().map(template => template.Id);
    let entityIds = this.#selectedEntities().map(entity => entity.Id);
    entityIds = entityIds.concat(templateIds);

    this.#exportAppPartsSvc.exportParts(contentTypeIds, entityIds, templateIds);
    this.isExporting.set(false);

  }

  changeScope(newScope: string) {
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
      if (!this.scopeOptions().find(option => option.value === newScope)) {
        const newScopeOption: ScopeOption = {
          name: newScope,
          value: newScope,
        };
        const scopeOptionsTemp = this.scopeOptions();
        scopeOptionsTemp.unshift(newScopeOption);
        this.scopeOptions.set(scopeOptionsTemp);
      }
    }
    this.exportScope = newScope;
    this.#fetchContentInfo();
  }

  unlockScope() {
    this.lockScope = !this.lockScope;
    if (this.lockScope) {
      this.exportScope = eavConstants.scopes.default.value;
      this.#fetchContentInfo();
    }
  }

  #fetchScopes() {
    this.loading.set(true);
    this.#contentTypesSvc.getScopes().subscribe(scopes => {
      this.scopeOptions.set(scopes);
      this.loading.set(false);

    });
  }

  #fetchContentInfo() {
    this.loading.set(true);
    this.#exportAppPartsSvc.getContentInfo(this.exportScope).subscribe(contentInfo => {
      this.contentInfo.set(contentInfo);
      this.loading.set(false);
    });
  }

  #selectedContentTypes() {
    return this.contentInfo().ContentTypes.filter(contentType => contentType._export);
  }

  #selectedEntities() {
    let entities: ContentInfoEntity[] = [];
    for (const contentType of this.contentInfo().ContentTypes) {
      entities = entities.concat(contentType.Entities.filter(entity => entity._export));
    }
    return entities;
  }

  #selectedTemplates() {
    let templates: ContentInfoTemplate[] = [];
    // The ones with...
    for (const contentType of this.contentInfo().ContentTypes)
      templates = templates.concat(contentType.Templates.filter(template => template._export));
    // ...and without content types
    templates = templates.concat(this.contentInfo().TemplatesWithoutContentTypes.filter(template => template._export));
    return templates;
  }
}
