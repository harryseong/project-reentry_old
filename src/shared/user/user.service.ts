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
        this.db.collection('admins').doc(authState.uid).ref.onSnapshot(doc => this.isAdmin = doc.data().isAdmin);
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
