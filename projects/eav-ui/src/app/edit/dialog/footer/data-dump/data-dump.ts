import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormConfigService } from '../../../form/form-config.service';
import { ItemService } from '../../../state/item.service';

@Component({
    selector: 'app-data-dump',
    templateUrl: './data-dump.html',
    styleUrls: ['./data-dump.scss'],
    imports: [JsonPipe]
})
export class DataDumpComponent {
  protected items = this.itemService.getManySignal(this.formConfig.config.itemGuids);
  constructor(private itemService: ItemService, private formConfig: FormConfigService) { }
}
