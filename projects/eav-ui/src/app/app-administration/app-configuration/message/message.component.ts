import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class MessageComponent implements OnInit {
  message: string;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialogRef<MessageComponent>,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.message = params['message'] || 'Something went wrong. Please try again later.';
    });
  }
}