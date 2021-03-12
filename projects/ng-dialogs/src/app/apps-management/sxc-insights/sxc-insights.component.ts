import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { EavWindow } from '../../shared/models/eav-window.model';
import { SxcInsightsService } from '../services/sxc-insights.service';

declare const window: EavWindow;

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
    window.open(window.$2sxc.http.apiUrl('sys/insights/help'), '_blank');
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
