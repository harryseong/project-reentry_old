import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../../environments/environment';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private afAuth: AngularFireAuth) { }

  ngOnInit() {}

}
