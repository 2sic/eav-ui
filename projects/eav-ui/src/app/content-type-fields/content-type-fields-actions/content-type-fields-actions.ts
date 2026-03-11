import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AgGridActionsBaseComponent } from '../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { DataTypeCatalog } from '../../shared/fields/data-type-catalog';
import { Field } from '../../shared/fields/field.model';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { ContentTypeFieldsActions, ContentTypeFieldsActionsParams } from './content-type-fields-actions.models';

@Component({
  selector: 'app-content-type-fields-actions',
  templateUrl: './content-type-fields-actions.html',
  styleUrls: ['./content-type-fields-actions.scss'],
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
  ]
})
export class ContentTypeFieldsActionsComponent
  extends AgGridActionsBaseComponent<Field, ContentTypeFieldsActions> {

  declare params: ContentTypeFieldsActionsParams;

  get field(): Field {return this.data;}

  get metadataCount(): number {
    return this.field?.Metadata
      ? Object.keys(this.field.Metadata).filter(key => key !== 'merged').length
      : 0;
  }

  get enablePermissions(): boolean {
    const disableEdit = this.field?.EditInfo?.DisableEdit;
    return !disableEdit
      && (
        this.field?.InputType === InputTypeCatalog.StringWysiwyg
        || this.field?.Type === DataTypeCatalog.Hyperlink
      );
  }

  get enableMetadata(): boolean {return !this.field?.EditInfo?.DisableMetadata;}

  get enableImageConfig(): boolean {return !this.field?.EditInfo?.DisableEdit && !!this.field?.imageConfiguration?.isRecommended;}

  get imgConfigCount(): number {return this.field?.imageConfiguration?.entityId ? 1 : 0;}

  highlightOrDisabled(toggle: boolean): string {
    return toggle ? 'highlight' : 'disabled';
  }

  shareText(): string {
    const clickToConfigure = 'click to configure sharing';
    const ss = this.field?.SysSettings;

    if (!ss) 
      return clickToConfigure;

    return ss.Share
      ? 'shared enabled as ' + this.field.Guid
      : ss.InheritMetadataOf
        ? 'inherits ' + ss.InheritMetadataOf
        : clickToConfigure;
  }

  shareOrInheritIcon(): string {
    const ss = this.field?.SysSettings;
    if (!ss) 
      return '';
    
    return ss.Share
      ? 'share'
      : ss.InheritMetadataOf ? 'adjust' : '';
  }
}