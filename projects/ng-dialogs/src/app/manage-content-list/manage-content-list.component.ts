import { Component, OnInit, OnDestroy, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, BehaviorSubject } from 'rxjs';
import { filter, startWith, map, pairwise } from 'rxjs/operators';

import { ContentGroupService } from './services/content-group.service';
import { EditForm } from '../shared/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageContentListComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  items$ = new BehaviorSubject<GroupHeader[]>(null);
  header$ = new BehaviorSubject<GroupHeader>(null);

  private contentGroup: ContentGroup = {
    id: null,
    guid: this.route.snapshot.paramMap.get('guid'),
    part: this.route.snapshot.paramMap.get('part'),
    index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
  };
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ManageContentListComponent>,
    private contentGroupService: ContentGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.fetchList();
    this.fetchHeader();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.items$.complete();
    this.header$.complete();
    this.subscription.unsubscribe();
  }

  saveList() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveList(this.contentGroup, this.items$.value).subscribe(res => {
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
            Add: this.header$.value.Id === 0,
          },
        },
        {
          Group: {
            Guid: this.contentGroup.guid,
            Index: 0,
            Part: 'listpresentation',
            Add: this.header$.value.Id === 0,
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
    const items = [...this.items$.value];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.items$.next(items);
  }

  trackByFn(index: number, item: GroupHeader) {
    // we use both Index and Id because all demo items have Id=0
    return `${item.Index}+${item.Id}`;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchList() {
    this.contentGroupService.getList(this.contentGroup).subscribe(items => {
      this.items$.next(items);
    });
  }

  private fetchHeader() {
    this.contentGroupService.getHeader(this.contentGroup).subscribe(header => {
      this.header$.next(header);
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
