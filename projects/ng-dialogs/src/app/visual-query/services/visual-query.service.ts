import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, NgZone, OnDestroy, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import cloneDeep from 'lodash-es/cloneDeep';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { GeneralHelpers } from '../../../../../edit/shared/helpers';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { MetadataService } from '../../permissions/services/metadata.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
// tslint:disable-next-line:max-line-length
import { DataSource, DataSourceMetadata, DebugStreamInfo, PipelineDataSource, PipelineModel, PipelineResult, PipelineResultStream, StreamWire, VisualDesignerData } from '../models';
import { QueryResultComponent } from '../query-result/query-result.component';
import { QueryResultDialogData } from '../query-result/query-result.models';
import { StreamErrorResultComponent } from '../stream-error-result/stream-error-result.component';
import { StreamErrorResultDialogData } from '../stream-error-result/stream-error-result.models';
import { QueryDefinitionService } from './query-definition.service';

@Injectable()
export class VisualQueryService implements OnDestroy {
  pipelineModel$ = new BehaviorSubject<PipelineModel>(null);
  dataSources$ = new BehaviorSubject<DataSource[]>(null);
  putEntityCountOnConnections$ = new Subject<PipelineResult>();
  pipelineResult?: PipelineResult;

  private pipelineId = parseInt(this.route.snapshot.paramMap.get('pipelineId'), 10);
  private doRefresh = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private queryDefinitionService: QueryDefinitionService,
    private titleService: Title,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private zone: NgZone,
    private metadataService: MetadataService,
    private contentTypesService: ContentTypesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnDestroy() {
    this.pipelineModel$.complete();
    this.dataSources$.complete();
    this.putEntityCountOnConnections$.complete();
    this.subscription.unsubscribe();
  }

  init() {
    this.fetchDataSources(() => this.fetchPipeline());
    this.attachKeyboardSave();
    this.refreshOnChildClosed();
  }

  editPipelineEntity() {
    // save Pipeline, then open Edit Dialog
    this.savePipeline(() => {
      const form: EditForm = {
        items: [{ EntityId: this.pipelineModel$.value.Pipeline.EntityId }],
      };
      const formUrl = convertFormToUrl(form);
      this.doRefresh = true;
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
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
    const visualDesignerData: Record<string, any> = GeneralHelpers.tryParse(pipelineModel.Pipeline.VisualDesignerData) ?? {};
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

  editDataSource(pipelineDataSource: PipelineDataSource) {
    const dataSource = this.dataSources$.value.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);

    // const contentTypeName = dataSource?.ContentType
    //   ?? '|Config ' + this.queryDefinitionService.typeNameFilter(pipelineDataSource.PartAssemblyAndType, 'classFullName');
    const contentTypeName = dataSource.ContentType;
    const typeId = eavConstants.metadata.entity.type;
    const keyType = eavConstants.metadata.entity.keyType;
    const key = pipelineDataSource.EntityGuid;

    // query for existing Entity
    this.metadataService.getMetadata<DataSourceMetadata[]>(typeId, keyType, key, contentTypeName).subscribe(metadata => {
      // edit existing Entity
      if (metadata.length) {
        const form: EditForm = {
          items: [{ EntityId: metadata[0].Id }],
        };
        const formUrl = convertFormToUrl(form);
        this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
        return;
      }

      // Check if the type exists, and if yes, create new Entity
      this.contentTypesService.retrieveContentType(contentTypeName /*, { ignoreErrors: 'true' } */).subscribe({
        next: contentType => {
          const form: EditForm = {
            items: [{
              ContentTypeName: contentTypeName,
              For: {
                Target: eavConstants.metadata.entity.target,
                Guid: key,
              }
            }],
          };
          const formUrl = convertFormToUrl(form);
          this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
        },
        error: (error: HttpErrorResponse) => {
          alert('Server reports error - this usually means that this data-source doesn\'t have any configuration');
        }
      });
    });
  }

  private savePipeline(callback?: () => void) {
    this.snackBar.open('Saving...');
    this.queryDefinitionService.savePipeline(this.pipelineModel$.value).subscribe({
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
    this.queryDefinitionService.runPipeline(this.pipelineModel$.value.Pipeline.EntityId, top).subscribe({
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

    if (stream.Count === 0) { return; }

    this.snackBar.open('Running stream...');
    const pipelineId = this.pipelineModel$.value.Pipeline.EntityId;
    this.queryDefinitionService.debugStream(pipelineId, stream.Source, stream.SourceOut, top).subscribe({
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

  private fetchPipeline(reloadingSnackBar = false) {
    if (reloadingSnackBar) {
      this.snackBar.open('Reloading query, please wait...');
    }
    this.queryDefinitionService.fetchPipeline(this.pipelineId, this.dataSources$.value).subscribe(pipelineModel => {
      if (reloadingSnackBar) {
        this.snackBar.open('Query reloaded', null, { duration: 2000 });
      }
      this.pipelineModel$.next(pipelineModel);
      this.titleService.setTitle(`${pipelineModel.Pipeline.Name} - Visual Query`);
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
    this.queryDefinitionService.fetchDataSources().subscribe(dataSources => {
      this.dataSources$.next(dataSources);
      callback();
    });
  }

  private attachKeyboardSave() {
    this.zone.runOutsideAngular(() => {
      this.subscription.add(
        fromEvent<KeyboardEvent>(window, 'keydown').pipe(
          filter(() => !this.route.snapshot.firstChild),
          filter(event => {
            const CTRL_S = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.keyCode === 83;
            return CTRL_S;
          }),
        ).subscribe(event => {
          event.preventDefault();
          this.zone.run(() => { this.savePipeline(); });
        })
      );
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
        filter(() => {
          const refresh = this.doRefresh;
          this.doRefresh = false;
          return refresh;
        }),
      ).subscribe(() => {
        this.fetchPipeline(true);
      })
    );
  }

}
