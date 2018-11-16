import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FirestoreService} from '../../shared/firestore.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {
  orgForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    services: new FormControl(''),
    languages: new FormControl(''),
    address: new FormGroup({
      streetAddress1: new FormControl(''),
      streetAddress2: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zipCode: new FormControl(''),
    }),
    website: new FormControl('https://www.'),
    contact: new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
    })
  });
  serviceList: any[] = [];
  languageList: any[] = [];

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.firestoreService.languages.valueChanges().subscribe(rsp => this.languageList = rsp);
    this.firestoreService.services.valueChanges().subscribe(rsp => this.serviceList = rsp);
  }

  onSubmit() {
    alert(JSON.stringify(this.orgForm.value));
    this.firestoreService.organizations.add(this.orgForm.value);
    this.orgForm.reset();
  }

}
