import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {SnackBarService} from '../snack-bar/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    user$ = new BehaviorSubject(null);
    isAdmin$ = new BehaviorSubject(null);

    constructor(private afAuth: AngularFireAuth,
                private router: Router,
                private snackBarService: SnackBarService) {
      afAuth.user.subscribe(user => this.user$.next(user));
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
        .then(() => this.confirmLoginStatus());
  }

  logout() {
    this.afAuth.auth.signOut()
        .then(() => this.confirmLoginStatus());
    this.isAdmin$.next(false);
    this.router.navigateByUrl('');
  }

  confirmLoginStatus() {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.snackBarService.openSnackBar('You are logged in.', 'OK', 4000);
      } else {
        this.snackBarService.openSnackBar('You are now logged out.', 'OK', 4000);
      }
    });
  }


}
