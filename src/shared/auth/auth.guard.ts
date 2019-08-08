import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserService} from '../services/user/user.service';
import {FirestoreService} from '../services/firestore/firestore.service';
import {take} from 'rxjs/operators';
import {switchMap} from 'rxjs-compat/operator/switchMap';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    isAdmin$ = new BehaviorSubject(null);

  constructor(private db: FirestoreService,
              private router: Router,
              private userService: UserService) {
      this.isAdmin$ = userService.isAdmin$;
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this.isAdmin$.toPromise()
          .then(isAdmin => {
              if (isAdmin === true) {
                  return true;
              } else if (isAdmin === false) {
                  console.warn('The current user is not an admin and therefore rerouted back home.');
                  this.router.navigate(['/']);
                  return false;
              }
          });
  }
}
