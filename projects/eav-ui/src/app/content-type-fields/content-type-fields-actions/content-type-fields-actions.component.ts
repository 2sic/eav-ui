import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnDestroy } from '@angular/core';
import { DataTypeConstants } from '../constants/data-type.constants';
import { InputTypeConstants } from '../constants/input-type.constants';
import { Field } from '../models/field.model';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';
import { MatDialog } from '@angular/material/dialog';
import { ShareOrInheritDialogComponent } from './share-or-inherit-dialog/share-or-inherit-dialog.component';
import { SharingOrInheriting } from './share-or-inherit-dialog/share-or-inherit-dialog-models';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { BaseSubsinkComponent } from '../../shared/components/base-subsink-component/base-subsink.component';

@Component({
  selector: 'app-content-type-fields-actions',
  templateUrl: './content-type-fields-actions.component.html',
  styleUrls: ['./content-type-fields-actions.component.scss'],
})
export class ContentTypeFieldsActionsComponent extends BaseSubsinkComponent implements ICellRendererAngularComp, OnDestroy {
  field: Field;
  metadataCount: number;
  enablePermissions: boolean;
  private params: ICellRendererParams & ContentTypeFieldsActionsParams;

  constructor(
    private dialog: MatDialog,
    private contentTypesFieldsService: ContentTypesFieldsService,
  ) {
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

  shareIcon(): string {
    const ss = this.field.SysSettings;
    if (!ss) return '';
    return ss.Share 
      ? 'share'
      : ss.InheritMetadataOf ? 'adjust' : '';
  }
  
  share(): void {
    const shareOrInheritDialogRef = this.dialog.open(ShareOrInheritDialogComponent, {
      autoFocus: false,
      width: '500px',
      data: this.field,
    });
    shareOrInheritDialogRef.afterClosed().subscribe(({state, guid}) => {
      if (state == SharingOrInheriting.Sharing) {
        this.subscription = this.contentTypesFieldsService.share(this.field.Id).subscribe();
      } else if (state == SharingOrInheriting.Inheriting) {
        this.subscription = this.contentTypesFieldsService.inherit(this.field.Id, guid).subscribe();
      }
    });
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

  // #endregion
}
