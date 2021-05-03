import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-page-picker',
  templateUrl: './page-picker.component.html',
  styleUrls: ['./page-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagePickerComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<PagePickerComponent>) { }

  ngOnInit() {
  }
}
