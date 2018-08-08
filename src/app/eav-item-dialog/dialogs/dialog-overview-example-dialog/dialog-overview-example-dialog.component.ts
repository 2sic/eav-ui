import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Item, Language } from '../../../shared/models/eav';
import { ItemService } from '../../../shared/services/item.service';
import { LanguageService } from '../../../shared/services/language.service';
import { EavService } from '../../../shared/services/eav.service';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { ContentTypeService } from '../../../shared/services/content-type.service';
import { InputTypeService } from '../../../shared/services/input-type.service';

export interface DialogData {
  id: string;
}

@Component({
  selector: 'app-dialog-overview-example-dialog',
  templateUrl: './dialog-overview-example-dialog.component.html',
  styleUrls: ['./dialog-overview-example-dialog.component.css']
})
export class DialogOverviewExampleDialogComponent implements OnInit {

  item$: Observable<Item>;
  languages$: Observable<Language[]>;
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  constructor(
    private dialogRef: MatDialogRef<DialogOverviewExampleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private item: DialogData,
    private itemService: ItemService,
    private languageService: LanguageService,
    private eavService: EavService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();
    // Read configuration from queryString
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    const itemId: number = Number(this.item.id);
    if (itemId) {
      this.loadData(itemId);

      console.log('open something');
      // TEMP
      this.itemService.selectItemById(itemId).subscribe(data => console.log('weeeeeeeee!', data));
      // set observing for item
      this.item$ = this.itemService.selectItemById(itemId);
      // set observing for languages
      this.languages$ = this.languageService.selectAllLanguages();

      console.log('DialogData', this.item);
    }
  }

  /**
 * Load all data for forms
 */
  private loadData(itemId: number) {
    this.subscriptions.push(
      this.eavService.loadAllDataForFormByEntity(this.eavConfig.appId, [{ 'EntityId': itemId }]).subscribe(data => {
        console.log('loadAllDataForFormByEntity');
        this.itemService.loadItems(data.Items);
        this.inputTypeService.loadInputTypes(data.InputTypes);
        this.contentTypeService.loadContentTypes(data.ContentTypes);
        // this.setPublishMode(data.Items);
      })
    );
  }

  trackByFn(index, item) {
    return item.entity.id;
  }
}
