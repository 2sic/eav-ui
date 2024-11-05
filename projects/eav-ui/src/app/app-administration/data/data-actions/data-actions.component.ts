import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models/content-type.model';

type GoToUrls = 'createUpdateMetaData'
  | 'openPermissions'
  | 'editContentType'
  | 'openMetadata'
  | 'openRestApi'
  | 'dataExport'
  | 'dataImport';

type DataActions = 'typeExport' | 'deleteContentType';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
  ],
})
export class DataActionsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  enablePermissions: boolean;
  public params: {
    enablePermissionsGetter(): boolean;
    do(verb: DataActions, contentType: ContentType): void;
    urlTo(verb: GoToUrls, contentType: ContentType): string;
  };

  agInit(params: ICellRendererParams & DataActionsComponent['params']): void {
    this.params = params;
    this.contentType = params.data;
    const enablePermissions = this.params.enablePermissionsGetter();
    this.enablePermissions = enablePermissions && guidRegex().test(this.contentType.StaticName);
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: DataActions): void {
    this.params.do(verb, this.contentType);
  }

  urlTo(verb: GoToUrls): string {
    return this.params.urlTo(verb, this.contentType);
  }
}
