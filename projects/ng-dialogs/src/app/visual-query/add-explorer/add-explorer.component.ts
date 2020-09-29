import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../models/data-sources.model';
import { SortedDataSources } from '../models/data-sources.model';
import { VisualQueryService } from '../services/visual-query.service';
import { filterAndSortDataSources, toggleInArray } from './add-explorer.helpers';

@Component({
  selector: 'app-add-explorer',
  templateUrl: './add-explorer.component.html',
  styleUrls: ['./add-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExplorerComponent implements OnInit, OnDestroy {
  sorted$: Observable<SortedDataSources>;
  toggledItems: string[] = [];

  private difficulties = {
    default: 100,
    advanced: 200,
  };
  private difficulty$ = new BehaviorSubject(this.difficulties.default);

  constructor(private visualQueryService: VisualQueryService) { }

  ngOnInit() {
    this.sorted$ = combineLatest([this.visualQueryService.dataSources$, this.difficulty$]).pipe(
      map(([dataSources, difficulty]) => {
        if (dataSources == null) { return; }
        const sorted = filterAndSortDataSources(dataSources, difficulty);
        return sorted;
      }),
    );
  }

  ngOnDestroy() {
    this.difficulty$.complete();
  }

  toggleDifficulty(event: MatSlideToggleChange) {
    const difficulty = event.checked ? this.difficulties.advanced : this.difficulties.default;
    this.difficulty$.next(difficulty);
  }

  addDataSource(dataSource: DataSource) {
    this.visualQueryService.addDataSource(dataSource);
  }

  toggleItem(item: string) {
    toggleInArray(item, this.toggledItems);
  }

}
