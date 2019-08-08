import { Component, OnInit } from '@angular/core';
import {MatTableDataSource, Sort} from '@angular/material';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {Router} from '@angular/router';
import {UserService} from '../../../../shared/services/user/user.service';
import * as papa from 'papaparse';
import {forEach} from '@angular/router/src/utils/collection';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-org-all',
  templateUrl: './org-all.component.html',
  styleUrls: ['./org-all.component.scss']
})
export class OrgAllComponent implements OnInit {
  displayedColumns: string[] = ['name', 'services', 'city'];
  dataSource: MatTableDataSource<any>;
  orgList: any[] = [];

  orgForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    services: new FormControl([], [Validators.required]),
    specifyHours: new FormControl(false),
    hours: new FormGroup({
      Sunday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Monday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Tuesday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Wednesday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Thursday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Friday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
      Saturday: new FormGroup({
        open: new FormControl(false),
        start: new FormControl(''),
        end: new FormControl('')
      }),
    }),
    address: new FormGroup({
      streetAddress1: new FormControl('', [Validators.required]),
      streetAddress2: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('Michigan', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]),
      gpsCoords: new FormGroup({
        lat: new FormControl(''),
        lng: new FormControl(''),
      })
    }),
    website: new FormControl('', [
      Validators.pattern('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')
    ]),
    contact: new FormGroup({
      name: new FormControl(''),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl('', [Validators.pattern('^\\(?([0-9]{3})\\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$')]),
    }),
    languages: new FormControl([]),
    payment: new FormControl(''),
    transportation: new FormControl(''),
    seniorRequirements: new FormControl(''),
    eligibilityRequirements: new FormControl(''),
    bringWithYou: new FormControl(''),
    additionalNotes: new FormControl('')
  });
  serviceList: any[] = [];
  languageList: any[] = [];
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  paymentOptions = ['Free', 'Insurance', 'Medicaid', 'Sliding Scale'];

  constructor(private firestoreService: FirestoreService, private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.firestoreService.organizations.valueChanges().subscribe(
      rsp => {
        this.orgList = rsp;
        this.dataSource = new MatTableDataSource(rsp);
        // Set custom filter predicate for searching nested fields of organization objects.
        this.dataSource.filterPredicate = (data, filter: string)  => {
          const accumulator = (currentTerm, key) => {
            return this.nestedFilterCheck(currentTerm, data, key);
          };
          const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
          // Transform the filter by converting it to lowercase and removing whitespace.
          const transformedFilter = filter.trim().toLowerCase();
          return dataStr.indexOf(transformedFilter) !== -1;
        };
      },
      error1 => console.error(error1),
      () => {}
    );

    this.firestoreService.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.firestoreService._sort(rsp, 'language'));
    this.firestoreService.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.firestoreService._sort(rsp, 'service'));
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
        case 'city':
          return this.compare(a.address.city, b.address.city, isAsc);
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

  nestedFilterCheck(search, data, key) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else {
      search += data[key];
    }
    return search;
  }

  viewOrg(orgName: string) {
    alert(orgName);

    this.router.navigate(['/admin/organization/view/', {name: orgName}]);
  }

  uploadOrgCsv(files: FileList) {
    console.log(files);
    const file = files[0];
    const fileExtension = file.name.split('.').pop();
    if (fileExtension === 'csv') {

      if (file.size > 0) {
        this.processCsv(file);
      } else {
        this.userService.openSnackBar('Error: File was 0kb.', 'OK');
      }
    } else {
      this.userService.openSnackBar('Error: Uploaded file did not have the ".csv" extension.', 'OK');
    }
  }

  processCsv(file: File) {
    let orgCount = 0;
    const userService = this.userService;
    papa.parse(file, {
      complete: function (results) {
        results.data.shift();
        const csvOrgs = results.data;
        for (const csvOrg of csvOrgs) {
          console.log(csvOrg);
          orgCount++;
        }
        userService.openSnackBar('Successfully uploaded file. ' + orgCount + ' orgs uploaded.', 'OK');
      }
    });
  }

  createSaveOrg(csvOrg) {

  }
}
