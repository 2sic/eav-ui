import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sxc-insights',
  templateUrl: './sxc-insights.component.html',
  styleUrls: ['./sxc-insights.component.scss']
})
export class SxcInsightsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openInsights() {
    window.open('/desktopmodules/2sxc/api/sys/insights/help');
  }
}
