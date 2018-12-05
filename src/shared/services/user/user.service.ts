import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  authState = this.afAuth.authState.pipe(
    map(authState => {
      if (!authState) {
        this.isLoggedIn = false;
        this.isAdmin = false;
        console.warn('No user is currently logged in.');
      } else {
        // If logged in, check that the user exists in the firestore users collection.
        console.log('A user is logged in.');
        this.isLoggedIn = true;
        const usersRef = this.db.collection('users').doc(authState.email).ref
          .onSnapshot(doc => {
            // If the user does not exist, create a firestore user doc and set role to "user" by default.
            if (!doc.exists) {
              this.db.collection('users').doc(authState.email).set(
                {
                  uid: authState.uid,
                  email: authState.email,
                  role: 'user'
                });
              this.isAdmin = false;
              console.warn('User, ' + authState.email + ' did not exist in the Firestore.');
            } else {
              // If the user does exist, check if the user is an admin.
              this.isAdmin = doc.data().role === 'admin';
              console.log('User, ' + authState.email + ' does exist. User is ' + (this.isAdmin ? '' : 'not ') + 'an admin.');
            }
          });
        return authState;
      }
    })
  );
  isAdmin = false;
  isLoggedIn = false;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore, private snackBar: MatSnackBar, private router: Router,
              private zone: NgZone) {}

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(() => this.confirmLoginStatus());
  }

  logout() {
    this.afAuth.auth.signOut().then(() => this.confirmLoginStatus());
    this.isAdmin = false;
    this.router.navigateByUrl('');
  }

  confirmLoginStatus() {
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.openSnackBar('You are logged in.', 'OK');
      } else {
        this.openSnackBar('You have logged out.', 'OK');
      }
    });
  }

  // Function for opening snackbar.
  openSnackBar(message: string, action: string) {
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        duration: 3500,
        verticalPosition: 'bottom'
      });
    });
  }
}