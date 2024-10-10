import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, NgZone, OnDestroy, signal, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import cloneDeep from 'lodash-es/cloneDeep';
import { BehaviorSubject, filter, fromEvent, Subject } from 'rxjs';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { MetadataService } from '../../permissions/services/metadata.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { QueryDefinitionService } from './query-definition.service';
// tslint:disable-next-line:max-line-length
import { transient } from '../../../../../core';
import { isCtrlS } from '../../edit/dialog/main/keyboard-shortcuts';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { ServiceBase } from '../../shared/services/service-base';
import { DataSource, DataSourceConfig, DataSourceConfigs, DebugStreamInfo, PipelineDataSource, PipelineModel, PipelineResult, PipelineResultStream, StreamWire, VisualDesignerData } from '../models';
import { QueryResultComponent } from '../query-result/query-result.component';
import { QueryResultDialogData } from '../query-result/query-result.models';
import { StreamErrorResultComponent } from '../stream-error-result/stream-error-result.component';
import { StreamErrorResultDialogData } from '../stream-error-result/stream-error-result.models';

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

  // TODO: @2dm - wiso kann ich dies nicht löschen
  pipelineModel$ = new BehaviorSubject<PipelineModel>(null);

  pipelineModelSig = signal<PipelineModel>(null);
  dataSourcesSig = signal<DataSource[]>(null);
  dataSourceConfigsSig = signal<DataSourceConfigs>({});

  putEntityCountOnConnections$ = new Subject<PipelineResult>();

  queryResult?: PipelineResult;

  #pipelineId = parseInt(this.#dialogRoute.getParam('pipelineId'), 10);
  #refreshPipeline = false;
  #refreshDataSourceConfigs = false;

  constructor(
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnDestroy() {
    this.pipelineModel$.complete();
    this.putEntityCountOnConnections$.complete();
    super.ngOnDestroy();
  }

  init() {
    this.#fetchDataSources(() => this.#fetchPipeline(true, true, false));
    this.#attachKeyboardSave();
    this.#dialogRoute.doOnDialogClosed(() => {
      if (this.#refreshPipeline || this.#refreshDataSourceConfigs)
        this.#fetchPipeline(this.#refreshPipeline, this.#refreshDataSourceConfigs, this.#refreshPipeline);
      this.#refreshPipeline = false;
      this.#refreshDataSourceConfigs = false;
    });
  }

  public editPipelineEntity() {
    // save Pipeline, then open Edit Dialog
    this.#savePipeline(() => {
      const form: EditForm = {
        items: [EditPrep.editId(this.pipelineModelSig().Pipeline.EntityId)],
      };
      const formUrl = convertFormToUrl(form);
      this.#dialogRoute.navRelative([`edit/${formUrl}`]);
      this.#refreshPipeline = true;
    });
  }

  public saveAndRun(save: boolean, run: boolean): void {
    if (save && run)
      return this.#savePipeline(() => this.runPipeline());

    if (save)
      return this.#savePipeline();

    if (run)
      return this.runPipeline();
  }

  showDataSourceDetails(showDetails: boolean) {
    const query = cloneDeep(this.pipelineModelSig());
    const designerData: Record<string, any> = JsonHelpers.tryParse(query.Pipeline.VisualDesignerData) ?? {};
    designerData.ShowDataSourceDetails = showDetails;
    query.Pipeline.VisualDesignerData = JSON.stringify(designerData);
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
  }

  addDataSource(dataSource: DataSource) {
    const query = cloneDeep(this.pipelineModelSig());
    const newSource: PipelineDataSource = {
      Description: '',
      EntityGuid: 'unsaved' + (query.DataSources.length + 1),
      EntityId: undefined,
      Name: dataSource.Name,
      PartAssemblyAndType: dataSource.PartAssemblyAndType,
      VisualDesignerData: { Top: 100, Left: 100 },
    };
    query.DataSources.push(newSource);
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
    this.#savePipeline();
  }

  removeDataSource(pipelineDataSourceGuid: string, connections: StreamWire[], streamsOut: string) {
    const query = cloneDeep(this.pipelineModelSig());
    query.DataSources = query.DataSources.filter(pipelineDS => pipelineDS.EntityGuid !== pipelineDataSourceGuid);
    query.Pipeline.StreamWiring = connections;
    query.Pipeline.StreamsOut = streamsOut;
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
  }

  renameDataSource(pipelineDataSourceGuid: string, name: string) {
    const query = cloneDeep(this.pipelineModelSig());
    const dataSource = query.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
    dataSource.Name = name;
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
  }

  changeDataSourceDescription(pipelineDataSourceGuid: string, description: string) {
    const query = cloneDeep(this.pipelineModelSig());
    const dataSource = query.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
    dataSource.Description = description;
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
  }

  changeConnections(connections: StreamWire[], streamsOut: string) {
    const query = cloneDeep(this.pipelineModelSig());
    query.Pipeline.StreamWiring = connections;
    query.Pipeline.StreamsOut = streamsOut;
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
  }

  changeDataSourcePosition(pipelineDataSourceGuid: string, position: VisualDesignerData) {
    const query = cloneDeep(this.pipelineModelSig());
    const dataSource = query.DataSources.find(pipelineDS => pipelineDS.EntityGuid === pipelineDataSourceGuid);
    if (!dataSource) {
      // spm NOTE: fixes problem where dataSource position can't be updated if dataSource with guid unsavedXX gets saved while dragging.
      // Can happen if dataSource is just added and user drags it and save happens.
      return;
    }
    dataSource.VisualDesignerData = { ...dataSource.VisualDesignerData, ...position };
    this.pipelineModel$.next(query);
    this.pipelineModelSig.set(query);
  }

  #calculateDataSourceConfigs(dataSources: PipelineDataSource[]) {
    const dataSourceConfigs: DataSourceConfigs = {};
    dataSources.forEach(dataSource => {
      if (dataSource.EntityId == null) return;
      dataSourceConfigs[dataSource.EntityId] = [];
      dataSource.Metadata?.forEach(metadataItem => {
        Object.entries(metadataItem).forEach(([attributeName, attributeValue]) => {
          if (attributeValue == null || attributeValue === '') return;
          if (['Created', 'Guid', 'Id', 'Modified', 'Title', '_Type'].includes(attributeName)) return;
          if (Array.isArray(attributeValue) && attributeValue[0]?.Title !== null && attributeValue[0]?.Id !== null) {
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
    this.dataSourceConfigsSig.set(dataSourceConfigs);
  }

  editDataSource(pipelineDataSource: PipelineDataSource) {
    const dataSource = this.dataSourcesSig().find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);
    const contentTypeName = dataSource.ContentType;
    const { targetType, keyType } = eavConstants.metadata.entity;
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

  #savePipeline(callback?: () => void) {
    this.snackBar.open('Saving...');
    this.#queryDefSvc.savePipeline(this.pipelineModelSig()).subscribe({
      next: pipelineModel => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        this.pipelineModel$.next(pipelineModel);
        this.pipelineModelSig.set(pipelineModel);
        if (callback != null) { callback(); }
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Save Pipeline failed', null, { duration: 2000 });
      }
    });
  }

  runPipeline(top = 25) {
    this.snackBar.open('Running query...');
    this.#queryDefSvc.runPipeline(this.pipelineModelSig().Pipeline.EntityId, top).subscribe({
      next: pipelineResult => {
        this.snackBar.open('Query worked', null, { duration: 2000 });
        this.queryResult = pipelineResult;
        this.#showQueryResult(pipelineResult, top);
        console.warn(pipelineResult);
        // push cloned pipelineModel to reset jsPlumb
        this.pipelineModel$.next(cloneDeep(this.pipelineModel$.value));
        this.pipelineModelSig.set(cloneDeep(this.pipelineModelSig()));

        setTimeout(() => { this.putEntityCountOnConnections$.next(pipelineResult); });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Query failed', null, { duration: 2000 });
      }
    });
  }

  debugStream(stream: PipelineResultStream, top = 25): void {
    if (stream.Error)
      return this.#showStreamErrorResult(stream);

    if (stream.Count === 0)
      return;

    this.snackBar.open('Running stream...');
    const pipelineId = this.pipelineModelSig().Pipeline.EntityId;
    this.#queryDefSvc.debugStream(pipelineId, stream.Source, stream.SourceOut, top).subscribe({
      next: streamResult => {
        this.snackBar.open('Stream worked', null, { duration: 2000 });
        const pipelineDataSource = this.pipelineModelSig().DataSources.find(ds => ds.EntityGuid === stream.Source);
        const debugStream: DebugStreamInfo = {
          name: stream.SourceOut,
          source: stream.Source,
          sourceName: pipelineDataSource.Name,
          original: stream,
        };
        this.#showQueryResult(streamResult, top, debugStream);
        console.warn(streamResult);
      },
      error: (_: HttpErrorResponse) => {
        this.snackBar.open('Stream failed', null, { duration: 2000 });
      },
    });
  }

  #fetchPipeline(refreshPipeline: boolean, refreshDataSourceConfigs: boolean, showSnackBar: boolean) {
    if (showSnackBar)
      this.snackBar.open('Reloading query, please wait...');

    this.#queryDefSvc.fetchPipeline(this.#pipelineId, this.dataSourcesSig()).subscribe(pipelineModel => {
      if (showSnackBar)
        this.snackBar.open('Query reloaded', null, { duration: 2000 });

      this.#titleSvc.setTitle(`${pipelineModel.Pipeline.Name} - Visual Query`);
      if (refreshPipeline)
        this.pipelineModel$.next(pipelineModel);
      this.pipelineModelSig.set(pipelineModel);


      if (refreshDataSourceConfigs)
        this.#calculateDataSourceConfigs(pipelineModel.DataSources);
    });
  }

  #showQueryResult(result: PipelineResult, top: number, debugStream?: DebugStreamInfo) {
    const dialogData: QueryResultDialogData = {
      result,
      debugStream,
      top,
    };
    this.matDialog.open(QueryResultComponent, {
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

  #showStreamErrorResult(stream: PipelineResultStream) {
    const dialogData: StreamErrorResultDialogData = {
      errorData: stream.ErrorData,
    };
    this.matDialog.open(StreamErrorResultComponent, {
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

  #fetchDataSources(callback?: () => void) {
    this.#queryDefSvc.fetchDataSources().subscribe(dataSources => {
      this.dataSourcesSig.set(dataSources);
      callback();
    });
  }

  #attachKeyboardSave() {
    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        fromEvent<KeyboardEvent>(window, 'keydown').pipe(
          filter(() => !this.#dialogRoute.snapshot.firstChild),
          filter(event => isCtrlS(event)),
        ).subscribe(event => {
          event.preventDefault();
          this.zone.run(() => { this.#savePipeline(); });
        })
      );
    });
  }
}
