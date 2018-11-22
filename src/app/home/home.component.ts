import { Component, OnInit } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirestoreService} from '../../shared/firestore/firestore.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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
    county: new FormControl(''),
    services: new FormControl([]),
  });

  constructor(private afAuth: AngularFireAuth, private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.firestoreService.counties.valueChanges().subscribe(counties => this.countyList = this._sort(counties, 'county'));
    this.firestoreService.services.valueChanges().subscribe(services => this.serviceList = this._sort(services, 'service'));

    this.filteredCounties = this.homeForm.get('county').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countyList.filter(county => county.county.toLowerCase().includes(filterValue));
  }

  _sort(array: string[], parameter: string): string[] {
    return Object.assign([], array)
      .sort((a, b) => (a[parameter] > b[parameter]) ? 1 : ((b[parameter] > a[parameter] ? -1 : 0)));
  }
}
