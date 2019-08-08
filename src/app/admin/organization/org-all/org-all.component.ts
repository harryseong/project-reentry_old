import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {FirestoreService} from '../../../../shared/services/firestore/firestore.service';
import {Router} from '@angular/router';
import * as papa from 'papaparse';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SnackBarService} from '../../../../shared/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-org-all',
  templateUrl: './org-all.component.html',
  styleUrls: ['./org-all.component.scss']
})
export class OrgAllComponent implements OnInit {
  displayedColumns: string[] = ['name', 'services', 'city'];
  dataSource: MatTableDataSource<any>;
  orgList: any[] = [];
  serviceList: any[] = [];
  languageList: any[] = [];

  constructor(private db: FirestoreService,
              private router: Router,
              private snackBarService: SnackBarService) {}

  ngOnInit() {
    this.db.organizations.valueChanges().subscribe(
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

    this.db.languages.valueChanges()
      .subscribe(rsp => this.languageList = this.db._sort(rsp, 'language'));
    this.db.services.valueChanges()
      .subscribe(rsp => this.serviceList = this.db._sort(rsp, 'service'));
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
        this.snackBarService.openSnackBar('Error: File was 0kb.', 'OK');
      }
    } else {
      this.snackBarService.openSnackBar('Error: Uploaded file did not have the ".csv" extension.', 'OK');
    }
  }

  processCsv(file: File) {
    let orgCount = 0;
    const snackBarService = this.snackBarService;
    papa.parse(file, {
      complete: function (results) {
        results.data.shift();
        const csvOrgs = results.data;
        for (const csvOrg of csvOrgs) {
          console.log(csvOrg);
          orgCount++;
        }
        snackBarService.openSnackBar('Successfully uploaded file. ' + orgCount + ' orgs uploaded.', 'OK');
      }
    });
  }

  createSaveOrg(csvOrg) {

  }
}
