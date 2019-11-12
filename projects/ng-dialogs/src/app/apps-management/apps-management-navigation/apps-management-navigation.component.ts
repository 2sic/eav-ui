import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-apps-management-navigation',
  templateUrl: './apps-management-navigation.component.html',
  styleUrls: ['./apps-management-navigation.component.scss']
})
export class AppsManagementNavigationComponent implements OnInit {
  tabs = [
    { name: 'Apps', icon: '', url: 'apps' },
    { name: 'Settings', icon: '', url: 'settings' },
    { name: 'Features', icon: '', url: 'features' },
    { name: '2sxc Insights', icon: '', url: 'sxc-insights' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

  changeTab(url: string) {
    this.router.navigate([`${url}`], { relativeTo: this.route });
  }
}
