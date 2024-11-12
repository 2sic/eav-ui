import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatIconModule,
  ]
})
export class ErrorComponent implements OnInit {
  errorMessage: string;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialogRef<ErrorComponent>,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || 'Something went wrong. Please try again later.';
    });
  }
}