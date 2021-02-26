import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemService } from '../../shared/store/ngrx-data';
import { FormDebugTemplateVars } from './multi-item-edit-form-debug.models';

declare const sxcVersion: string;

@Component({
  selector: 'app-multi-item-edit-form-debug',
  templateUrl: './multi-item-edit-form-debug.component.html',
  styleUrls: ['./multi-item-edit-form-debug.component.scss'],
})
export class MultiItemEditFormDebugComponent implements OnInit {
  @Output() private debugInfoOpened = new EventEmitter<boolean>();

  sxcVer = sxcVersion.substring(0, sxcVersion.lastIndexOf('.'));
  showDebugInfo = false;
  templateVars$: Observable<FormDebugTemplateVars>;

  constructor(private itemService: ItemService) { }

  ngOnInit() {
    const items$ = this.itemService.getItems$();
    this.templateVars$ = combineLatest([items$]).pipe(
      map(([items]) => {
        const templateVars: FormDebugTemplateVars = {
          items,
        };
        return templateVars;
      }),
    );
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.debugInfoOpened.emit(this.showDebugInfo);
  }
}
