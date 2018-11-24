import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  organizations: AngularFirestoreCollection<any>;
  services: AngularFirestoreCollection<any>;
  languages: AngularFirestoreCollection<any>;
  counties: AngularFirestoreCollection<any>;
  users: AngularFirestoreCollection<any>;

  constructor(private db: AngularFirestore) {
    this.organizations = db.collection<any>('organizations');
    this.services = db.collection<any>('services');
    this.counties = db.collection<any>('counties');
    this.languages = db.collection<any>('languages');
    this.users = db.collection<any>('users');
  }

  _sort(array: string[], parameter: string): string[] {
    return Object.assign([], array)
      .sort((a, b) => (a[parameter] > b[parameter]) ? 1 : ((b[parameter] > a[parameter] ? -1 : 0)));
  }
}
