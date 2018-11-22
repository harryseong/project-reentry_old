import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../shared/firestore/firestore.service';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ErrorStateMatcher} from '@angular/material';

/** Error when invalid control is dirty, touched, or submitted. */
export class SubscribeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  countyList: any[] = [];
  filteredCounties: Observable<string[]>;
  serviceList: any[] = [];
  homeForm = new FormGroup({
    county: new FormControl('', [Validators.required]),
    services: new FormControl([], [Validators.required]),
  });

  constructor(private afAuth: AngularFireAuth, private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.firestoreService.counties.valueChanges().subscribe(counties => this.countyList = this._sort(counties, 'county'));
    this.firestoreService.services.valueChanges().subscribe(services => this.serviceList = this._sort(services, 'service'));
  }

  _sort(array: string[], parameter: string): string[] {
    return Object.assign([], array)
      .sort((a, b) => (a[parameter] > b[parameter]) ? 1 : ((b[parameter] > a[parameter] ? -1 : 0)));
  }
}