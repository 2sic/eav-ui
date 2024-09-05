import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, NgZone, OnDestroy, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import cloneDeep from 'lodash-es/cloneDeep';
import { BehaviorSubject, filter, fromEvent, Subject } from 'rxjs';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { MetadataService } from '../../permissions/services/metadata.service';
import { QueryDefinitionService } from './query-definition.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
// tslint:disable-next-line:max-line-length
import { DataSource, DataSourceConfig, DataSourceConfigs, DebugStreamInfo, PipelineDataSource, PipelineModel, PipelineResult, PipelineResultStream, StreamWire, VisualDesignerData } from '../models';
import { QueryResultComponent } from '../query-result/query-result.component';
import { QueryResultDialogData } from '../query-result/query-result.models';
import { StreamErrorResultComponent } from '../stream-error-result/stream-error-result.component';
import { StreamErrorResultDialogData } from '../stream-error-result/stream-error-result.models';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { transient } from '../../core';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { ServiceBase } from '../../shared/services/service-base';
import { isCtrlS } from '../../edit/dialog/main/keyboard-shortcuts';

/**
 * Service containing the state for the visual query.
 * It's shared, so should not be used with transient(...);
 */
@Injectable()
export class VisualQueryStateService extends ServiceBase implements OnDestroy {

  #contentTypesSvc = transient(ContentTypesService);
  #metadataSvc = transient(MetadataService);
  #queryDefSvc = transient(QueryDefinitionService);
  #dialogRoute = transient(DialogRoutingService);
  #titleSvc = transient(Title);


  pipelineModel$ = new BehaviorSubject<PipelineModel>(null);
  dataSources$ = new BehaviorSubject<DataSource[]>(null);
  putEntityCountOnConnections$ = new Subject<PipelineResult>();
  dataSourceConfigs$ = new BehaviorSubject<DataSourceConfigs>({});
  pipelineResult?: PipelineResult;

