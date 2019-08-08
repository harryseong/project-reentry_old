import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {SnackBarService} from '../snackBar/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    user$ = new BehaviorSubject(null);
    isAdmin = false;

    constructor(private afAuth: AngularFireAuth,
                private db: AngularFirestore,
                private router: Router,
                private snackBarService: SnackBarService) {
      afAuth.user.subscribe(user => {
          this.user$.next(user);
          const usersRef = this.db.collection('users').doc(user.email).ref;
          usersRef.get()
              .then(doc => {
                  if (doc.exists) {
                      this.isAdmin = doc.data().role === 'admin';
                      console.log('User, ' + user.email + ' found. User is ' + (this.isAdmin ? '' : 'not ') + 'an admin.');
                  } else {
                      this.db.collection('users').doc(user.email).set({uid: user.uid, email: user.email, role: 'user'});
                      this.isAdmin = false;
                      console.log('User, ' + user.email + ' newly saved in Firestore.');
                  }
              })
              .catch(err => console.error(err));
      });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
        .then(() => this.confirmLoginStatus());
  }

  logout() {
    this.afAuth.auth.signOut()
        .then(() => this.confirmLoginStatus());
    this.isAdmin = false;
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
