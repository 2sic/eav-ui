import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { ReplaceOption } from './models/replace-option.model';
import { ContentGroup } from '../manage-content-list/models/content-group.model';
import { EditForm } from '../app-administration/shared/models/edit-form.model';

@Component({
  selector: 'app-replace-content',
  templateUrl: './replace-content.component.html',
  styleUrls: ['./replace-content.component.scss']
})
export class ReplaceContentComponent implements OnInit, OnDestroy {
  options: ReplaceOption[];
  item: ContentGroup;
  contentTypeName: string;

  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private dialogRef: MatDialogRef<ReplaceContentComponent>,
    private contentGroupService: ContentGroupService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
    this.item = {
      id: null,
      guid: this.route.snapshot.paramMap.get('guid'),
      part: this.route.snapshot.paramMap.get('part'),
      index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
    };
  }

  ngOnInit() {
    this.getConfig();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
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
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
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
      if (!this.item.id) {
        this.item.id = replaceConfig.SelectedId;
      }
      if (!this.contentTypeName) {
        this.contentTypeName = replaceConfig.ContentTypeName;
      }
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          this.getConfig();
          const navigation = this.router.getCurrentNavigation();
          const editResult = navigation.extras?.state;
          if (editResult) {
            this.item.id = editResult[Object.keys(editResult)[0]];
          }
        }
      })
    );
  }

}
