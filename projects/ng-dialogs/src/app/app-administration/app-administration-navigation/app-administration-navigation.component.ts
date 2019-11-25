import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-app-administration-navigation',
  templateUrl: './app-administration-navigation.component.html',
  styleUrls: ['./app-administration-navigation.component.scss']
})
export class AppAdministrationNavigationComponent implements OnInit {
  tabs = [
    { name: 'Home', icon: '', url: 'home' },
    { name: 'Data', icon: '', url: 'data' },
    { name: 'Queries', icon: '', url: 'queries' },
    { name: 'Views', icon: '', url: 'views' },
    { name: 'WebApi', icon: '', url: 'web-api' },
    { name: 'App', icon: '', url: 'app' },
    { name: 'Global', icon: '', url: 'global' },
  ];

  constructor(
    private dialogRef: MatDialogRef<AppAdministrationNavigationComponent>,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeTab(url: string) {
    this.router.navigate([`${url}`], { relativeTo: this.route });
  }
}
