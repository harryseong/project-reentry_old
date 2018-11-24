import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FirestoreService} from '../../../../shared/firestore/firestore.service';

@Component({
  selector: 'app-org-create',
  templateUrl: './org-create.component.html',
  styleUrls: ['./org-create.component.css']
})
export class OrgCreateComponent implements OnInit {
  orgForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    services: new FormControl([]),
    languages: new FormControl([]),
    address: new FormGroup({
      streetAddress1: new FormControl(''),
      streetAddress2: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl('Michigan'),
      zipCode: new FormControl(''),
    }),
    website: new FormControl(''),
    contact: new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
    }),
    hours: new FormControl(''),
    payment: new FormControl(''),
    transportation: new FormControl(''),
    seniorRequirements: new FormControl(''),
    eligibilityRequirements: new FormControl(''),
    bringWithYou: new FormControl('')
  });
  serviceList: any[] = [];
  languageList: any[] = [];
  paymentOptions = ['Free', 'Insurance', 'Medicaid', 'Sliding Scale'];

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.firestoreService.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.firestoreService._sort(rsp, 'language'));
    this.firestoreService.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.firestoreService._sort(rsp, 'service'));
  }

  onSubmit() {
    alert(JSON.stringify(this.orgForm.value));
    this.firestoreService.organizations.add(this.orgForm.value);
    this.orgForm.reset();
  }
}
