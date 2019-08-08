import { Component, OnInit } from '@angular/core';
import {UserService} from '../../shared/services/user/user.service';
import { NavigationEnd, Router} from '@angular/router';
import {Location} from '@angular/common';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    user$ = null;
    route = '';

    constructor(private location: Location,
                private router: Router,
                private userService: UserService) {
        this.user$ = userService.user$;
        router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(val => this.route = location.path());
    }

  ngOnInit() {}
}
