import { Component, Input, OnInit } from '@angular/core';
import { NavItem } from '../apps-management-nav.component';
import { NavigationEnd, Router } from '@angular/router';

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
      this.router.events.subscribe((event: object) => {
        if (
          event instanceof NavigationEnd &&
          this.item?.child?.some((child) => {
            const x = event
            x.url.includes(child.path)
            console.log(x.url)
            return (
              Array.isArray(child.path) &&
              child.path.includes(event.urlAfterRedirects.split('/')[1])
            );
          })
        ) {
          this.isOpenMenu = true;
        }
      });
    }
  }
}
