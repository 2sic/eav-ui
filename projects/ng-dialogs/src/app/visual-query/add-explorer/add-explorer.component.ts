import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { filterAndSortDataSources, toggleInArray } from './add-explorer.helpers';
import { DataSource } from './data-sources.model';
import { SortedDataSources } from './data-sources.model';

@Component({
  selector: 'app-add-explorer',
  templateUrl: './add-explorer.component.html',
  styleUrls: ['./add-explorer.component.scss']
})
export class AddExplorerComponent implements OnInit, OnChanges {
  @Input() dataSources: DataSource[];
  @Output() addSelectedDataSource: EventEmitter<DataSource> = new EventEmitter();
  difficulty = {
    default: 100,
    advanced: 200,
  };
  activeDiff = this.difficulty.default;
  sorted: SortedDataSources;
  toggledItems: any[] = [];

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
