
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { transient } from 'projects/core';
import { SysDataService } from '../../shared/services/sys-data.service';

type DeletedEntity = {
  ParentRef: string;
  AppId: number;
  Modified: string;
  Guid: string | null;
  Created: string;
  Id: number;
  DeletedTransactionId: number;
  ContentTypeStaticName: string;
  DeletedBy: string;
  DeletedUtc: string;
  ContentTypeName: string;
  Title: string | null;
};

@Component({
  selector: 'recycle-bin',
  templateUrl: './recycle-bin.html',
  styleUrls: ['./recycle-bin.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    RouterOutlet,
    MatButtonModule,
    // TippyDirective
  ]
})
export class AppRecycleBin {

  #dataSvc = transient(SysDataService);

  // Get deleted entities from the backend
  deletedEntities = this.#dataSvc.get<DeletedEntity>({
    source: 'ToSic.Eav.DataSources.RecycleBin',
  });

}