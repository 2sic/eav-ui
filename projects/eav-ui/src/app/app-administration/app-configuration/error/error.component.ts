
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
]
})
export class ErrorComponent implements OnInit {
  errorMessage: string;

  constructor(
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<ErrorComponent>
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || 'Something went wrong. Please try again later.';
    });
  }
}