import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../../environments/environment';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../shared/firestore/firestore.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  serviceList: any[] = [];
  homeForm = new FormGroup({
    services: new FormControl([]),
    zip: new FormControl(''),
  });

  constructor(private afAuth: AngularFireAuth, private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.firestoreService.services.valueChanges().subscribe(services => this.serviceList = services);
  }

}
