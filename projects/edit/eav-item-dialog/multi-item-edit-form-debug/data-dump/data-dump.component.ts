import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService } from '../../../shared/services';
import { ItemService } from '../../../shared/store/ngrx-data';
import { DataDumpTemplateVars } from './data-dump.component.models';

@Component({
  selector: 'app-data-dump',
  templateUrl: './data-dump.component.html',
  styleUrls: ['./data-dump.component.scss'],
})
export class DataDumpComponent implements OnInit {
  templateVars$: Observable<DataDumpTemplateVars>;

  constructor(private itemService: ItemService, private eavService: EavService) { }

  ngOnInit(): void {
    const items$ = this.itemService.getItems$(this.eavService.eavConfig.itemGuids);
    this.templateVars$ = combineLatest([items$]).pipe(
      map(([items]) => {
        const templateVars: DataDumpTemplateVars = {
          items,
        };
        return templateVars;
      }),
    );
  }
}
