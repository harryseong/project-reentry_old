import { Component, OnInit } from '@angular/core';
import {FirestoreService} from '../../../shared/firestore/firestore.service';
import {MatDialog, MatTableDataSource, Sort} from '@angular/material';
import {Router} from '@angular/router';

export interface OrgAbbrev {
  name: string;
  languages: string[];
  services: string[];
  website: string;
  address: {
    city: string;
  };
}

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {
  displayedColumns: string[] = ['name', 'languages', 'services', 'website', 'city'];
  dataSource: MatTableDataSource<any>;
  orgList: any[] = [];

  constructor(private firestoreService: FirestoreService, private router: Router) {}

  ngOnInit() {
    this.firestoreService.organizations.valueChanges().subscribe(
      rsp => {
        this.orgList = rsp;
        this.dataSource = new MatTableDataSource(rsp);
      },
      error1 => console.error(error1),
      () => {
        this.dataSource.filterPredicate = (data, filter: string)  => {
          const accumulator = (currentTerm, key) => {
            return key === 'orderInfo' ? currentTerm + data.orderInfo.type : currentTerm + data[key];
          };
          const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
          // Transform the filter by converting it to lowercase and removing whitespace.
          const transformedFilter = filter.trim().toLowerCase();
          return dataStr.indexOf(transformedFilter) !== -1;
        };
      }
    );
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

  viewOrg(orgName: string) {
    alert(orgName);

    this.router.navigate(['/admin/organization/view/', {name: orgName}]);
  }
}
