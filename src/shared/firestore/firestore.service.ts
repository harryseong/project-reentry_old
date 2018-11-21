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

  constructor(private db: AngularFirestore) {
    this.organizations = db.collection<any>('organizations');
    this.services = db.collection<any>('services');
    this.languages = db.collection<any>('languages');
    this.counties = db.collection<any>('counties');
  }
}
