import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { AgGridActionsDoAndUrlTo } from '../../../shared/ag-grid/ag-grid-actions-signatures';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models/content-type.model';

const doVerbs = ['typeExport', 'deleteContentType'] as const;

const urlToVerbs = ['createUpdateMetaData', 'openPermissions', 'editContentType', 'openMetadata', 'openRestApi', 'dataExport', 'dataImport'] as const;

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
  ]
})
export class DataActionsComponent extends AgGridActionsBaseComponent<
  ContentType,
  typeof doVerbs[number],
  // Specify which other params/methods are expected to be provided by the parent component, in addition to the do method from AgGridActionsParams
  {
    enablePermissionsGetter(): boolean;
  } & AgGridActionsDoAndUrlTo<typeof doVerbs[number], typeof urlToVerbs[number], ContentType>
> {
  
  /** Simple getter for enablePermissions */
  get enablePermissions(): boolean {
    const enablePermissions = this.params.enablePermissionsGetter();
    return enablePermissions && guidRegex().test(this.data.NameId);
  }

}

// old example for @2rb

// export class DataActionsComponent extends AgActionsAlwaysRefresh {
//   contentType: ContentType;
//   enablePermissions: boolean;

//   public params: {
//     enablePermissionsGetter(): boolean;

//     do(verb: 'typeExport' | 'deleteContentType', contentType: ContentType): void;
//     urlTo(verb: 'createUpdateMetaData'
//       | 'openPermissions'
//       | 'editContentType'
//       | 'openMetadata'
//       | 'openRestApi'
//       | 'dataExport'
//       | 'dataImport', contentType: ContentType): string;
//   };

//   agInit(params: ICellRendererParams & DataActionsComponent['params']): void {
//     this.params = params;
//     this.contentType = params.data;
//     const enablePermissions = this.params.enablePermissionsGetter();
//     this.enablePermissions = enablePermissions && guidRegex().test(this.contentType.NameId);
//   }
// }

