import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NavItem } from '../../models/nav-item.model';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import tippy from 'tippy.js';
import { TippyStandaloneDirective } from '../../directives/tippy-Standalone.directive';

@Component({
  selector: 'app-nav-item-list',
  templateUrl: './nav-item-list.component.html',
  styleUrl: './nav-item-list.component.scss',
  standalone: true,
  imports: [
    MatIconModule,
    NgClass,
    RouterLink,
    TippyStandaloneDirective,
    NgIf,
  ],
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
