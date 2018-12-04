import { Component, OnInit } from '@angular/core';
import {FirestoreService} from '../../shared/firestore/firestore.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatTableDataSource, Sort} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  animations: [
    trigger('transitionAnimations', [
      transition('* => fadeIn', [
        style({ opacity: 0 }),
        animate(750, style({ opacity: 1 })),
      ])
    ])
  ]
})
export class ServicesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'languages', 'services', 'website', 'city'];
  dataSource: MatTableDataSource<any>;
  orgList: any[] = [];
  serviceType: string;
  transition = '';

  constructor(private firestoreService: FirestoreService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.serviceType = this.route.snapshot.params['service'];
    this.firestoreService.organizations.valueChanges().subscribe(
      rsp => {
        this.orgList = rsp.filter(org => org.services.includes(this.serviceType));
        this.dataSource = new MatTableDataSource(this.orgList);
        this.transition = 'fadeIn';
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
}
