import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FirestoreService} from '../../shared/firestore.service';

@Component({
  selector: 'app-county',
  templateUrl: './county.component.html',
  styleUrls: ['./county.component.css']
})
export class CountyComponent implements OnInit {
  countyForm = new FormGroup({
    county: new FormControl('')
  });
  countyList: any[] = [];

  constructor(private firestoreService: FirestoreService) {
    this.firestoreService.counties.valueChanges().subscribe(rsp => this.countyList = rsp);
  }

  ngOnInit() {
  }

  onSubmit() {
    this.firestoreService.counties.add(this.countyForm.value);
    this.countyForm.reset();
  }

}
