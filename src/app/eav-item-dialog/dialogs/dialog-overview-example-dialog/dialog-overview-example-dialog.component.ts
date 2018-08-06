import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { Item, Language } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { LanguageService } from '../../../shared/services/language.service';

export interface DialogData {
  entityId: string;
}

@Component({
  selector: 'app-dialog-overview-example-dialog',
  templateUrl: './dialog-overview-example-dialog.component.html',
  styleUrls: ['./dialog-overview-example-dialog.component.css']
})
export class DialogOverviewExampleDialogComponent implements OnInit {

  items$: Observable<Item[]>;
  languages$: Observable<Language[]>;
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;

  constructor(
    private dialogRef: MatDialogRef<DialogOverviewExampleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public item: DialogData,
    private itemService: ItemService,
    private languageService: LanguageService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();
  }

  ngOnInit() {
    // set observing for items
    this.items$ = this.itemService.selectAllItems();
    // set observing for languages
    this.languages$ = this.languageService.selectAllLanguages();
  }

  trackByFn(index, item) {
    return item.entity.id;
  }
}
