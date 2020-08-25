import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { filterAndSortDataSources, toggleInArray } from './add-explorer.helpers';
import { DataSource } from '../models/data-sources.model';
import { SortedDataSources } from '../models/data-sources.model';

@Component({
  selector: 'app-add-explorer',
  templateUrl: './add-explorer.component.html',
  styleUrls: ['./add-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExplorerComponent implements OnInit, OnChanges {
  @Input() dataSources: DataSource[];
  @Output() addSelectedDataSource = new EventEmitter<DataSource>();

  difficulty = {
    default: 100,
    advanced: 200,
  };
  activeDiff = this.difficulty.default;
  sorted: SortedDataSources;
  toggledItems: string[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSources?.currentValue) {
      this.sorted = filterAndSortDataSources(this.dataSources, this.activeDiff);
    }
  }

  onDifficultyChanged(event: MatSlideToggleChange) {
    this.activeDiff = event.checked ? this.difficulty.advanced : this.difficulty.default;
    this.sorted = filterAndSortDataSources(this.dataSources, this.activeDiff);
  }

  addDataSource(dataSource: DataSource) {
    this.addSelectedDataSource.emit(dataSource);
  }

  toggleItem(item: string) {
    toggleInArray(item, this.toggledItems);
  }

}