  #pipelineId = parseInt(this.#dialogRoute.snapshot.paramMap.get('pipelineId'), 10);
  #refreshPipeline = false;
  #refreshDataSourceConfigs = false;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnDestroy() {
    this.pipelineModel$.complete();
    this.dataSources$.complete();
    this.putEntityCountOnConnections$.complete();
    super.destroy();
  }

  init() {
    this.fetchDataSources(() => this.fetchPipeline(true, true, false));
    this.attachKeyboardSave();
    this.#dialogRoute.doOnDialogClosed(() => {
      if (this.#refreshPipeline || this.#refreshDataSourceConfigs)
        this.fetchPipeline(this.#refreshPipeline, this.#refreshDataSourceConfigs, this.#refreshPipeline);
      this.#refreshPipeline = false;
      this.#refreshDataSourceConfigs = false;
    });
  }

  editPipelineEntity() {
    // save Pipeline, then open Edit Dialog
    this.savePipeline(() => {
      const form: EditForm = {
        items: [EditPrep.editId(this.pipelineModel$.value.Pipeline.EntityId)],
      };
      const formUrl = convertFormToUrl(form);
      this.#dialogRoute.navRelative([`edit/${formUrl}`]);
      this.#refreshPipeline = true;
    });
  }

  saveAndRun(save: boolean, run: boolean) {
    if (save && run) {
      this.savePipeline(() => { this.runPipeline(); });
    } else if (save) {
      this.savePipeline();
    } else if (run) {
      this.runPipeline();
    }
  }

  showDataSourceDetails(showDetails: boolean) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    const visualDesignerData: Record<string, any> = JsonHelpers.tryParse(pipelineModel.Pipeline.VisualDesignerData) ?? {};
    visualDesignerData.ShowDataSourceDetails = showDetails;
    pipelineModel.Pipeline.VisualDesignerData = JSON.stringify(visualDesignerData);
    this.pipelineModel$.next(pipelineModel);
  }

  addDataSource(dataSource: DataSource) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    const newPipelineDataSource: PipelineDataSource = {
      Description: '',
      EntityGuid: 'unsaved' + (pipelineModel.DataSources.length + 1),
      EntityId: undefined,
      Name: dataSource.Name,
      PartAssemblyAndType: dataSource.PartAssemblyAndType,
      VisualDesignerData: { Top: 100, Left: 100 },
    };
    pipelineModel.DataSources.push(newPipelineDataSource);
    this.pipelineModel$.next(pipelineModel);
    this.savePipeline();
  }

  removeDataSource(pipelineDataSourceGuid: string, connections: StreamWire[], streamsOut: string) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    pipelineModel.DataSources = pipelineModel.DataSources.filter(pipelineDS => pipelineDS.EntityGuid !== pipelineDataSourceGuid);
    pipelineModel.Pipeline.StreamWiring = connections;
    pipelineModel.Pipeline.StreamsOut = streamsOut;
    this.pipelineModel$.next(pipelineModel);
  }

  renameDataSource(pipelineDataSourceGuid: string, name: string) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    const pipelineDataSource = pipelineModel.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
    pipelineDataSource.Name = name;
    this.pipelineModel$.next(pipelineModel);
  }

  changeDataSourceDescription(pipelineDataSourceGuid: string, description: string) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    const pipelineDataSource = pipelineModel.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
    pipelineDataSource.Description = description;
    this.pipelineModel$.next(pipelineModel);
  }

  changeConnections(connections: StreamWire[], streamsOut: string) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    pipelineModel.Pipeline.StreamWiring = connections;
    pipelineModel.Pipeline.StreamsOut = streamsOut;
    this.pipelineModel$.next(pipelineModel);
  }

  changeDataSourcePosition(pipelineDataSourceGuid: string, position: VisualDesignerData) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    const pipelineDataSource = pipelineModel.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
    if (!pipelineDataSource) {
      // spm NOTE: fixes problem where dataSource position can't be updated if dataSource with guid unsavedXX gets saved while dragging.
      // Can happen if dataSource is just added and user drags it and save happens.
      return;
    }
    pipelineDataSource.VisualDesignerData = { ...pipelineDataSource.VisualDesignerData, ...position };
    this.pipelineModel$.next(pipelineModel);
  }

  private calculateDataSourceConfigs(dataSources: PipelineDataSource[]) {
    const dataSourceConfigs: DataSourceConfigs = {};
    dataSources.forEach(dataSource => {
      if (dataSource.EntityId == null) return;
      dataSourceConfigs[dataSource.EntityId] = [];
      dataSource.Metadata?.forEach(metadataItem => {
        Object.entries(metadataItem).forEach(([attributeName, attributeValue]) => {
          if (attributeValue == null || attributeValue === '') return;
          if (['Created', 'Guid', 'Id', 'Modified', 'Title', '_Type'].includes(attributeName)) return;
          if (Array.isArray(attributeValue) && attributeValue[0]?.Title != null && attributeValue[0]?.Id != null) {
            attributeValue = `${attributeValue[0].Title} (${attributeValue[0].Id})`;
          }
          const dataSourceConfig: DataSourceConfig = {
            name: attributeName,
            value: attributeValue,
          };
          dataSourceConfigs[dataSource.EntityId].push(dataSourceConfig);
        });
      });
    });
    this.dataSourceConfigs$.next(dataSourceConfigs);
  }

  editDataSource(pipelineDataSource: PipelineDataSource) {
    const dataSource = this.dataSources$.value.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
    const contentTypeName = dataSource.ContentType;
    const targetType = eavConstants.metadata.entity.targetType;
    const keyType = eavConstants.metadata.entity.keyType;
    const key = pipelineDataSource.EntityGuid;

    // query for existing Entity
    this.#metadataSvc.getMetadata(targetType, keyType, key, contentTypeName).subscribe(metadata => {
      // edit existing Entity
      if (metadata.Items.length) {
        const form: EditForm = {
          items: [EditPrep.editId(metadata.Items[0].Id)],
        };
        const formUrl = convertFormToUrl(form);
        this.#dialogRoute.navRelative([`edit/${formUrl}`]);
        this.#refreshDataSourceConfigs = true;
        return;
      }

      // Check if the type exists, and if yes, create new Entity
      this.#contentTypesSvc.retrieveContentType(contentTypeName).subscribe({
        next: contentType => {
          if (contentType == null) {
            this.snackBar.open('DataSource doesn\'t have any configuration', undefined, { duration: 3000 });
            return;
          }
          const form: EditForm = {
            items: [ EditPrep.newMetadata(key, contentTypeName, eavConstants.metadata.entity) ],
          };
          const formUrl = convertFormToUrl(form);
          this.#dialogRoute.navRelative([`edit/${formUrl}`]);
          this.#refreshDataSourceConfigs = true;
        },
        error: (error: HttpErrorResponse) => {
          const message = 'Server reports error - this usually means that this DataSource doesn\'t have any configuration';
          this.snackBar.open(message, undefined, { duration: 3000 });
        }
      });
    });
  }

  private savePipeline(callback?: () => void) {
    this.snackBar.open('Saving...');
    this.#queryDefSvc.savePipeline(this.pipelineModel$.value).subscribe({
      next: pipelineModel => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.pipelineModel$.next(pipelineModel);
        if (callback != null) { callback(); }
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Save Pipeline failed', null, { duration: 2000 });
      }
    });
  }

  runPipeline(top = 25) {
    this.snackBar.open('Running query...');
    this.#queryDefSvc.runPipeline(this.pipelineModel$.value.Pipeline.EntityId, top).subscribe({
      next: pipelineResult => {
        this.snackBar.open('Query worked', null, { duration: 2000 });
        this.pipelineResult = pipelineResult;
        this.showQueryResult(pipelineResult, top);
        console.warn(pipelineResult);
        // push cloned pipelineModel to reset jsPlumb
        this.pipelineModel$.next(cloneDeep(this.pipelineModel$.value));
        setTimeout(() => { this.putEntityCountOnConnections$.next(pipelineResult); });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Query failed', null, { duration: 2000 });
      }
    });
  }

  debugStream(stream: PipelineResultStream, top = 25) {
    if (stream.Error) {
      this.showStreamErrorResult(stream);
      return;
    }

    if (stream.Count === 0) return;

    this.snackBar.open('Running stream...');
    const pipelineId = this.pipelineModel$.value.Pipeline.EntityId;
    this.#queryDefSvc.debugStream(pipelineId, stream.Source, stream.SourceOut, top).subscribe({
      next: streamResult => {
        this.snackBar.open('Stream worked', null, { duration: 2000 });
        const pipelineDataSource = this.pipelineModel$.value.DataSources.find(ds => ds.EntityGuid === stream.Source);
        const debugStream: DebugStreamInfo = {
          name: stream.SourceOut,
          source: stream.Source,
          sourceName: pipelineDataSource.Name,
          original: stream,
        };
        this.showQueryResult(streamResult, top, debugStream);
        console.warn(streamResult);
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Stream failed', null, { duration: 2000 });
      },
    });
  }

  private fetchPipeline(refreshPipeline: boolean, refreshDataSourceConfigs: boolean, showSnackBar: boolean) {
    if (showSnackBar) {
      this.snackBar.open('Reloading query, please wait...');
    }
    this.#queryDefSvc.fetchPipeline(this.#pipelineId, this.dataSources$.value).subscribe(pipelineModel => {
      if (showSnackBar) {
        this.snackBar.open('Query reloaded', null, { duration: 2000 });
      }
      this.#titleSvc.setTitle(`${pipelineModel.Pipeline.Name} - Visual Query`);
      if (refreshPipeline) {
        this.pipelineModel$.next(pipelineModel);
      }
      if (refreshDataSourceConfigs) {
        this.calculateDataSourceConfigs(pipelineModel.DataSources);
      }
    });
  }

  private showQueryResult(result: PipelineResult, top: number, debugStream?: DebugStreamInfo) {
    const dialogData: QueryResultDialogData = {
      result,
      debugStream,
      top,
    };
    this.dialog.open(QueryResultComponent, {
      autoFocus: false,
      backdropClass: 'dialog-backdrop',
      closeOnNavigation: false,
      data: dialogData,
      panelClass: ['dialog-panel', `dialog-panel-medium`, 'no-scrollbar'],
      // spm NOTE: position used to force align-items: flex-start; on cdk-global-overlay-wrapper.
      // Real top margin is overwritten in css e.g. dialog-panel-large
      position: { top: '0' },
      viewContainerRef: this.viewContainerRef,
    });
    this.changeDetectorRef.markForCheck();
  }

  private showStreamErrorResult(stream: PipelineResultStream) {
    const dialogData: StreamErrorResultDialogData = {
      errorData: stream.ErrorData,
    };
    this.dialog.open(StreamErrorResultComponent, {
      autoFocus: false,
      backdropClass: 'dialog-backdrop',
      closeOnNavigation: false,
      data: dialogData,
      panelClass: ['dialog-panel', `dialog-panel-medium`, 'no-scrollbar'],
      // spm NOTE: position used to force align-items: flex-start; on cdk-global-overlay-wrapper.
      // Real top margin is overwritten in css e.g. dialog-panel-large
      position: { top: '0' },
      viewContainerRef: this.viewContainerRef,
    });
    this.changeDetectorRef.markForCheck();
  }

  private fetchDataSources(callback?: () => void) {
    this.#queryDefSvc.fetchDataSources().subscribe(dataSources => {
      this.dataSources$.next(dataSources);
      callback();
    });
  }

  private attachKeyboardSave() {
    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        fromEvent<KeyboardEvent>(window, 'keydown').pipe(
          filter(() => !this.#dialogRoute.snapshot.firstChild),
          filter(event => isCtrlS(event)),
        ).subscribe(event => {
          event.preventDefault();
          this.zone.run(() => { this.savePipeline(); });
        })
      );
    });
  }
}
