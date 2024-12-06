import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
    ]
})
export class MessageComponent implements OnInit {
  message: string;
  errComponent: string;
  isError: boolean;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialogRef<MessageComponent>,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errComponent = params['errComponent'] || 'the component';
      const errorKey = params['error'] || 'Something went wrong. Please try again later.';
      this.message = this.translate.instant(errorKey, { errComponent: this.errComponent });
      this.isError = !!params['error'];
    });
  }
}
