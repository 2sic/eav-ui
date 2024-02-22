import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

    if (this.navItem.child?.length) {
      this.router.events.subscribe(value => {
        const currentRoute = this.router.url.toString();
        const isOpen = this.navItem.child.some(child => currentRoute.includes(child.path));
        this.isOpenMenu = isOpen;
      });
    }
  }
}
