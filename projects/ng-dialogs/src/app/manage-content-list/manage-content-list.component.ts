import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, pairwise, startWith, Subscription } from 'rxjs';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { ContentGroupService } from './services/content-group.service';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss'],
})
export class ManageContentListComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private items$ = new BehaviorSubject<GroupHeader[]>(null);
  private header$ = new BehaviorSubject<GroupHeader>(null);
  templateVars$ = combineLatest([this.items$, this.header$]).pipe(
    map(([items, header]) => ({ items, header })),
  );

  private contentGroup: ContentGroup = {
    id: null,
    guid: this.route.snapshot.paramMap.get('guid'),
    part: this.route.snapshot.paramMap.get('part'),
    index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
  };
  private reordered = false;
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

  closeDialog() {
    this.dialogRef.close();
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

  drop(event: CdkDragDrop<GroupHeader[]>) {
    const items = [...this.items$.value];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.items$.next(items);
    this.reordered = true;
  }

  trackByFn(index: number, item: GroupHeader) {
    // we use both Index and Id because all demo items have Id=0
    return `${item.Index}+${item.Id}`;
  }

  private fetchList() {
    this.contentGroupService.getList(this.contentGroup).subscribe(items => {
      if (this.reordered) {
        const oldIds = this.items$.value.map(item => item.Id);
        const idsChanged = this.items$.value.length !== items.length || items.some(item => !oldIds.includes(item.Id));
        if (!idsChanged) {
          const sortOrder = this.items$.value.map(item => item.Index);
          items.sort((a, b) => {
            const aIndex = sortOrder.indexOf(a.Index);
            const bIndex = sortOrder.indexOf(b.Index);
            if (aIndex === -1 || bIndex === -1) { return 0; }
            return aIndex - bIndex;
          });
        } else {
          this.snackBar.open('List was changed from somewhere else. Order of items is reset', null, { duration: 5000 });
        }
      }
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
