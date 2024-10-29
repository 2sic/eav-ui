import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HelpPopupComponent } from '..';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { HelpPopupData } from '../help-popup/help-popup.models';
import { Scenario } from '../scenarios';

@Component({
  selector: 'app-selector-with-help',
  templateUrl: './selector-with-help.component.html',
  styleUrls: ['../header-selector.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    TippyDirective,
    MatIconModule,
  ],
})
export class SelectorWithHelpComponent implements OnInit {
  label = input<string>();
  items = input<Scenario[]>();
  // TODO: @2pp - input signals are read only, so find another solution
  // value = input<string>();
  @Input() value: string;
  @Output() private valueChange = new EventEmitter<Scenario>();

  constructor(private dialog: MatDialog) { }

  ngOnInit() { }

  selectionChange(key: string) {
    this.value = key;
    const scenario = this.items().find(item => item.key === this.value);
    this.valueChange.emit(scenario);
  }

  showHelp() {
    const scenario = this.items().find(item => item.key === this.value);
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
