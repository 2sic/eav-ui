import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from "../directives/tippy.directive";

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.html',
  imports: [
    MatIconModule,
    MatButtonModule,
    TippyDirective,
  ]
})
export class DialogHeaderComponent {
  @Input() showClose: boolean = true;
  @Input() closeTooltip: string = 'Close dialog';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}