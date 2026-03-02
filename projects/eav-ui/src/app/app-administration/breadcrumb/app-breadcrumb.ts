import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { BreadcrumbComponent, BreadcrumbItemDirective } from 'xng-breadcrumb';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './app-breadcrumb.html',
    imports: [
    BreadcrumbComponent,
    BreadcrumbItemDirective,
    MatIcon
],
})
export class AppBreadcrumbComponent { }