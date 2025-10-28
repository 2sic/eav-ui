import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';

@Component({
  selector: 'app-extension-import',
  imports: [MatIconModule, DragAndDropDirective],
  templateUrl: './extension-import.component.html',
  styleUrl: './extension-import.component.scss'
})
export class ExtensionImportComponent {

  closeDialog() {

  }

  filesDropped(files: File[]) {

  }
}
