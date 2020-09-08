import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SxcRoot } from '@2sic.com/2sxc-typings';
import { SxcInsightsService } from '../services/sxc-insights.service';
declare const $2sxc: SxcRoot;

@Component({
  selector: 'app-sxc-insights',
  templateUrl: './sxc-insights.component.html',
  styleUrls: ['./sxc-insights.component.scss']
})
export class SxcInsightsComponent implements OnInit {
  pageLogDuration: number;
  positiveWholeNumber = /^[^-]\d*$/;
  actionsDiabled = false;

  constructor(private sxcInsightsService: SxcInsightsService, private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  openInsights() {
    window.open($2sxc.http.apiUrl('sys/insights/help'));
  }

  activatePageLog() {
    this.actionsDiabled = true;
    this.snackBar.open('Activating...');
    this.sxcInsightsService.activatePageLog(this.pageLogDuration).subscribe(res => {
      this.pageLogDuration = undefined;
      this.actionsDiabled = false;
      this.snackBar.open(res, null, { duration: 4000 });
    });
  }
}
