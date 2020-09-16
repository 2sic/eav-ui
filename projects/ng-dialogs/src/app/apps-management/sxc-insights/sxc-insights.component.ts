import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SxcRoot } from '@2sic.com/2sxc-typings';

import { SxcInsightsService } from '../services/sxc-insights.service';
declare const $2sxc: SxcRoot;

@Component({
  selector: 'app-sxc-insights',
  templateUrl: './sxc-insights.component.html',
  styleUrls: ['./sxc-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SxcInsightsComponent implements OnInit, OnDestroy {
  pageLogDuration: number;
  positiveWholeNumber = /^[1-9][0-9]*$/;
  loading$ = new BehaviorSubject(false);

  constructor(private sxcInsightsService: SxcInsightsService, private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.loading$.complete();
  }

  openInsights() {
    window.open($2sxc.http.apiUrl('sys/insights/help'));
  }

  activatePageLog(form: NgForm) {
    this.loading$.next(true);
    this.snackBar.open('Activating...');
    this.sxcInsightsService.activatePageLog(this.pageLogDuration).subscribe(res => {
      this.loading$.next(false);
      this.snackBar.open(res, null, { duration: 4000 });
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    form.resetForm();
  }
}
