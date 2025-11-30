import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { transient } from 'projects/core';

@Component({
  selector: 'app-message',
  templateUrl: './basic-message.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class BasicMessage implements OnInit {
  message: string;
  errComponent: string;
  isError: boolean;
  openFixUrl = signal('');
  router = transient(Router);

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialogRef<BasicMessage>,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.openFixUrl.set(params['openUrl'] || '');
      this.errComponent = params['errComponent'] || 'the component';
      const errorKey = params['error'] || 'Something went wrong. Please try again later.';
      this.message = this.translate.instant(errorKey, { errComponent: this.errComponent });
      this.isError = !!params['error'];
    });
  }

  routeToFixIssue() {
    const raw = window.location.href;
    const splitUrl = raw.split("app/app");
    const finalUrl = splitUrl[0] + "app" + this.openFixUrl();
    window.open(finalUrl, '_blank');
  }


}
