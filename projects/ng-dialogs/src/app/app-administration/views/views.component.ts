import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';
import { Subscription } from 'rxjs';

import { View } from '../shared/models/view.model';
import { ViewsShowComponent } from '../shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from '../shared/ag-grid-components/views-actions/views-actions.component';
import { TemplatesService } from '../shared/services/templates.service';
import { ViewActionsParams } from '../shared/models/view-actions-params';
import { EditForm } from '../shared/models/edit-form.model';
import { DialogService } from '../../shared/components/dialog-service/dialog.service';
import { ITEMS_EDIT_DIALOG } from '../../shared/constants/dialog-names';
import { eavConstants } from '../../shared/constants/eav-configuration';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit, OnDestroy {
  views: View[];

  columnDefs: ColDef[] = [
    { headerName: 'Template Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Path', field: 'TemplatePath', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Content Type', field: 'ContentType.Name', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Demo Item', field: 'ContentType.DemoId', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    { headerName: 'Show', field: 'IsHidden', width: 100, cellRenderer: 'viewsShowComponent', onCellClicked: this.editView.bind(this) },
    { headerName: 'Url Key', field: 'ViewNameInUrl', cellClass: 'clickable', onCellClicked: this.editView.bind(this) },
    {
      headerName: 'Actions', width: 100, cellRenderer: 'viewsActionsComponent',
      cellRendererParams: <ViewActionsParams>{
        onOpenPermissions: this.openPermissions.bind(this),
        onDelete: this.deleteView.bind(this),
      }
    },
  ];
  frameworkComponents = {
    viewsShowComponent: ViewsShowComponent,
    viewsActionsComponent: ViewsActionsComponent,
  };
  modules = AllCommunityModules;

  private subscription: Subscription = new Subscription();

  constructor(
    private templatesService: TemplatesService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.fetchTemplates();
    this.subscription.add(
      this.dialogService.subToClosed([ITEMS_EDIT_DIALOG]).subscribe(closedDialog => {
        console.log('Dialog closed event captured:', closedDialog);
        this.fetchTemplates();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchTemplates() {
    this.templatesService.getAll().subscribe(views => {
      this.views = views;
    });
  }

  editView(params: CellClickedEvent) {
    let form: EditForm;
    if (params === null) {
      form = {
        addItems: [{ ContentTypeName: eavConstants.contentType.template }],
        editItems: null,
        persistedData: {},
      };
    } else {
      const view = <View>params.data;
      form = {
        addItems: null,
        editItems: [{ EntityId: view.Id.toString(), Title: view.Name }],
        persistedData: {},
      };
    }
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
  }

  private openPermissions(view: View) {
    this.router.navigate(
      [`${view.Guid}/${eavConstants.metadata.entity.type}/${eavConstants.keyTypes.guid}/permissions`],
      { relativeTo: this.route.firstChild }
    );
  }

  private deleteView(view: View) {
    if (!confirm(`Delete '${view.Name}' (${view.Id})?`)) { return; }
    this.templatesService.delete(view.Id).subscribe(res => {
      this.fetchTemplates();
    });
  }

}
