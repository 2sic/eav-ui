import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentType } from '../../models/content-type.model';
import { DataLabelParams } from './data-label.models';

@Component({
  selector: 'app-data-label',
  templateUrl: './data-label.component.html',
  styleUrls: ['./data-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataLabelComponent implements ICellRendererAngularComp {
  value: string;
  private contentType: ContentType;
  private params: DataLabelParams;

  agInit(params: DataLabelParams) {
    this.params = params;
    this.contentType = this.params.data;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  filesDropped(files: FileList) {
    this.params.onFilesDropped(this.contentType, files);
  }
}
