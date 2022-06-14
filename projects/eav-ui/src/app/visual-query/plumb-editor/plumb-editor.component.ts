// tslint:disable-next-line:max-line-length
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../edit/shared/helpers';
import { eavConstants } from '../../shared/constants/eav.constants';
import { loadScripts } from '../../shared/helpers/load-scripts.helper';
import { PipelineDataSource, PipelineResultStream, VisualDesignerData } from '../models';
import { QueryDefinitionService } from '../services/query-definition.service';
import { VisualQueryService } from '../services/visual-query.service';
import { calculateTypeInfos } from './plumb-editor.helpers';
import { PlumbEditorTemplateModel } from './plumb-editor.models';
import { dataSrcIdPrefix, Plumber } from './plumber.helper';

const jsPlumbUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jsPlumb/2.14.5/js/jsplumb.min.js';

@Component({
  selector: 'app-plumb-editor',
  templateUrl: './plumb-editor.component.html',
  styles: [':host { display: block; width: 100%; height: 100%; }'],
  styleUrls: ['./plumb-editor.component.scss'],
})
export class PlumbEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('domRoot') private domRootRef: ElementRef<HTMLDivElement>;
  @ViewChildren('domDataSource') private domDataSourcesRef: QueryList<ElementRef<HTMLDivElement>>;

  dataSrcIdPrefix = dataSrcIdPrefix;
  templateModel$: Observable<PlumbEditorTemplateModel>;
  hardReset = false;

  private plumber: Plumber;
  private scriptLoaded$ = new BehaviorSubject(false);
  private subscription = new Subscription();

  constructor(
    private visualQueryService: VisualQueryService,
    private queryDefinitionService: QueryDefinitionService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
    loadScripts([{ test: 'jsPlumb', src: jsPlumbUrl }], () => {
      this.scriptLoaded$.next(true);
    });

    this.subscription.add(
      this.visualQueryService.putEntityCountOnConnections$.subscribe(result => {
        this.plumber.putEntityCountOnConnections(result);
      })
    );

    const pipelineDesignerData$ = this.visualQueryService.pipelineModel$.pipe(
      map(pipelineModel => GeneralHelpers.tryParse(pipelineModel?.Pipeline.VisualDesignerData) ?? {}),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.templateModel$ = combineLatest([
      this.visualQueryService.pipelineModel$,
      this.visualQueryService.dataSources$,
      pipelineDesignerData$,
      this.visualQueryService.dataSourceConfigs$,
    ]).pipe(
      map(([pipelineModel, dataSources, pipelineDesignerData, dataSourceConfigs]) => {
        if (pipelineModel == null || dataSources == null) { return; }

        // workaround for jsPlumb not working with dom elements which it initialized on previously.
        // This wipes dom entirely and gives us new elements
        this.hardReset = true;
        this.changeDetectorRef.detectChanges();
        this.hardReset = false;
        const templateModel: PlumbEditorTemplateModel = {
          pipelineDataSources: pipelineModel.DataSources,
          typeInfos: calculateTypeInfos(pipelineModel.DataSources, dataSources),
          allowEdit: pipelineModel.Pipeline.AllowEdit,
          showDataSourceDetails: pipelineDesignerData.ShowDataSourceDetails ?? false,
          dataSourceConfigs,
        };
        return templateModel;
      }),
    );
  }

  ngAfterViewInit() {
    // https://stackoverflow.com/questions/37087864/execute-a-function-when-ngfor-finished-in-angular-2/37088348#37088348
    const domDataSourcesLoaded$ = this.domDataSourcesRef.changes.pipe(map(() => true));

    this.subscription.add(
      combineLatest([this.scriptLoaded$, domDataSourcesLoaded$]).subscribe(([scriptLoaded, domDataSourcesLoaded]) => {
        if (!scriptLoaded || !domDataSourcesLoaded) { return; }

        this.plumber?.destroy();
        this.plumber = new Plumber(
          this.domRootRef.nativeElement,
          this.visualQueryService.pipelineModel$.value,
          this.visualQueryService.dataSources$.value,
          this.onConnectionsChanged.bind(this),
          this.onDragend.bind(this),
          this.onDebugStream.bind(this),
          this.dialog,
          this.viewContainerRef,
          this.changeDetectorRef,
        );
      })
    );
  }

  ngOnDestroy() {
    this.plumber?.destroy();
    this.scriptLoaded$.complete();
    this.subscription.unsubscribe();
  }

  onConnectionsChanged() {
    const connections = this.plumber.getAllConnections();
    const streamsOut = this.plumber.getStreamsOut();
    this.visualQueryService.changeConnections(connections, streamsOut);
  }

  onDragend(pipelineDataSourceGuid: string, position: VisualDesignerData) {
    this.visualQueryService.changeDataSourcePosition(pipelineDataSourceGuid, position);
  }

  onDebugStream(stream: PipelineResultStream) {
    this.visualQueryService.debugStream(stream);
  }

  configureDataSource(dataSource: PipelineDataSource) {
    // ensure dataSource entity is saved
    if (dataSource.EntityGuid.includes('unsaved')) {
      this.visualQueryService.saveAndRun(true, false);
    } else {
      this.visualQueryService.editDataSource(dataSource);
    }
  }

  getTypeName(partAssemblyAndType: string) {
    const dataSource = this.visualQueryService.dataSources$.value.find(ds => ds.PartAssemblyAndType === partAssemblyAndType);
    return this.queryDefinitionService.typeNameFilter(dataSource?.TypeNameForUi || partAssemblyAndType, 'className');
  }

  isOutDataSource(pipelineDataSource: PipelineDataSource) {
    return pipelineDataSource.PartAssemblyAndType === eavConstants.pipelineDesigner.outDataSource.PartAssemblyAndType;
  }

  remove(pipelineDataSource: PipelineDataSource) {
    if (!confirm(`Delete ${pipelineDataSource.Name} data source?`)) { return; }

    this.plumber.removeEndpointsOnDataSource(pipelineDataSource.EntityGuid);
    const connections = this.plumber.getAllConnections();
    const streamsOut = this.plumber.getStreamsOut();
    this.visualQueryService.removeDataSource(pipelineDataSource.EntityGuid, connections, streamsOut);
  }

  openHelp(url: string) {
    window.open(url, '_blank');
  }

  editName(dataSource: PipelineDataSource) {
    const newName = prompt('Rename data source', dataSource.Name)?.trim();
    if (newName == null || newName === '') { return; }

    this.visualQueryService.renameDataSource(dataSource.EntityGuid, newName);
  }

  editDescription(dataSource: PipelineDataSource) {
    const newDescription = prompt('Edit description', dataSource.Description)?.trim();
    if (newDescription == null) { return; }

    this.visualQueryService.changeDataSourceDescription(dataSource.EntityGuid, newDescription);
  }

}
