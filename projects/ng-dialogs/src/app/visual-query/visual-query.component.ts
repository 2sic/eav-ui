import { Component, OnInit, OnDestroy, NgZone, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, fromEvent } from 'rxjs';
import { filter, pairwise, map, startWith } from 'rxjs/operators';
import cloneDeep from 'lodash-es/cloneDeep';
import 'script-loader!node_modules/jsplumb/dist/js/jsPlumb-2.1.7-min.js';

import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { eavConstants } from '../shared/constants/eav.constants';
import { EditForm } from '../shared/models/edit-form.model';
import { DataSource, DataSourceMetadata } from './models/data-sources.model';
import { PlumbGuiService } from './services/plumb-gui.service';
import { QueryResultComponent } from './query-result/query-result.component';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { SaveRun } from './models/save-run.model';
import { QueryDef } from './models/query-def.model';
import { PlumbType } from './models/plumb.model';
import { QueryResultDialogData } from './query-result/query-result.models';
import { PipelineDataSource } from './models/pipeline.model';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss'],
  // spm TODO: this component can't be onPush yet because queryDef is mutated all the time
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualQueryComponent implements OnInit, OnDestroy {
  explorer = {
    run: 'run',
    add: 'add'
  };
  activeExplorer = this.explorer.run;
  queryDef: QueryDef;
  instance: PlumbType;

  private pipelineId: number;
  private subscription = new Subscription();

  constructor(
    private context: Context,
    private router: Router,
    private route: ActivatedRoute,
    private queryDefinitionService: QueryDefinitionService,
    private titleService: Title,
    private snackBar: MatSnackBar,
    private metadataService: MetadataService,
    private contentTypesService: ContentTypesService,
    private plumbGuiService: PlumbGuiService,
    private zone: NgZone,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.context.init(this.route);
    const pipelineId = this.route.snapshot.paramMap.get('pipelineId');
    this.pipelineId = parseInt(pipelineId, 10);
  }

  ngOnInit() {
    this.loadQuery();
    this.attachKeyboardSave();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleExplorer(explorer: string) {
    this.activeExplorer = (this.activeExplorer === explorer) ? null : explorer;
  }

  openHelp() {
    window.open('http://2sxc.org/help', '_blank');
  }

  editPipelineEntity() {
    // save Pipeline, then open Edit Dialog
    this.savePipeline(() => {
      const form: EditForm = {
        items: [{ EntityId: this.queryDef.id }],
      };
      const formUrl = convertFormToUrl(form);
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
    });
  }

  saveAndRun(saveAndRun: SaveRun) {
    const save = saveAndRun.save;
    const run = saveAndRun.run;
    if (save && run) {
      this.savePipeline(() => { this.runQuery(); });
    } else if (save) {
      this.savePipeline();
    } else if (run) {
      this.runQuery();
    }
  }

  savePipeline(callback?: () => void) {
    this.snackBar.open('Saving...');
    this.queryDef.readOnly = true;
    this.plumbGuiService.pushPlumbConfigToQueryDef(this.instance, this.queryDef);
    this.queryDefinitionService.save(this.queryDef).subscribe({
      next: pipelineModel => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        // Update PipelineData with data retrieved from the Server
        const newQueryDef = cloneDeep(this.queryDef);
        newQueryDef.data.Pipeline = pipelineModel.Pipeline;
        newQueryDef.id = pipelineModel.Pipeline.EntityId;
        this.router.navigateByUrl(this.router.url.replace('pipelineId', pipelineModel.Pipeline.EntityId.toString()));
        newQueryDef.readOnly = !pipelineModel.Pipeline.AllowEdit;
        newQueryDef.data.DataSources = pipelineModel.DataSources;
        this.queryDefinitionService.postProcessDataSources(newQueryDef.data);
        this.queryDef = newQueryDef;
        if (callback != null) { callback(); }
      },
      error: error => {
        this.snackBar.open('Save Pipeline failed', null, { duration: 2000 });
        this.queryDef.readOnly = false;
      }
    });
  }

  runQuery() {
    this.snackBar.open('Running query...');
    this.queryDefinitionService.queryPipeline(this.queryDef.id).subscribe({
      next: pipelineResult => {
        this.snackBar.open('Query worked', null, { duration: 2000 });
        // open modal with the results
        const dialogData: QueryResultDialogData = { testParameters: this.queryDef.data.Pipeline.TestParameters, result: pipelineResult };
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
        setTimeout(() => { this.plumbGuiService.putEntityCountOnConnections(pipelineResult, this.queryDef, this.instance); }, 0);
      },
      error: error => {
        this.snackBar.open('Query failed', null, { duration: 2000 });
      }
    });
  }

  repaint() {
    this.instance.repaintEverything();
  }

  addSelectedDataSource(dataSource: DataSource) {
    this.queryDefinitionService.addDataSource(this.queryDef, dataSource.PartAssemblyAndType, null, null, dataSource.Name);
    this.savePipeline();
  }

  instanceChanged(instance: PlumbType) {
    this.instance = instance;
  }

  // Get the URL to configure a DataSource
  editDataSourcePart(dataSource: PipelineDataSource) {
    const sourceDef = this.queryDef.data.InstalledDataSources
      .find(installedDataSource => installedDataSource.PartAssemblyAndType === dataSource.PartAssemblyAndType);

    const contentTypeName = (sourceDef?.ContentType)
      ? sourceDef.ContentType
      : '|Config ' + this.queryDefinitionService.typeNameFilter(dataSource.PartAssemblyAndType, 'classFullName');

    const assignmentObjectTypeId = eavConstants.metadata.entity.type;
    const keyGuid = dataSource.EntityGuid;

    // Query for existing Entity
    this.metadataService
      .getMetadata(assignmentObjectTypeId, eavConstants.keyTypes.guid, keyGuid, contentTypeName)
      .subscribe((metadata: DataSourceMetadata[]) => {
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
                  Guid: keyGuid,
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

  private loadQuery(reloadingSnackBar = false) {
    if (reloadingSnackBar) {
      this.snackBar.open('Reloading query, please wait...');
    }
    this.queryDefinitionService.loadQuery(this.pipelineId).subscribe(queryDef => {
      if (reloadingSnackBar) {
        this.snackBar.open('Query reloaded', null, { duration: 2000 });
      }
      this.queryDef = queryDef;
      this.titleService.setTitle(`${this.queryDef.data.Pipeline.Name} - Visual Query`);
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
      ).subscribe(() => {
        this.loadQuery(true);
      })
    );
  }

}
