import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ContentGroupService } from './services/content-group.service';
import { EditForm } from '../app-administration/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss']
})
export class ManageContentListComponent implements OnInit, OnDestroy {
  items: GroupHeader[];
  header: GroupHeader;

  private contentGroup: ContentGroup;
  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private dialogRef: MatDialogRef<ManageContentListComponent>,
    private contentGroupService: ContentGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
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
    this.subscription = null;
  }

  saveList() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveList(this.contentGroup, this.items).subscribe(res => {
      this.snackBar.open('Saved');
      this.closeDialog();
    });
  }

  // spm TODO: edit header seems to be broken
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
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  editItem(id: number) {
    const form: EditForm = {
      items: [
        { EntityId: id.toString() },
      ],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

  stopDnD(event: MouseEvent) {
    event.stopPropagation();
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
      // spm TODO: Header title seems to always be an empty string
      this.header = res;
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          this.fetchList();
          this.fetchHeader();
        }
      })
    );
  }

}
