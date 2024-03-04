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
      let found = false;
      // TODO:: any
      this.router.events.subscribe((event: any) => {
        if (
          event.routerEvent instanceof NavigationEnd &&
          !found
        ) {
          const urlSegments = event.routerEvent.urlAfterRedirects.split('/');
          found = this.navItem?.child?.some((child) => {
            return urlSegments.some((segment: string) => segment === child.path);
          });
          if (found) {
            this.isOpenMenu = true;
          }
        }
      });
    }
  }

  // TODO:: Typed works not
  // openChildMenu() {
  //   if (this.navItem.child?.length) {
  //     this.router.events.subscribe((event:NavigationEnd) => {
  //       if (
  //         event instanceof NavigationEnd &&
  //         this.navItem?.child?.some((child) => {
  //           const lastSegment = event.urlAfterRedirects.split('/').pop();
  //           return (
  //             child.path.includes(lastSegment)
  //           );
  //         })
  //       ) {
  //         this.isOpenMenu = true;
  //       }
  //     });
  //   }
  // }
}
