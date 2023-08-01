import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { HelpPopupComponent } from '..';
import { HelpPopupData } from '../help-popup/help-popup.models';
import { Scenario } from '../scenarios';

@Component({
  selector: 'app-selector-with-help',
  templateUrl: './selector-with-help.component.html',
  styleUrls: ['../header-selector.scss'],
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
    const dialogData: HelpPopupData = {
      name: scenario.name,
      body: scenario.description,
      notes: scenario.notes,
    };

    this.dialog.open(HelpPopupComponent, {
      autoFocus: false,
      data: dialogData,
      width: '500px',
    });
  }
}
