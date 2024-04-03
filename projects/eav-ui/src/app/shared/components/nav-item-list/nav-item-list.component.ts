import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-nav-item-list',
  templateUrl: './nav-item-list.component.html',
  styleUrl: './nav-item-list.component.scss'
})
export class NavItemListComponent implements OnInit {
  @Input() navItem!: NavItem;
  isOpenMenu = false;
  constructor(private router: Router,) { }

  ngOnInit(): void {
    this.openChildMenu();
  }

  openChildMenu() {
    if (this.navItem.child?.length) {

      this.router.events.subscribe((event: any) => {
        if (event.routerEvent instanceof NavigationEnd) {

          const urlSegments = event.routerEvent.urlAfterRedirects.split('/');

          const matchingChild = this.navItem.child.find(child => urlSegments.includes(child.path));
          if (matchingChild) {
            this.isOpenMenu = true;
          }
        }
      });
    }
  }
}
