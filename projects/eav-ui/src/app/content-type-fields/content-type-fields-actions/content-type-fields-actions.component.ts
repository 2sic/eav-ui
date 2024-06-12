import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnDestroy } from '@angular/core';
import { DataTypeConstants } from '../constants/data-type.constants';
import { InputTypeConstants } from '../constants/input-type.constants';
import { Field } from '../models/field.model';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';
import { BaseComponent } from '../../shared/components/base.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-content-type-fields-actions',
    templateUrl: './content-type-fields-actions.component.html',
    styleUrls: ['./content-type-fields-actions.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
    ],
})
export class ContentTypeFieldsActionsComponent extends BaseComponent implements ICellRendererAngularComp, OnDestroy {
  field: Field;
  metadataCount: number;
  enablePermissions: boolean;
  private params: ICellRendererParams & ContentTypeFieldsActionsParams;

  constructor() {
    super();
  }
  
  ngOnDestroy(): void { 
    super.ngOnDestroy();
  }

  agInit(params: ICellRendererParams & ContentTypeFieldsActionsParams): void {
    this.params = params;
    this.field = this.params.data;
    this.metadataCount = this.field.Metadata ? Object.keys(this.field.Metadata).filter(key => key !== 'merged').length : 0;
    this.enablePermissions = this.field.InputType === InputTypeConstants.StringWysiwyg || this.field.Type === DataTypeConstants.Hyperlink;
  }

  // #region Sharing Info for better icons #SharedFieldDefinition

  shareText(): string {
    const clickToConfigure = 'click to configure sharing';
    const ss = this.field.SysSettings;
    if (!ss) return clickToConfigure;
    return ss.Share 
      ? 'shared enabled as ' + this.field.Guid
      : ss.InheritMetadataOf
        ? 'inherits ' + ss.InheritMetadataOf
        : clickToConfigure;
  }

  shareOrInheritIcon(): string {
    const ss = this.field.SysSettings;
    if (!ss) return '';
    return ss.Share 
      ? 'share'
      : ss.InheritMetadataOf ? 'adjust' : '';
  }

  // #endregion

  // #region Callback Actions

  refresh(params?: any): boolean {
    return true;
  }

  openMetadata(): void {
    this.params.onOpenMetadata(this.field);
  }

  rename(): void {
    this.params.onRename(this.field);
  }

  openPermissions(): void {
    this.params.onOpenPermissions(this.field);
  }

  deleteField(): void {
    this.params.onDelete(this.field);
  }

  shareOrInherit(): void {
    this.params.onShareOrInherit(this.field);
  }

  // #endregion
}
