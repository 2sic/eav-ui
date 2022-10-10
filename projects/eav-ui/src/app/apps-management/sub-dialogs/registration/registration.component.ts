import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  constructor(private dialogRef: MatDialogRef<RegistrationComponent>) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

}
