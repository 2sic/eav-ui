import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ]
})
export class MessageComponent implements OnInit {
  message: string;
  isError: boolean;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialogRef<MessageComponent>,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.message = params['error'] || 'Something went wrong. Please try again later.';
      this.isError = !!params['error']; // Turns string into boolean
    });
  }
}
