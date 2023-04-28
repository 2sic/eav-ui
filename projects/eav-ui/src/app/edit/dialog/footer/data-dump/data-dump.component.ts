import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { EavService } from '../../../shared/services';
import { ItemService } from '../../../shared/store/ngrx-data';
import { DataDumpViewModel } from './data-dump.component.models';

@Component({
  selector: 'app-data-dump',
  templateUrl: './data-dump.component.html',
  styleUrls: ['./data-dump.component.scss'],
})
export class DataDumpComponent implements OnInit {
  viewModel$: Observable<DataDumpViewModel>;

  constructor(private itemService: ItemService, private eavService: EavService) { }

  ngOnInit(): void {
    const items$ = this.itemService.getItems$(this.eavService.eavConfig.itemGuids);
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
