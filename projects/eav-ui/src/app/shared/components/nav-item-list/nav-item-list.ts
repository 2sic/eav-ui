import { NgClass } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FeatureIconIndicatorComponent } from "../../../features/icons/feature-icon-indicator";
import { TippyDirective } from '../../directives/tippy.directive';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-nav-item-list',
  templateUrl: './nav-item-list.html',
  styleUrl: './nav-item-list.scss',
  imports: [
    MatIconModule,
    NgClass,
    RouterLink,
    RouterLinkActive,
    TippyDirective,
    FeatureIconIndicatorComponent
]
})
export class NavItemListComponent implements OnInit {
  navItem = input<NavItem>();
  isOpenMenu = false;

  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.#openChildMenu();
    this.router.events.subscribe(() => this.#openChildMenu());
  }

  #openChildMenu() {
    if (!this.navItem().child?.length)
      return;

    const urlSegments = this.router.url.split('/');
    const matchingChild = this.navItem().child.find(child => urlSegments.includes(child.path));
    if (matchingChild)
      this.isOpenMenu = true;
  }
}
