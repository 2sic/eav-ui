import { NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TippyDirective } from '../../directives/tippy.directive';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-nav-item-list',
  templateUrl: './nav-item-list.component.html',
  styleUrl: './nav-item-list.component.scss',
  standalone: true,
  imports: [
    MatIconModule,
    NgClass,
    RouterLink,
    RouterLinkActive,
    TippyDirective,
    NgIf,
  ],
})
export class NavItemListComponent implements OnInit {
  @Input() navItem!: NavItem;
  isOpenMenu = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.openChildMenu();
  }

  openChildMenu() {
    if (this.navItem.child?.length) {

      const urlSegments = this.router.url.split('/');
      const matchingChild = this.navItem.child.find(child => urlSegments.includes(child.path));

      if (matchingChild)
        this.isOpenMenu = true;
    }
  }
}
