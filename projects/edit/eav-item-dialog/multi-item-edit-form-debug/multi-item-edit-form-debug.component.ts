import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemService } from '../../shared/store/ngrx-data/item.service';

declare const sxcVersion: string;

@Component({
  selector: 'app-multi-item-edit-form-debug',
  templateUrl: './multi-item-edit-form-debug.component.html',
  styleUrls: ['./multi-item-edit-form-debug.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiItemEditFormDebugComponent implements OnInit {
  @Output() private debugInfoOpened = new EventEmitter<boolean>();

  sxcVer = sxcVersion.substring(0, sxcVersion.lastIndexOf('.'));
  showDebugInfo = false;

  private items$ = this.itemService.selectAllItems();
  templateVars$ = combineLatest([this.items$]).pipe(map(([items]) => ({ items })));

  constructor(private itemService: ItemService) { }

  ngOnInit() { }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.debugInfoOpened.emit(this.showDebugInfo);
  }
}
