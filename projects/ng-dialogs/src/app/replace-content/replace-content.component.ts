import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { ContentGroupAdd } from '../manage-content-list/models/content-group.model';
import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ReplaceOption } from './models/replace-option.model';

@Component({
  selector: 'app-replace-content',
  templateUrl: './replace-content.component.html',
  styleUrls: ['./replace-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReplaceContentComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  item$ = new BehaviorSubject<ContentGroupAdd>({
    id: null,
    guid: this.route.snapshot.paramMap.get('guid'),
    part: this.route.snapshot.paramMap.get('part'),
    index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
    add: !!this.route.snapshot.queryParamMap.get('add'),
  });
  options$ = new BehaviorSubject<ReplaceOption[]>(null);

  private contentTypeName: string;
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ReplaceContentComponent>,
    private contentGroupService: ContentGroupService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.getConfig();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.item$.complete();
    this.options$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  selectedChanged(id: number) {
    this.item$.next({ ...this.item$.value, id });
  }

  save() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveItem(this.item$.value).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  copySelected() {
    const form: EditForm = {
      items: [{ ContentTypeName: this.contentTypeName, DuplicateEntity: this.item$.value.id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  private getConfig() {
    this.contentGroupService.getItems(this.item$.value).subscribe(replaceConfig => {
      const options: ReplaceOption[] = [];
      const itemKeys = Object.keys(replaceConfig.Items);
      for (const key of itemKeys) {
        const nKey = parseInt(key, 10);
        const itemName = replaceConfig.Items[nKey];
        options.push({ label: `${itemName} (${nKey})`, value: nKey });
      }
      this.options$.next(options);
      // don't set the ID if dialog should be in add-mode
      if (!this.item$.value.id && !this.item$.value.add) {
        this.item$.next({ ...this.item$.value, id: replaceConfig.SelectedId });
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
          const id = editResult[Object.keys(editResult)[0]];
          this.item$.next({ ...this.item$.value, id });
        }
      })
    );
  }

}
