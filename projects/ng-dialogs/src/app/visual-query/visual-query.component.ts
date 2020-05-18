import { Component, OnInit, OnDestroy, NgZone, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import cloneDeep from 'lodash-es/cloneDeep';
import 'script-loader!node_modules/jsplumb/dist/js/jsPlumb-2.1.7-min.js';

import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { eavConstants } from '../shared/constants/eav.constants';
import { EditForm } from '../shared/models/edit-form.model';
import { DataSource } from './models/data-sources.model';
import { PlumbGuiService } from './services/plumb-gui.service';
import { ElementEventListener } from '../../../../shared/element-event-listener.model';
import { QueryResultComponent } from './query-result/query-result.component';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss']
})
export class VisualQueryComponent implements OnInit, OnDestroy {
  explorer = {
    run: 'run',
    add: 'add'
  };
  activeExplorer = this.explorer.run;
  queryDef: any;
  instance: any;

  private pipelineId: number;
  private eventListeners: ElementEventListener[];
  private subscription = new Subscription();
  private hasChild: boolean;

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
    this.hasChild = !!this.route.snapshot.firstChild;
    const pipelineId = this.route.snapshot.paramMap.get('pipelineId');
    this.pipelineId = parseInt(pipelineId, 10);
  }

  ngOnInit() {
    this.loadQuery();
    this.attachListeners();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.detachListeners();
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  toggleExplorer(explorer: string) {
    if (this.activeExplorer === explorer) {
      this.activeExplorer = null;
    } else {
      this.activeExplorer = explorer;
    }
  }

  openHelp() {
    window.open('http://2sxc.org/help', '_blank');
  }

  instanceChanged(instance: any) {
    this.instance = instance;
  }

  savePipeline(callback?: () => any) {
    this.snackBar.open('Saving...');
    this.detachListeners();
    this.queryDef.readOnly = true;
    this.plumbGuiService.pushPlumbConfigToQueryDef(this.instance, this.queryDef);
    this.queryDefinitionService.save(this.queryDef).subscribe({
      next: (success: any) => {
        this.snackBar.open('Saved', null, { duration: 2000 });
        // Update PipelineData with data retrieved from the Server
        const newQueryDef = cloneDeep(this.queryDef);
        newQueryDef.data.Pipeline = success.Pipeline;
        newQueryDef.data.TestParameters = success.TestParameters;
        newQueryDef.id = success.Pipeline.EntityId;
        this.router.navigateByUrl(this.router.url.replace('pipelineId', success.Pipeline.EntityId));
        newQueryDef.readOnly = !success.Pipeline.AllowEdit;
        newQueryDef.data.DataSources = success.DataSources;
        this.queryDefinitionService.postProcessDataSources(newQueryDef.data);
        this.queryDef = newQueryDef;
        this.attachListeners();
        if (callback) { callback(); }
      },
      error: (reason: any) => {
        this.snackBar.open('Save Pipeline failed', null, { duration: 2000 });
        this.queryDef.readOnly = false;
        this.attachListeners();
      }
    });
  }

  // Get the URL to configure a DataSource
  editDataSourcePart(dataSource: any) {
    const sourceDef = this.queryDef.data.InstalledDataSources
      .find((source: any) => source.PartAssemblyAndType === dataSource.PartAssemblyAndType);
    const contentTypeName = (sourceDef && sourceDef.ContentType)
      ? sourceDef.ContentType
      : '|Config ' + this.queryDefinitionService.typeNameFilter(dataSource.PartAssemblyAndType, 'classFullName');

    const assignmentObjectTypeId = eavConstants.metadata.entity.type;
    const keyGuid = dataSource.EntityGuid;

    // Query for existing Entity
    this.metadataService
      .getMetadata(assignmentObjectTypeId, eavConstants.keyTypes.guid, keyGuid, contentTypeName).subscribe((success: any) => {
        if (success.length) { // Edit existing Entity
          const form: EditForm = {
            items: [{ EntityId: success[0].Id.toString() }],
          };
          this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
        } else { // Check if the type exists, and if yes, create new Entity
          this.contentTypesService.getDetails(contentTypeName, { ignoreErrors: true }).subscribe({
            next: (res: any) => {
              const form: EditForm = {
                items: [{
                  ContentTypeName: contentTypeName,
                  For: {
                    Target: eavConstants.metadata.entity.target,
                    Guid: keyGuid
                  }
                }],
              };
              this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
            },
            error: () => {
              alert('Server reports error - this usually means that this data-source doesn\'t have any configuration');
            }
          });
        }
      });
  }

  addSelectedDataSource(dataSource: DataSource) {
    this.queryDefinitionService.addDataSource(this.queryDef, dataSource.PartAssemblyAndType, null, null, dataSource.Name);
    this.savePipeline();
  }

  editPipelineEntity() {
    // save Pipeline, then open Edit Dialog
    this.savePipeline(() => {
      this.detachListeners();
      const form: EditForm = {
        items: [{ EntityId: this.queryDef.id.toString() }],
      };
      this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
    });
  }

  repaint() {
    this.instance.repaintEverything();
  }

  saveAndRun(saveAndRun: { save: boolean, run: boolean }) {
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

  runQuery() {
    this.snackBar.open('Running query...');
    this.queryDefinitionService.queryPipeline(this.queryDef.id).subscribe({
      next: (success: any) => {
        this.snackBar.open('Query worked', null, { duration: 2000 });
        // open modal with the results
        this.dialog.open(QueryResultComponent, {
          data: { testParameters: this.queryDef.data.Pipeline.TestParameters, result: success },
          backdropClass: 'dialog-backdrop',
          panelClass: ['dialog-panel', `dialog-panel-medium`, 'no-scrollbar'],
          viewContainerRef: this.viewContainerRef,
          autoFocus: false,
          closeOnNavigation: false,
          // spm NOTE: used to force align-items: flex-start; on cdk-global-overlay-wrapper.
          // Real top margin is overwritten in css e.g. dialog-panel-large
          position: { top: '0' },
        });
        console.warn(success);
        setTimeout(() => { this.plumbGuiService.putEntityCountOnConnection(success, this.queryDef, this.instance); }, 0);
      },
      error: (reason: any) => {
        this.snackBar.open('Query failed', null, { duration: 2000 });
      }
    });
  }

  private loadQuery(showSnackBar?: boolean) {
    if (showSnackBar) {
      this.snackBar.open('Loading...');
    }
    this.queryDefinitionService.loadQuery(this.pipelineId).then(res => {
      if (showSnackBar) {
        this.snackBar.open('Loaded', null, { duration: 2000 });
      }
      this.queryDef = res;
      this.titleService.setTitle(`${this.queryDef.data.Pipeline.Name} - Visual Query`);
    });
  }

  private attachListeners() {
    this.zone.runOutsideAngular(() => {
      const save = this.keyboardSave.bind(this);
      window.addEventListener('keydown', save);
      this.eventListeners = [];
      this.eventListeners.push({ element: window, type: 'keydown', listener: save });
    });
  }

  private detachListeners() {
    this.zone.runOutsideAngular(() => {
      this.eventListeners.forEach(listener => {
        listener.element.removeEventListener(listener.type, listener.listener);
      });
      this.eventListeners = null;
    });
  }

  private keyboardSave(e: KeyboardEvent) {
    const CTRL_S = e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey);
    if (!CTRL_S) { return; }
    e.preventDefault();
    this.zone.run(() => { this.savePipeline(); });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          this.loadQuery(true);
        }
      })
    );
  }

}
