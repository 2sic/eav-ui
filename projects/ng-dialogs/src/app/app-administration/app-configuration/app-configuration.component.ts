import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { eavConstants } from '../../shared/constants/eav-constants';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { EditForm } from '../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { AppDialogConfigService } from '../shared/services/app-dialog-config.service';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss']
})
export class AppConfigurationComponent implements OnInit {
  eavConstants = eavConstants;
  showPermissions = false;

  constructor(
    private contentItemsService: ContentItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private appDialogConfigService: AppDialogConfigService,
  ) { }

  ngOnInit() {
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      this.showPermissions = !dialogSettings.IsContent;
    });
  }

  edit(staticName: string) {
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
      if (contentItems.length !== 1) { throw new Error(`Found too many settings for the type ${staticName}`); }
      const item = contentItems[0];
      const form: EditForm = {
        items: [{ EntityId: item.Id.toString() }],
      };
      this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
    });
  }

  config(staticName: string) {
    this.router.navigate([`fields/${staticName}`], { relativeTo: this.route.firstChild });
  }

  openPermissions() {
    this.router.navigate(
      [`permissions/${eavConstants.metadata.app.type}/${eavConstants.keyTypes.number}/${this.context.appId}`],
      { relativeTo: this.route.firstChild }
    );
  }

  exportApp() {
    this.router.navigate([`export`], { relativeTo: this.route.firstChild });
  }

  exportParts() {
    this.router.navigate([`export/parts`], { relativeTo: this.route.firstChild });
  }

  importParts() {
    this.router.navigate([`import/parts`], { relativeTo: this.route.firstChild });
  }
}
