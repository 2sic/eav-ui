import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { FormConfigService } from '../../../shared/services';
import { ItemService } from '../../../shared/store/ngrx-data';
import { DataDumpViewModel } from './data-dump.component.models';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-data-dump',
    templateUrl: './data-dump.component.html',
    styleUrls: ['./data-dump.component.scss'],
    standalone: true,
    imports: [AsyncPipe, JsonPipe],
})
export class DataDumpComponent implements OnInit {
  viewModel$: Observable<DataDumpViewModel>;

  constructor(private itemService: ItemService, private formConfig: FormConfigService) { }

  ngOnInit(): void {
    const items$ = this.itemService.getItems$(this.formConfig.config.itemGuids);
    this.viewModel$ = combineLatest([items$]).pipe(
      map(([items]) => {
        const viewModel: DataDumpViewModel = {
          items,
        };
        return viewModel;
      }),
    );
  }
}
