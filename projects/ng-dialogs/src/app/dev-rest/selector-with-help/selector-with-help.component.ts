import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { HelpPopupComponent, SelectorData } from '..';

@Component({
  selector: 'app-selector-with-help',
  templateUrl: './selector-with-help.component.html',
})
export class SelectorWithHelpComponent implements OnInit {

  @Input() label: string;
  @Input() items: SelectorData[];

  /** currently selected scenario */
  current$: BehaviorSubject<SelectorData>;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.current$ = new BehaviorSubject<SelectorData>(this.items[0]);
  }

  selectCurrent(key: string): void {
    this.current$.next(this.items.find(as => as.key === key));
  }

  showHelp(): void {
    this.current$.pipe(take(1)).subscribe(scenario => {
      this.dialog.open(HelpPopupComponent, {
        width: '500px',
        data: {name: scenario.name, body: scenario.description, notes: scenario.notes }
      });
    });
  }

}
