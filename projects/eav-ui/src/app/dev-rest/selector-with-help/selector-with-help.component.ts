import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpPopupComponent } from '..';
import { HelpPopupData } from '../help-popup/help-popup.models';
import { Scenario } from '../scenarios';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TippyStandaloneDirective } from '../../shared/directives/tippy-Standalone.directive';

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
        TippyStandaloneDirective,
        MatIconModule,
    ],
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
