import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { DataTypeCatalog } from '../../shared/fields/data-type-catalog';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { Field } from '../../shared/fields/field.model';
import { ContentTypeFieldsActions, ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
    selector: 'app-content-type-fields-actions',
    templateUrl: './content-type-fields-actions.component.html',
    styleUrls: ['./content-type-fields-actions.component.scss'],
    imports: [
        MatRippleModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
        TippyDirective,
    ]
})
export class ContentTypeFieldsActionsComponent implements ICellRendererAngularComp {
  field: Field;
  metadataCount: number;
  enablePermissions: boolean;
  enableMetadata: boolean;

  enableImageConfig: boolean;
  imgConfigCount: number;
  private params: ICellRendererParams & ContentTypeFieldsActionsParams;


  agInit(params: ICellRendererParams & ContentTypeFieldsActionsParams): void {
    this.params = params;
    this.field = this.params.data;
    const disableEdit = this.field.EditInfo.DisableEdit;

    this.enablePermissions = !disableEdit && (this.field.InputType === InputTypeCatalog.StringWysiwyg || this.field.Type === DataTypeCatalog.Hyperlink);
    this.enableMetadata = !this.field.EditInfo.DisableMetadata;
    this.metadataCount = this.field.Metadata ? Object.keys(this.field.Metadata).filter(key => key !== 'merged').length : 0;

    this.enableImageConfig = !disableEdit && this.field.imageConfiguration.isRecommended;
    this.imgConfigCount = this.field.imageConfiguration.entityId ? 1 : 0;
  }

  highlightOrDisabled(toggle: boolean): string {
    return toggle ? 'highlight' : 'disabled';
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

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: ContentTypeFieldsActions): void {
    this.params.do(verb, this.field);
  }

}
