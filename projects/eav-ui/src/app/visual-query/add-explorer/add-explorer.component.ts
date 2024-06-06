import { KeyValue, AsyncPipe, KeyValuePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../edit/shared/helpers';
import { eavConstants } from '../../shared/constants/eav.constants';
import { DataSource, SortedDataSources } from '../models';
import { guiTypes } from '../plumb-editor/plumb-editor.helpers';
import { VisualQueryService } from '../services/visual-query.service';
import { filterAndSortDataSources } from './add-explorer.helpers';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';

@Component({
    selector: 'app-add-explorer',
    templateUrl: './add-explorer.component.html',
    styleUrls: ['./add-explorer.component.scss'],
    standalone: true,
    imports: [
        MatSlideToggleModule,
        SharedComponentsModule,
        MatIconModule,
        AsyncPipe,
        KeyValuePipe,
    ],
})
export class AddExplorerComponent implements OnInit, OnDestroy {
  toggledItems: string[] = [];
  guiTypes = guiTypes;

  private difficulties = eavConstants.pipelineDesigner.dataSourceDifficulties;
  private difficulty$ = new BehaviorSubject(this.difficulties.default);

  viewModel$: Observable<AddExplorerViewModel>;

  constructor(private visualQueryService: VisualQueryService) { }

  ngOnInit() {
    this.viewModel$ = combineLatest([
      combineLatest([this.visualQueryService.dataSources$, this.difficulty$]).pipe(
        map(([dataSources, difficulty]) => filterAndSortDataSources(dataSources, difficulty)),
      )
    ]).pipe(map(([sorted]) => ({ sorted })));
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
    GeneralHelpers.toggleInArray(item, this.toggledItems);
  }

  trackGroups(index: number, type: KeyValue<string, DataSource[]>) {
    return type.key;
  }

  trackDataSources(index: number, dataSource: DataSource) {
    return dataSource.PartAssemblyAndType;
  }
}

interface AddExplorerViewModel {
  sorted: SortedDataSources;
}
