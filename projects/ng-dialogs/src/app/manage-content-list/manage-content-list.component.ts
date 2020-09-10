import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { filter, startWith, map, pairwise } from 'rxjs/operators';

import { ContentGroupService } from './services/content-group.service';
import { EditForm } from '../shared/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss']
})
export class ManageContentListComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  items: GroupHeader[];
  header: GroupHeader;

  private contentGroup: ContentGroup;
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ManageContentListComponent>,
    private contentGroupService: ContentGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.contentGroup = {
      id: null,
      guid: this.route.snapshot.paramMap.get('guid'),
      part: this.route.snapshot.paramMap.get('part'),
      index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
    };
  }

  ngOnInit() {
    this.fetchList();
    this.fetchHeader();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  saveList() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveList(this.contentGroup, this.items).subscribe(res => {
      this.snackBar.open('Saved');
      this.closeDialog();
    });
  }

  editHeader() {
    const form: EditForm = {
      items: [
        {
          Group: {
            Guid: this.contentGroup.guid,
            Index: 0,
            Part: 'listcontent',
            Add: this.header.Id === 0,
          },
        },
        {
          Group: {
            Guid: this.contentGroup.guid,
            Index: 0,
            Part: 'listpresentation',
            Add: this.header.Id === 0,
          },
        },
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  editItem(id: number) {
    const form: EditForm = {
      items: [{ EntityId: id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchList() {
    this.contentGroupService.getList(this.contentGroup).subscribe(res => {
      this.items = res;
    });
  }

  private fetchHeader() {
    this.contentGroupService.getHeader(this.contentGroup).subscribe(res => {
      this.header = res;
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
        this.fetchList();
        this.fetchHeader();
      })
    );
  }

}
