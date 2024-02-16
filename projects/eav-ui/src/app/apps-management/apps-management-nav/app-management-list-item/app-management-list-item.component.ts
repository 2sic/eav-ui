import { Component, Input, OnInit } from '@angular/core';
import { NavItem } from '../apps-management-nav.component';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-app-management-list-item',
  templateUrl: './app-management-list-item.component.html',
  styleUrl: './app-management-list-item.component.scss'
})
export class AppManagementListItemComponent implements OnInit {
  @Input() item!: NavItem;
  isOpenMenu = false;

  constructor(private router: Router,) { }


  ngOnInit(): void {

    if (this.item.child?.length) {
      this.router.events.subscribe(value => {
        const currentRoute = this.router.url.toString();
        const isOpen = this.item.child.some(child => currentRoute.includes(child.path));
        this.isOpenMenu = isOpen;
      });
    }
  }
}
