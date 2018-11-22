import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FirestoreService} from '../../../shared/firestore/firestore.service';
import {MatDialog, MatTableDataSource, Sort} from '@angular/material';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {
  displayedColumns: string[] = ['name', 'languages', 'services', 'website'];
  dataSource: MatTableDataSource<any>;
  orgList: any[] = [];
  orgForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    services: new FormControl([]),
    languages: new FormControl([]),
    address: new FormGroup({
      streetAddress1: new FormControl(''),
      streetAddress2: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zipCode: new FormControl(''),
    }),
    website: new FormControl(''),
    contact: new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
    })
  });
  serviceList: any[] = [];
  languageList: any[] = [];

  constructor(private firestoreService: FirestoreService, public dialog: MatDialog) { }

  ngOnInit() {
    this.firestoreService.languages.valueChanges().subscribe(rsp => this.languageList = rsp);
    this.firestoreService.services.valueChanges().subscribe(rsp => this.serviceList = rsp);
    this.firestoreService.organizations.valueChanges().subscribe(rsp => {
      this.orgList = rsp;
      this.dataSource = new MatTableDataSource(rsp);
    });
  }

  onSubmit() {
    alert(JSON.stringify(this.orgForm.value));
    this.firestoreService.organizations.add(this.orgForm.value);
    this.orgForm.reset();
  }

  sortData(sort: Sort) {
    const data = this.orgList.slice();
    if (!sort.active || sort.direction === '') {
      this.orgList = data;
      return;
    }

    this.orgList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'website':
          return this.compare(a.website, b.website, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource = new MatTableDataSource(this.orgList);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
