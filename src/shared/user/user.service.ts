import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase';
import {AngularFirestore} from '@angular/fire/firestore';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
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
        this.isAdmin = false;
        return null;
      } else {
        // If logged in, check that the user exists in the firestore users collection.
        const usersRef = this.db.collection('users').ref;
        const query = usersRef.where('email', '==', authState.email);
        query.get().then(response => {
          // If the user does not exist in the Firestore "users" collection, create a new user document with the uid as the document id.
          // Set email retrieved from the authState and set role to "user" by default.
          if (response.docs.length === 0) {
            this.db.collection('users').doc(authState.uid).set(
              {
                email: authState.email,
                role: 'user'
              }
            );
            this.isAdmin = false;
          } else {
            this.db.collection('users').doc(authState.uid).ref
              .onSnapshot(doc => this.isAdmin = doc.data().role === 'admin' ? true : false);
          }
        });
        return authState;
      }
    })
  );
  isAdmin = false;

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore, public snackBar: MatSnackBar, private router: Router) {
    this.isLoggedIn();
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
    this.router.navigateByUrl('');
    this.isAdmin = false;
  }

  isLoggedIn() {
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
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'bottom'
    });
  }
}
