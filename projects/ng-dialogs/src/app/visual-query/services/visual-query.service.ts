import { Injectable, ViewContainerRef, NgZone, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subscription, fromEvent, Subject } from 'rxjs';
import { filter, startWith, map, pairwise } from 'rxjs/operators';
import cloneDeep from 'lodash-es/cloneDeep';

import { PipelineModel, PipelineDataSource, StreamWire, VisualDesignerData } from '../models/pipeline.model';
import { QueryDefinitionService } from './query-definition.service';
import { DataSource, DataSourceMetadata } from '../models/data-sources.model';
import { EditForm } from '../../shared/models/edit-form.model';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { QueryResultDialogData } from '../query-result/query-result.models';
import { QueryResultComponent } from '../query-result/query-result.component';
import { eavConstants } from '../../shared/constants/eav.constants';
import { MetadataService } from '../../permissions/services/metadata.service';
import { ContentTypesService } from '../../app-administration/services/content-types.service';
import { PipelineResult } from '../models/pipeline-result.model';

@Injectable()
export class VisualQueryService implements OnDestroy {
  pipelineModel$ = new BehaviorSubject<PipelineModel>(null);
  dataSources$ = new BehaviorSubject<DataSource[]>(null);
  forceRepaint$ = new Subject<void>();
  putEntityCountOnConnections$ = new Subject<PipelineResult>();

  private pipelineId: number;
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
  ) {
    const pipelineId = this.route.snapshot.paramMap.get('pipelineId');
    this.pipelineId = parseInt(pipelineId, 10);
  }

  ngOnDestroy() {
    this.pipelineModel$.complete();
    this.dataSources$.complete();
    this.forceRepaint$.complete();
    this.putEntityCountOnConnections$.complete();
    this.subscription.unsubscribe();
  }

  init() {
    this.fetchPipeline();
    this.fetchDataSources();
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

  repaint() {
    this.forceRepaint$.next();
  }

  addDataSource(dataSource: DataSource) {
    const pipelineModel = cloneDeep(this.pipelineModel$.value);
    const newPipelineDataSource: PipelineDataSource = {
      Description: '',
      EntityGuid: 'unsaved' + (pipelineModel.DataSources.length + 1),
      EntityId: undefined,
      Name: this.queryDefinitionService.typeNameFilter(dataSource.PartAssemblyAndType, 'className'),
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
    pipelineDataSource.VisualDesignerData = { ...pipelineDataSource.VisualDesignerData, ...position };
    this.pipelineModel$.next(pipelineModel);
  }

  editDataSource(pipelineDataSource: PipelineDataSource) {
    const dataSource = this.dataSources$.value.find(ds => ds.PartAssemblyAndType === pipelineDataSource.PartAssemblyAndType);

    const contentTypeName = dataSource?.ContentType
      ? dataSource.ContentType
      : '|Config ' + this.queryDefinitionService.typeNameFilter(pipelineDataSource.PartAssemblyAndType, 'classFullName');

    const typeId = eavConstants.metadata.entity.type;
    const keyType = eavConstants.keyTypes.guid;
    const key = pipelineDataSource.EntityGuid;

    // Query for existing Entity
    this.metadataService.getMetadata(typeId, keyType, key, contentTypeName).subscribe((metadata: DataSourceMetadata[]) => {
      // Edit existing Entity
      if (metadata.length) {
        const form: EditForm = {
          items: [{ EntityId: metadata[0].Id }],
        };
        const formUrl = convertFormToUrl(form);
        this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
        return;
      }

      // Check if the type exists, and if yes, create new Entity
      this.contentTypesService.getDetails(contentTypeName, { ignoreErrors: 'true' }).subscribe({
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
        error: error => {
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
      error: error => {
        this.snackBar.open('Save Pipeline failed', null, { duration: 2000 });
      }
    });
  }

  private runPipeline() {
    this.snackBar.open('Running query...');
    this.queryDefinitionService.runPipeline(this.pipelineModel$.value.Pipeline.EntityId).subscribe({
      next: pipelineResult => {
        this.snackBar.open('Query worked', null, { duration: 2000 });
        // open modal with the results
        const dialogData: QueryResultDialogData = {
          testParameters: this.pipelineModel$.value.Pipeline.TestParameters,
          result: pipelineResult,
        };
        this.dialog.open(QueryResultComponent, {
          data: dialogData,
          backdropClass: 'dialog-backdrop',
          panelClass: ['dialog-panel', `dialog-panel-medium`, 'no-scrollbar'],
          viewContainerRef: this.viewContainerRef,
          autoFocus: false,
          closeOnNavigation: false,
          // spm NOTE: used to force align-items: flex-start; on cdk-global-overlay-wrapper.
          // Real top margin is overwritten in css e.g. dialog-panel-large
          position: { top: '0' },
        });
        console.warn(pipelineResult);
        setTimeout(() => { this.putEntityCountOnConnections$.next(pipelineResult); });
      },
      error: error => {
        this.snackBar.open('Query failed', null, { duration: 2000 });
      }
    });
  }

  private fetchPipeline(reloadingSnackBar = false) {
    if (reloadingSnackBar) {
      this.snackBar.open('Reloading query, please wait...');
    }
    this.queryDefinitionService.fetchPipeline(this.pipelineId).subscribe(pipelineModel => {
      if (reloadingSnackBar) {
        this.snackBar.open('Query reloaded', null, { duration: 2000 });
      }
      this.pipelineModel$.next(pipelineModel);
      this.titleService.setTitle(`${pipelineModel.Pipeline.Name} - Visual Query`);
    });
  }

  private fetchDataSources() {
    this.queryDefinitionService.fetchDataSources().subscribe(dataSources => {
      this.dataSources$.next(dataSources);
    });
  }

  private attachKeyboardSave() {
    this.zone.runOutsideAngular(() => {
      this.subscription.add(
        fromEvent(window, 'keydown').pipe(
          filter(() => !this.route.snapshot.firstChild),
          filter((event: KeyboardEvent) => {
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
        filter(hadAndHasChild => hadAndHasChild[0] && !hadAndHasChild[1]),
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
