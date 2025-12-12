// tslint:disable-next-line:max-line-length
import { NgClass, NgStyle } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, computed, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { transient } from '../../../../../core';
import { BaseComponent } from '../../shared/components/base';
import { eavConstants } from '../../shared/constants/eav.constants';
import { MousedownStopPropagationDirective } from '../../shared/directives/mousedown-stop-propagation.directive';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { loadScripts } from '../../shared/helpers/load-scripts.helper';
import { classLog } from '../../shared/logging';
import { PipelineDataSource, PipelineResultStream, VisualDesignerData } from '../models';
import { QueryDefinitionService } from '../services/query-definition.service';
import { VisualQueryStateService } from '../services/visual-query.service';
import { findDefByType } from './datasource.helpers';
import { calculateTypeInfos } from './plumb-editor.helpers';
import { domIdOfGuid } from './plumber-constants';
import { Plumber } from './plumber.helper';

const logSpecs = {
  all: false,
  ngAfterViewInit: false,
}

const jsPlumbUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jsPlumb/2.14.5/js/jsplumb.min.js';

@Component({
    selector: 'app-plumb-editor',
    templateUrl: './plumb-editor.component.html',
    styles: [':host { display: block; width: 100%; height: 100%; }'],
    imports: [
        NgStyle,
        NgClass,
        MatIconModule,
        MousedownStopPropagationDirective,
    ]
})
export class PlumbEditorComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  log = classLog({ PlumbEditorComponent }, logSpecs);

  @ViewChild('domRoot') private domRootRef: ElementRef<HTMLDivElement>;
  @ViewChildren('domDataSource') private domDataSourcesRef: QueryList<ElementRef<HTMLDivElement>>;

  /** provide this fn to the UI */
  domIdOfGuid = domIdOfGuid;
  hardReset = false;

  #plumber: Plumber;
  #scriptLoaded$ = new BehaviorSubject(false);


  #queryDefinitionSvc = transient(QueryDefinitionService);

  showDataSourceDetails = computed(() => {
    const result = JsonHelpers.tryParse(this.visQuerySvc.pipelineModel()?.Pipeline.VisualDesignerData) ?? {};
    return result.ShowDataSourceDetails ?? false;
  });

  typeInfos = computed(() =>
    calculateTypeInfos(this.visQuerySvc.pipelineModel()?.DataSources ?? [], this.visQuerySvc.dataSources()
    ));

  constructor(
    public visQuerySvc: VisualQueryStateService, // Check if this not with transient better
    private changeDetectorRef: ChangeDetectorRef,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { super(); }

  ngOnInit() {
    loadScripts([{ test: 'jsPlumb', src: jsPlumbUrl }], () => {
      this.#scriptLoaded$.next(true);
    });

    this.subscriptions.add(
      this.visQuerySvc.putEntityCountOnConnections$.subscribe(result => {
        this.#plumber.lineDecorator.addEntityCount(result);
      })
    );
  }

  ngAfterViewInit() {
    const l = this.log.fnIf('ngAfterViewInit');
    // https://stackoverflow.com/questions/37087864/execute-a-function-when-ngfor-finished-in-angular-2/37088348#37088348
    const domDataSourcesLoaded$ = this.domDataSourcesRef.changes.pipe(map(() => true));

    this.subscriptions.add(
      combineLatest([this.#scriptLoaded$, domDataSourcesLoaded$]).subscribe(([scriptLoaded, domDataSourcesLoaded]) => {
        if (!scriptLoaded || !domDataSourcesLoaded)
          return;

        l.a('scriptLoaded and domDataSourcesLoaded', { scriptLoaded, domDataSourcesLoaded });

        this.#plumber?.destroy();
        this.#plumber = new Plumber(
          this.domRootRef.nativeElement,
          this.visQuerySvc.pipelineModel(),
          this.visQuerySvc.dataSources(),
          () => this.onConnectionsChanged(),
          this.onDragend.bind(this),
          this.onDebugStream.bind(this),
          {
            matDialog: this.matDialog,
            viewContainerRef: this.viewContainerRef,
            changeDetectorRef: this.changeDetectorRef,
            onConnectionsChanged: () => this.onConnectionsChanged(),
          },
        );
      })
    );
    l.end();
  }

  ngOnDestroy() {
    this.#plumber?.destroy();
    this.#scriptLoaded$.complete();
    super.ngOnDestroy();
  }

  onConnectionsChanged() {
    const connections = this.#plumber.connections.getAll();
    const streamsOut = this.#plumber.getStreamsOut();
    this.visQuerySvc.changeConnections(connections, streamsOut);
  }

  onDragend(pipelineDataSourceGuid: string, position: VisualDesignerData) {
    this.visQuerySvc.changeDataSourcePosition(pipelineDataSourceGuid, position);
  }

  onDebugStream(stream: PipelineResultStream) {
    this.visQuerySvc.debugStream(stream);
  }

  configureDataSource(dataSource: PipelineDataSource): void {
    // ensure dataSource entity is saved
    if (dataSource.EntityGuid.includes('unsaved'))
      return this.visQuerySvc.saveAndRun(true, false);

    this.visQuerySvc.editDataSource(dataSource);
  }

  getTypeName(partAssemblyAndType: string) {
    const dataSource = findDefByType(this.visQuerySvc.dataSources(), partAssemblyAndType);
    return this.#queryDefinitionSvc.typeNameFilter(dataSource?.TypeNameForUi || partAssemblyAndType, 'className');
  }

  isOutDataSource(pipelineDataSource: PipelineDataSource) {
    return pipelineDataSource.PartAssemblyAndType === eavConstants.pipelineDesigner.outDataSource.PartAssemblyAndType;
  }

  remove(pipelineDataSource: PipelineDataSource) {
    if (!confirm(`Delete ${pipelineDataSource.Name} data source?`))
      return;

    // Update UI
    this.#plumber.removeAllEndpoints(pipelineDataSource.EntityGuid);

    // Tell backend to clean up
    const connections = this.#plumber.connections.getAll();
    const streamsOut = this.#plumber.getStreamsOut();
    this.visQuerySvc.removeDataSource(pipelineDataSource.EntityGuid, connections, streamsOut);
  }

  openHelp(url: string) {
    window.open(url, '_blank');
  }

  editName(dataSource: PipelineDataSource) {
    const newName = prompt('Rename data source', dataSource.Name)?.trim();
    if (newName == null || newName === '')
      return;

    this.visQuerySvc.renameDataSource(dataSource.EntityGuid, newName);
  }

  editDescription(dataSource: PipelineDataSource) {
    const newDescription = prompt('Edit description', dataSource.Description)?.trim();
    if (newDescription == null)
      return;

    this.visQuerySvc.changeDataSourceDescription(dataSource.EntityGuid, newDescription);
  }

}
