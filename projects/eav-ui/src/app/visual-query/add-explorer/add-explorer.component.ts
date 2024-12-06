import { KeyValue, KeyValuePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { eavConstants } from '../../shared/constants/eav.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ArrayHelpers } from '../../shared/helpers/array.helpers';
import { DataSource } from '../models';
import { guiTypes } from '../plumb-editor/plumb-editor.helpers';
import { VisualQueryStateService } from '../services/visual-query.service';
import { filterAndSortDataSources } from './add-explorer.helpers';

@Component({
    selector: 'app-add-explorer',
    templateUrl: './add-explorer.component.html',
    styleUrls: ['./add-explorer.component.scss'],
    imports: [
        MatSlideToggleModule,
        MatIconModule,
        KeyValuePipe,
        TippyDirective,
    ]
})
export class AddExplorerComponent {
  toggledItems: string[] = [];
  guiTypes = guiTypes;

  #difficulties = eavConstants.pipelineDesigner.dataSourceDifficulties;

  #difficulty = signal(this.#difficulties.default);

  sorted = computed(() => filterAndSortDataSources(this.visualQueryService.dataSources(), this.#difficulty()));

  constructor(private visualQueryService: VisualQueryStateService) { }

  toggleDifficulty(event: MatSlideToggleChange) {
    const difficulty = event.checked ? this.#difficulties.advanced : this.#difficulties.default;
    this.#difficulty.set(difficulty);
  }

  addDataSource(dataSource: DataSource) {
    this.visualQueryService.addDataSource(dataSource);
  }

  toggleItem(item: string) {
    ArrayHelpers.toggleInArray(item, this.toggledItems);
  }

  trackGroups(index: number, type: KeyValue<string, DataSource[]>) {
    return type.key;
  }

  trackDataSources(index: number, dataSource: DataSource) {
    return dataSource.PartAssemblyAndType;
  }
}
