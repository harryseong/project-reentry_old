import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../shared/services/user/user.service';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  animations: [
    trigger('transitionAnimations', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class AdminLoginComponent implements OnInit {
    user$ = null;
    isAdmin$ = null;
  constructor(private userService: UserService) {
      this.user$ = userService.user$;
      this.isAdmin$ = userService.isAdmin$;
  }

  ngOnInit() {}

  login() {
      this.userService.login();
  }
}
