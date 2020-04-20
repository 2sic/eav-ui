import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SxcInsightsService } from '../shared/services/sxc-insights.service';

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
    window.open('/desktopmodules/2sxc/api/sys/insights/help');
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
