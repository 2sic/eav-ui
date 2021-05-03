import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpPopupComponent } from '..';
import { HelpPopupData } from '../help-popup/help-popup.models';
import { Scenario } from '../scenarios';

@Component({
  selector: 'app-selector-with-help',
  templateUrl: './selector-with-help.component.html',
  styleUrls: ['../header-selector.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectorWithHelpComponent implements OnInit {
  @Input() label: string;
  @Input() items: Scenario[];
  @Input() value: string;
  @Output() private valueChange = new EventEmitter<Scenario>();

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  selectionChange(key: string) {
    this.value = key;
    const scenario = this.items.find(item => item.key === this.value);
    this.valueChange.emit(scenario);
  }

  showHelp() {
    const scenario = this.items.find(item => item.key === this.value);
    const data: HelpPopupData = {
      name: scenario.name,
      body: scenario.description,
      notes: scenario.notes,
    };

    this.dialog.open(HelpPopupComponent, {
      autoFocus: false,
      data,
      width: '500px',
    });
  }
}
