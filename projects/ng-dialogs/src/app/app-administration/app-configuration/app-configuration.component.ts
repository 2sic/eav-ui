import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { eavConstants } from '../../shared/constants/eav-constants';
import { ContentItemsService } from '../shared/services/content-items.service';
import { EditForm } from '../shared/models/edit-form.model';
import { Context } from '../../shared/context/context';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss']
})
export class AppConfigurationComponent implements OnInit {
  eavConstants = eavConstants;

  constructor(
    private contentItemsService: ContentItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context
  ) { }

  ngOnInit() {
  }

  edit(staticName: string) {
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
      if (contentItems.length !== 1) { throw new Error(`Found too many settings for the type ${staticName}`); }
      const item = contentItems[0];
      const form: EditForm = {
        items: [{ EntityId: item.Id.toString(), Title: item.Title }],
        persistedData: null,
      };
      this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route.firstChild });
    });
  }

  config(staticName: string) {

  }

  openPermissions() {
    this.router.navigate(
      [`${eavConstants.metadata.app.type}/${eavConstants.keyTypes.number}/${this.context.appId}/permissions`],
      { relativeTo: this.route.firstChild }
    );
  }
}
