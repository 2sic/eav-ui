import { Component } from '@angular/core';
import { ItemService } from '../../../shared/store/ngrx-data';
import { JsonPipe } from '@angular/common';
import { FormConfigService } from '../../../state/form-config.service';

@Component({
  selector: 'app-data-dump',
  templateUrl: './data-dump.component.html',
  styleUrls: ['./data-dump.component.scss'],
  standalone: true,
  imports: [JsonPipe],
})
export class DataDumpComponent {
  protected items = this.itemService.getManySignal(this.formConfig.config.itemGuids);
  constructor(private itemService: ItemService, private formConfig: FormConfigService) { }
}
