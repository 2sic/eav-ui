import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { filter, startWith, map, pairwise } from 'rxjs/operators';

import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { ReplaceOption } from './models/replace-option.model';
import { ContentGroupAdd } from '../manage-content-list/models/content-group.model';
import { EditForm } from '../shared/models/edit-form.model';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';

@Component({
  selector: 'app-replace-content',
  templateUrl: './replace-content.component.html',
  styleUrls: ['./replace-content.component.scss']
})
export class ReplaceContentComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  options: ReplaceOption[];
  item: ContentGroupAdd;
  contentTypeName: string;

  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ReplaceContentComponent>,
    private contentGroupService: ContentGroupService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.item = {
      id: null,
      guid: this.route.snapshot.paramMap.get('guid'),
      part: this.route.snapshot.paramMap.get('part'),
      index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
      add: !!this.route.snapshot.queryParamMap.get('add'),
    };
  }

  ngOnInit() {
    this.getConfig();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  save() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveItem(this.item).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  copySelected() {
    const form: EditForm = {
      items: [{ ContentTypeName: this.contentTypeName, DuplicateEntity: this.item.id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private getConfig() {
    this.contentGroupService.getItems(this.item).subscribe(replaceConfig => {
      const itemKeys = Object.keys(replaceConfig.Items);
      this.options = [];
      for (const key of itemKeys) {
        const nKey = parseInt(key, 10);
        const itemName = replaceConfig.Items[nKey];
        this.options.push({ label: `${itemName} (${nKey})`, value: nKey });
      }
      // don't set the ID if the dialog should be in add-mode
      if (!this.item.id && !this.item.add) {
        this.item.id = replaceConfig.SelectedId;
      }
      if (!this.contentTypeName) {
        this.contentTypeName = replaceConfig.ContentTypeName;
      }
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
      ).subscribe(() => {
        this.getConfig();
        const navigation = this.router.getCurrentNavigation();
        const editResult = navigation.extras?.state;
        if (editResult) {
          this.item.id = editResult[Object.keys(editResult)[0]];
        }
      })
    );
  }

}
